import { getCloudflareContext } from "@opennextjs/cloudflare";
import { db } from "@/server/db";
import { sessions, users } from "@/server/db/schema";
import { eq, and, gt } from "drizzle-orm";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
]);
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

function parseCookies(header: string | null): Record<string, string> {
  if (!header) return {};
  return Object.fromEntries(
    header.split(";").map((c) => {
      const [key, ...val] = c.trim().split("=");
      return [key, val.join("=")];
    }),
  );
}

export async function POST(request: Request) {
  // Auth check
  const cookies = parseCookies(request.headers.get("cookie"));
  const sessionToken = cookies["session_token"];
  if (!sessionToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await db
    .select({ id: users.id })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(
      and(eq(sessions.token, sessionToken), gt(sessions.expiresAt, new Date())),
    )
    .limit(1);

  const user = result[0];
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return Response.json(
      { error: "File type not allowed. Only images and GIFs are accepted." },
      { status: 400 },
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return Response.json(
      { error: "File too large. Maximum size is 10 MB." },
      { status: 400 },
    );
  }

  const ext =
    file.name
      .split(".")
      .pop()
      ?.toLowerCase()
      .replace(/[^a-z0-9]/g, "") ?? "bin";
  const key = `uploads/${user.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const ctx = await getCloudflareContext<CloudflareEnv>();
  const bucket = ctx.env.BLOG_IMAGES;

  const arrayBuffer = await file.arrayBuffer();
  await bucket.put(key, arrayBuffer, {
    httpMetadata: { contentType: file.type },
  });

  const url = `/api/images/${encodeURIComponent(key)}`;
  return Response.json({ url }, { status: 201 });
}
