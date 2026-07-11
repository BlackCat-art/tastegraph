"use client";

import { useEffect, useState } from "react";

/**
 * AuthChip — 顶部右上角登录态显示
 *
 * State:
 * - user: 当前用户(从 /api/v1/auth/me 拿)
 * - loading: 初次加载中(避免 layout shift)
 *
 * 交互:
 * - 未登录 → "Sign in" 按钮,点击调 onSignInClick(父组件展开 MagicLinkForm)
 * - 已登录 → "Signed in as {email} · Sign out"
 * - Sign out 调 /api/v1/auth/logout,完成后 setUser(null)
 *
 * Mount 时调 /api/v1/auth/me,失败也 setUser(null)不抛
 */

interface User {
  id: string;
  email: string;
  plan: string;
}

export function AuthChip({ onSignInClick }: { onSignInClick: () => void }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    try {
      const res = await fetch("/api/v1/auth/me");
      if (res.ok) {
        const data = (await res.json()) as { user: User | null };
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function handleSignOut() {
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    await refresh();
  }

  if (loading) return null;

  if (!user) {
    return (
      <button
        onClick={onSignInClick}
        className="text-sm text-fgmute hover:text-fg transition-colors"
      >
        Sign in
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-fgmute">Signed in as {user.email}</span>
      <button
        onClick={handleSignOut}
        className="text-fgmute hover:text-fg transition-colors underline"
      >
        Sign out
      </button>
    </div>
  );
}
