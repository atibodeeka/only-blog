"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  const { data: posts, isLoading, error } = trpc.post.getAll.useQuery();

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Latest Posts</h1>
        <p className="mt-2 text-muted-foreground">
          Thoughts, ideas, and stories from the community.
        </p>
      </div>

      <Separator />

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <p className="mt-4 text-sm">Loading posts...</p>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-6 text-center">
          <p className="font-medium text-destructive">Failed to load posts</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Make sure your DATABASE_URL is set in .env and the database is
            migrated.
          </p>
        </div>
      )}

      {posts && posts.length === 0 && (
        <div className="flex flex-col items-center py-20 text-center">
          <p className="text-lg font-medium">No posts yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Be the first to{" "}
            <Link
              href="/new"
              className="font-medium text-foreground underline underline-offset-4 hover:text-foreground/80">
              write a post
            </Link>
            .
          </p>
        </div>
      )}

      <div className="space-y-1">
        {posts?.map((post) => (
          <article
            key={post.id}
            className="group rounded-lg border bg-card p-6 transition-colors hover:bg-accent/50">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-1">
                <Link
                  href={`/post/${post.slug}`}
                  className="text-xl font-semibold tracking-tight group-hover:underline group-hover:underline-offset-4">
                  {post.title}
                </Link>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{post.author}</span>
                  <span>&middot;</span>
                  <time>{format(new Date(post.createdAt), "MMM d, yyyy")}</time>
                </div>
              </div>
              <Badge variant="secondary" className="shrink-0 text-xs">
                {format(new Date(post.createdAt), "MMM yyyy")}
              </Badge>
            </div>

            {post.excerpt && (
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                {post.excerpt}
              </p>
            )}

            <div className="mt-4">
              <Link
                href={`/post/${post.slug}`}
                className="text-sm font-medium text-foreground underline-offset-4 hover:underline">
                Read more &rarr;
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
