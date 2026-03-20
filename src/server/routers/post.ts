import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { db } from "../db";
import { posts } from "../db/schema";
import { desc, eq } from "drizzle-orm";

export const postRouter = router({
  getAll: publicProcedure.query(async () => {
    return db.select().from(posts).orderBy(desc(posts.createdAt));
  }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const result = await db
        .select()
        .from(posts)
        .where(eq(posts.slug, input.slug))
        .limit(1);
      return result[0] ?? null;
    }),

  create: publicProcedure
    .input(
      z.object({
        title: z.string().min(1).max(256),
        content: z.string().min(1),
        author: z.string().min(1).max(128).default("Anonymous"),
        excerpt: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const slug = input.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const [post] = await db
        .insert(posts)
        .values({
          title: input.title,
          slug,
          content: input.content,
          author: input.author,
          excerpt: input.excerpt ?? input.content.substring(0, 200) + "...",
        })
        .returning();

      return post;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(posts).where(eq(posts.id, input.id));
      return { success: true };
    }),
});
