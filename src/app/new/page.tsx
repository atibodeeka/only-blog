"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/lib/auth-context";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ImageUpload } from "@/components/image-upload";
import { LoginDialog } from "@/components/auth-dialog";
import Link from "next/link";

export default function NewPostPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loginOpen, setLoginOpen] = useState(false);

  const createPost = trpc.post.create.useMutation({
    onSuccess: (data) => {
      router.push(`/post/${data.slug}`);
    },
  });

  if (authLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center py-20 text-center gap-4">
        <p className="text-lg font-semibold">Sign in to write a post</p>
        <p className="text-sm text-muted-foreground">
          You need to be logged in to create a post.
        </p>
        <Button onClick={() => setLoginOpen(true)}>Sign in</Button>
        <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPost.mutate({
      title,
      content,
      excerpt: excerpt || undefined,
      imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          &larr; All posts
        </Link>

        <h1 className="mt-4 text-3xl font-bold tracking-tight">
          Write a new post
        </h1>
        <p className="mt-2 text-muted-foreground">
          Posting as{" "}
          <span className="font-medium text-foreground">
            {user.displayName ?? user.username}
          </span>
          .
        </p>
      </div>

      <Separator />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter your post title"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="excerpt">
            Excerpt{" "}
            <span className="text-muted-foreground font-normal">
              (optional)
            </span>
          </Label>
          <Input
            id="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="A short summary of your post"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your blog post here..."
            required
            rows={14}
            className="resize-y"
          />
        </div>

        <div className="space-y-2">
          <Label>
            Images{" "}
            <span className="text-muted-foreground font-normal">
              (optional, up to 4)
            </span>
          </Label>
          <ImageUpload value={imageUrls} onChange={setImageUrls} />
        </div>

        {createPost.error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
            <p className="text-sm text-destructive">
              {createPost.error.message}
            </p>
          </div>
        )}

        <Separator />

        <div className="flex items-center justify-end gap-3">
          <Link
            href="/"
            className="rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent">
            Cancel
          </Link>
          <Button type="submit" disabled={createPost.isPending}>
            {createPost.isPending ? "Publishing..." : "Publish"}
          </Button>
        </div>
      </form>
    </div>
  );
}
