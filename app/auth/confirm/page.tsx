/**
 * /auth/confirm — Magic link 2-step confirm 中间页
 *
 * 邮件客户端(Gmail / 163邮件大师 / Outlook)预取邮件里的链接扫描恶意内容,
 * 单步 verify 会被预取消耗 token,真人点击就 invalid。
 *
 * 2-step 流程:
 * 1. GET /api/v1/auth/verify?token=X → 验 token + set verify cookie + redirect 到本页
 *    (token **不**被清)
 * 2. 本页显示"Confirm sign in"按钮
 * 3. POST /api/v1/auth/confirm → 读 verify cookie + 清 magic token + 发 session
 *
 * 预取只跑到本页(无害),真人点 Confirm 才真发 session。
 */

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

export default async function AuthConfirmPage() {
  // 读 verify cookie(由 /api/v1/auth/verify 设置)
  const cookieStore = await cookies();
  const verifyToken = cookieStore.get("tastegraph_verify")?.value;

  if (!verifyToken) {
    redirect("/signin?error=missing_verify");
  }

  const payload = await verifySessionToken(verifyToken);
  if (!payload) {
    redirect("/signin?error=invalid_verify");
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-bg text-fg">
      <div className="max-w-md w-full border border-line rounded-lg p-8 bg-bgcard">
        <h1 className="text-xl font-semibold mb-2">Confirm sign in</h1>
        <p className="text-sm text-fgmute mb-6">
          Sign in as <span className="text-fg font-medium">{payload.email}</span>?
        </p>
        <form method="POST" action="/api/v1/auth/confirm">
          <button
            type="submit"
            className="w-full px-4 py-3 bg-fg text-bg rounded-md text-sm font-medium hover:opacity-80"
          >
            Confirm sign in
          </button>
        </form>
        <p className="mt-4 text-xs text-fgfaint">
          This window expires in 5 minutes. If you didn&apos;t request this, close this page.
        </p>
      </div>
    </main>
  );
}