import { router } from "../trpc";
import { postRouter } from "./post";
import { authRouter } from "./auth";
import { commentRouter } from "./comment";

export const appRouter = router({
  post: postRouter,
  auth: authRouter,
  comment: commentRouter,
});

export type AppRouter = typeof appRouter;
