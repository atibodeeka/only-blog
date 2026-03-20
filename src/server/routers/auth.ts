import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { db } from "../db";
import { users, sessions } from "../db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword } from "../auth";
import { randomUUID } from "crypto";
import { TRPCError } from "@trpc/server";

const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

function sessionCookie(token: string, maxAge: number) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `session_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

export const authRouter = router({
  me: publicProcedure.query(({ ctx }) => {
    return ctx.user;
  }),

  register: publicProcedure
    .input(
      z.object({
        username: z.string().min(3).max(64),
        email: z.string().email().max(256),
        password: z.string().min(6).max(128),
        displayName: z.string().max(128).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const existingUsername = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.username, input.username))
        .limit(1);
      if (existingUsername.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Username already taken",
        });
      }

      const existingEmail = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);
      if (existingEmail.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email already registered",
        });
      }

      const passwordHash = await hashPassword(input.password);
      const [user] = await db
        .insert(users)
        .values({
          username: input.username,
          email: input.email,
          passwordHash,
          displayName: input.displayName || input.username,
        })
        .returning();

      const token = randomUUID();
      const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);
      await db.insert(sessions).values({ userId: user.id, token, expiresAt });

      ctx.setCookie(sessionCookie(token, SESSION_MAX_AGE));

      return {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
      };
    }),

  login: publicProcedure
    .input(
      z.object({
        username: z.string(),
        password: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.username, input.username))
        .limit(1);

      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid username or password",
        });
      }

      const valid = await verifyPassword(user.passwordHash, input.password);
      if (!valid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid username or password",
        });
      }

      const token = randomUUID();
      const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);
      await db.insert(sessions).values({ userId: user.id, token, expiresAt });

      ctx.setCookie(sessionCookie(token, SESSION_MAX_AGE));

      return {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
      };
    }),

  logout: protectedProcedure.mutation(async ({ ctx }) => {
    await db.delete(sessions).where(eq(sessions.userId, ctx.user.id));
    ctx.setCookie(sessionCookie("", 0));
    return { success: true };
  }),
});
