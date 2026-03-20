"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { LoginDialog, RegisterDialog } from "@/components/auth-dialog";

export function UserMenu() {
  const { user, isLoading } = useAuth();
  const utils = trpc.useUtils();
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  const logout = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
    },
  });

  if (isLoading) return null;

  if (!user) {
    return (
      <>
        <Button variant="ghost" size="sm" onClick={() => setLoginOpen(true)}>
          Sign In
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setRegisterOpen(true)}>
          Sign Up
        </Button>
        <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
        <RegisterDialog open={registerOpen} onOpenChange={setRegisterOpen} />
      </>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium">
        {user.displayName || user.username}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => logout.mutate()}
        disabled={logout.isPending}>
        Sign Out
      </Button>
    </div>
  );
}
