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
import Link from "next/link";

export default function NewPostPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");

  const createPost = trpc.post.create.useMutation({
    onSuccess: (data) => {
      router.push(`/post/${data.slug}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPost.mutate({
      title,
      author: author || user?.displayName || user?.username || "Anonymous",
      content,
      excerpt: excerpt || undefined,
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
          Share your thoughts with the world.
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
          <Label htmlFor="author">Author</Label>
          <Input
            id="author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder={
              user
                ? user.displayName || user.username
                : "Your name (leave blank for Anonymous)"
            }
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
