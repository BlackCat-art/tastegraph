"use client";

import { useEffect, useRef, useState } from "react";

/**
 * MagicLinkForm — 邮箱输入 + 提交 + 轮询登录态
 *
 * State machine:
 * - idle: 默认,显示 form
 * - sending: 提交中,按钮 disabled
 * - sent: 已发邮件,显示 "Check your email" + 可选 devLink
 * - error: 提交失败,显示错误信息 + 重试
 *
 * Polling:
 * - status='sent' 后每 3 秒 GET /api/v1/auth/me
 * - 命中 user → onSignedIn(user) + onClose()
 * - 5 分钟未命中 → status='error'
 *
 * 生命周期:
 * - open=false → 清 polling + reset state
 * - 组件 unmount → 清 polling
 */

interface User {
  id: string;
  email: string;
  plan: string;
}

type Status = "idle" | "sending" | "sent" | "error";

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 5 * 60 * 1000;

export function MagicLinkForm({
  open,
  onClose,
  onSignedIn,
}: {
  open: boolean;
  onClose: () => void;
  onSignedIn?: (user: User) => void;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [devLink, setDevLink] = useState<string | null>(null);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollStartRef = useRef<number>(0);

  // Reset state when form closes
  useEffect(() => {
    if (!open) {
      setEmail("");
      setStatus("idle");
      setErrorMsg("");
      setDevLink(null);
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }
  }, [open]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  function startPolling() {
    pollStartRef.current = Date.now();
    if (pollRef.current) clearInterval(pollRef.current);

    pollRef.current = setInterval(async () => {
      // 超时检查
      if (Date.now() - pollStartRef.current > POLL_TIMEOUT_MS) {
        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = null;
        setStatus("error");
        setErrorMsg("Didn't get the email? Click Sign in again.");
        return;
      }

      try {
        const res = await fetch("/api/v1/auth/me");
        if (!res.ok) return;
        const data = (await res.json()) as { user: User | null };
        if (data.user) {
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = null;
          onSignedIn?.(data.user);
          onClose();
        }
      } catch {
        // ignore network errors during polling
      }
    }, POLL_INTERVAL_MS);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("sending");
    setErrorMsg("");
    setDevLink(null);

    try {
      const res = await fetch("/api/v1/auth/magic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = (await res.json()) as { ok: boolean; devLink?: string; error?: { message?: string } };

      if (res.ok && data.ok) {
        setStatus("sent");
        setDevLink(data.devLink ?? null);
        startPolling();
      } else {
        setStatus("error");
        setErrorMsg(data.error?.message ?? `Failed (${res.status})`);
      }
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Network error");
    }
  }

  if (!open) return null;

  return (
    <div className="mt-4 border border-line rounded-lg p-4 bg-bgcard">
      {status !== "sent" && (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            disabled={status === "sending"}
            className="flex-1 px-3 py-2 border border-line rounded-md bg-bg text-fg text-sm placeholder:text-fgmute disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={status === "sending" || !email.trim()}
            className="px-4 py-2 bg-fg text-bg rounded-md text-sm font-medium hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === "sending" ? "Sending…" : "Send magic link"}
          </button>
        </form>
      )}

      {status === "sent" && (
        <div className="text-sm text-fg">
          <p className="text-fgmute">
            Check your email for the sign-in link. It expires in 15 minutes.
          </p>
          {devLink && (
            <p className="mt-3 text-xs text-fgmute">
              Dev mode:{" "}
              <a href={devLink} className="underline text-fg">
                click here to sign in
              </a>
            </p>
          )}
          <p className="mt-3 text-xs text-fgmute">
            This form will close automatically once you sign in.
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="text-sm">
          <p className="text-red-400">{errorMsg}</p>
          <button
            onClick={() => setStatus("idle")}
            className="mt-2 text-xs underline text-fgmute hover:text-fg"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
