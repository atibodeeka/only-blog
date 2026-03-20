"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { LoginDialog } from "@/components/auth-dialog";
import { format } from "date-fns";

type CommentData = {
  id: number;
  postId: number;
  userId: number;
  parentId: number | null;
  content: string;
  createdAt: Date;
  username: string;
  displayName: string | null;
};

function CommentItem({
  comment,
  allComments,
  postId,
  currentUserId,
}: {
  comment: CommentData;
  allComments: CommentData[];
  postId: number;
  currentUserId: number | null;
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const utils = trpc.useUtils();

  const createComment = trpc.comment.create.useMutation({
    onSuccess: () => {
      utils.comment.getByPostId.invalidate({ postId });
      setReplyContent("");
      setReplyOpen(false);
    },
  });

  const deleteComment = trpc.comment.delete.useMutation({
    onSuccess: () => {
      utils.comment.getByPostId.invalidate({ postId });
    },
  });

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    createComment.mutate({
      postId,
      content: replyContent,
      parentId: comment.id,
    });
  };

  const replies = allComments.filter((c) => c.parentId === comment.id);

  return (
    <div className="space-y-3">
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">
              {comment.displayName || comment.username}
            </span>
            <span className="text-muted-foreground">&middot;</span>
            <time className="text-muted-foreground">
              {format(new Date(comment.createdAt), "MMM d, yyyy 'at' h:mm a")}
            </time>
          </div>
          <div className="flex items-center gap-2">
            {currentUserId && (
              <button
                onClick={() => setReplyOpen(!replyOpen)}
                className="text-xs text-muted-foreground hover:text-foreground">
                Reply
              </button>
            )}
            {currentUserId === comment.userId && (
              <button
                onClick={() => deleteComment.mutate({ id: comment.id })}
                className="text-xs text-destructive hover:text-destructive/80"
                disabled={deleteComment.isPending}>
                Delete
              </button>
            )}
          </div>
        </div>
        <p className="mt-2 text-sm whitespace-pre-wrap">{comment.content}</p>
      </div>

      {replyOpen && (
        <form onSubmit={handleReply} className="ml-6 space-y-2">
          <Textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write a reply..."
            rows={3}
            className="resize-y"
          />
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={createComment.isPending}>
              {createComment.isPending ? "Posting..." : "Reply"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setReplyOpen(false);
                setReplyContent("");
              }}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {replies.length > 0 && (
        <div className="ml-6 space-y-3">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              allComments={allComments}
              postId={postId}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentSection({ postId }: { postId: number }) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [loginOpen, setLoginOpen] = useState(false);
  const utils = trpc.useUtils();

  const { data: comments, isLoading } = trpc.comment.getByPostId.useQuery({
    postId,
  });

  const createComment = trpc.comment.create.useMutation({
    onSuccess: () => {
      utils.comment.getByPostId.invalidate({ postId });
      setContent("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    createComment.mutate({ postId, content });
  };

  const topLevel = comments?.filter((c) => !c.parentId) ?? [];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold tracking-tight">
        Comments {comments ? `(${comments.length})` : ""}
      </h2>

      {user ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a comment..."
            rows={4}
            className="resize-y"
          />
          {createComment.error && (
            <p className="text-sm text-destructive">
              {createComment.error.message}
            </p>
          )}
          <Button type="submit" disabled={createComment.isPending}>
            {createComment.isPending ? "Posting..." : "Post Comment"}
          </Button>
        </form>
      ) : (
        <div className="rounded-lg border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
          <button
            onClick={() => setLoginOpen(true)}
            className="font-medium text-foreground underline underline-offset-4 hover:text-foreground/80">
            Sign in
          </button>{" "}
          to leave a comment.
          <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
        </div>
      )}

      <Separator />

      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        </div>
      )}

      {topLevel.length === 0 && !isLoading && (
        <p className="py-4 text-center text-sm text-muted-foreground">
          No comments yet. Be the first to share your thoughts!
        </p>
      )}

      <div className="space-y-4">
        {topLevel.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            allComments={comments ?? []}
            postId={postId}
            currentUserId={user?.id ?? null}
          />
        ))}
      </div>
    </div>
  );
}
