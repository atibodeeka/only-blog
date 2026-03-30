import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { db } from "../db";
import { posts } from "../db/schema";
import { desc, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

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

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(256),
        content: z.string().min(1),
        excerpt: z.string().optional(),
        imageUrls: z.array(z.string().min(1)).max(4).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
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
          author: ctx.user.displayName ?? ctx.user.username,
          excerpt: input.excerpt ?? input.content.substring(0, 200) + "...",
          imageUrls: input.imageUrls ?? null,
          userId: ctx.user.id,
        })
        .returning();

      return post;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const [post] = await db
        .select()
        .from(posts)
        .where(eq(posts.id, input.id))
        .limit(1);

      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }

      if (post.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only delete your own posts",
        });
      }

      await db.delete(posts).where(eq(posts.id, input.id));
      return { success: true };
    }),
});
