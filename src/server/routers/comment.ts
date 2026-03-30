import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { db } from "../db";
import { comments, users } from "../db/schema";
import { eq, asc, or } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const commentRouter = router({
  getByPostId: publicProcedure
    .input(z.object({ postId: z.number() }))
    .query(async ({ input }) => {
      return db
        .select({
          id: comments.id,
          postId: comments.postId,
          userId: comments.userId,
          parentId: comments.parentId,
          content: comments.content,
          createdAt: comments.createdAt,
          username: users.username,
          displayName: users.displayName,
        })
        .from(comments)
        .innerJoin(users, eq(comments.userId, users.id))
        .where(eq(comments.postId, input.postId))
        .orderBy(asc(comments.createdAt));
    }),

  create: protectedProcedure
    .input(
      z.object({
        postId: z.number(),
        content: z.string().max(2000).default(""),
        parentId: z.number().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (
        !input.content.trim() &&
        (!input.imageUrls || input.imageUrls.length === 0)
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Comment must have text or at least one image",
        });
      }
      const [comment] = await db
        .insert(comments)
        .values({
          postId: input.postId,
          userId: ctx.user.id,
          parentId: input.parentId ?? null,
          content: input.content,
        })
        .returning();

      return comment;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const [comment] = await db
        .select()
        .from(comments)
        .where(eq(comments.id, input.id))
        .limit(1);

      if (!comment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comment not found",
        });
      }

      if (comment.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only delete your own comments",
        });
      }

      // Delete the comment and its direct replies
      await db
        .delete(comments)
        .where(or(eq(comments.id, input.id), eq(comments.parentId, input.id)));

      return { success: true };
    }),
});
