/**
 * Sign-in error fallback page
 *
 * /api/v1/auth/verify 失败时(缺少 token / token 无效 / token 过期)
 * redirect 到这里显示错误信息 + 引导用户回 /create 重试
 */

const messages: Record<string, string> = {
  missing_token: "Missing sign-in token. Please request a new link from /create.",
  invalid_token: "Invalid or already-used sign-in token. Please request a new link.",
  expired_token: "Sign-in link has expired. Please request a new link from /create.",
  missing_verify: "Verification cookie expired or missing. Please request a new link from /create.",
  invalid_verify: "Verification token invalid or expired. Please request a new link from /create.",
  unknown: "Something went wrong. Please try again from /create.",
};

export const dynamic = "force-dynamic";

export default async function SignInErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params.error ?? "unknown";
  const message = messages[error] ?? messages.unknown;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-bg text-fg">
      <div className="max-w-md w-full border border-line rounded-lg p-8 bg-bgcard">
        <h1 className="text-xl font-semibold mb-4">Sign in failed</h1>
        <p className="text-sm text-fgmute mb-6">{message}</p>
        <a
          href="/create"
          className="inline-block px-4 py-2 bg-fg text-bg rounded-md text-sm hover:opacity-80"
        >
          Back to create
        </a>
      </div>
    </main>
  );
}
