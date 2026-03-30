"use client";

import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/lib/auth-context";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CommentSection } from "@/components/comment-section";
import { ImageSlideshow } from "@/components/image-slideshow";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PostPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { user } = useAuth();

  const {
    data: post,
    isLoading,
    error,
  } = trpc.post.getBySlug.useQuery({ slug });

  const deletePost = trpc.post.delete.useMutation({
    onSuccess: () => router.push("/"),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
        <p className="mt-4 text-sm">Loading post...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <p className="text-4xl font-bold">404</p>
        <p className="mt-2 text-muted-foreground">
          This post doesn&apos;t exist or has been deleted.
        </p>
        <Link
          href="/"
          className="mt-6 text-sm font-medium underline underline-offset-4 hover:text-foreground/80">
          &larr; Back to Home
        </Link>
      </div>
    );
  }

  return (
    <article className="space-y-8">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        &larr; All posts
      </Link>

      {/* Post header */}
      <div>
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            {post.title}
          </h1>
          {user && post.userId === user.id && (
            <Button
              variant="destructive"
              size="sm"
              disabled={deletePost.isPending}
              onClick={() => {
                if (confirm("Delete this post? This cannot be undone.")) {
                  deletePost.mutate({ id: post.id });
                }
              }}>
              {deletePost.isPending ? "Deleting..." : "Delete post"}
            </Button>
          )}
        </div>
        <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
          <Badge variant="secondary">{post.author}</Badge>
          <time>
            {format(new Date(post.createdAt), "MMMM d, yyyy 'at' h:mm a")}
          </time>
        </div>
      </div>

      <Separator />

      {/* Post images */}
      {post.imageUrls && post.imageUrls.length > 0 && (
        <ImageSlideshow urls={post.imageUrls} className="max-h-125" />
      )}

      {/* Post content */}
      <div className="prose prose-neutral max-w-none text-foreground/90 whitespace-pre-wrap leading-relaxed">
        {post.content}
      </div>

      <Separator />

      {/* Comments */}
      <CommentSection postId={post.id} />

      <Separator />

      {/* Post footer */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="text-sm font-medium text-muted-foreground hover:text-foreground">
          &larr; All Posts
        </Link>
        <Link
          href="/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
          Write a Post
        </Link>
      </div>
    </article>
  );
}
