import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/routers/_app";
import { db } from "@/server/db";
import { users, sessions } from "@/server/db/schema";
import { eq, and, gt } from "drizzle-orm";

function parseCookies(header: string | null): Record<string, string> {
  if (!header) return {};
  return Object.fromEntries(
    header.split(";").map((c) => {
      const [key, ...val] = c.trim().split("=");
      return [key, val.join("=")];
    }),
  );
}

const handler = async (req: Request) => {
  const pendingCookies: string[] = [];
  const cookies = parseCookies(req.headers.get("cookie"));
  const sessionToken = cookies["session_token"];

  let user = null;
  if (sessionToken) {
    const result = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(
        and(
          eq(sessions.token, sessionToken),
          gt(sessions.expiresAt, new Date()),
        ),
      )
      .limit(1);
    user = result[0] ?? null;
  }

  const response = await fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => ({
      user,
      setCookie: (cookie: string) => pendingCookies.push(cookie),
    }),
  });

  if (pendingCookies.length > 0) {
    const newResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: new Headers(response.headers),
    });
    for (const cookie of pendingCookies) {
      newResponse.headers.append("Set-Cookie", cookie);
    }
    return newResponse;
  }

  return response;
};

export { handler as GET, handler as POST };
