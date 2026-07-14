/**
 * Resend 邮件发送
 *
 * 设计要点:
 * - 直接 fetch API,不用 resend SDK(更轻量,CF Workers 兼容无歧义)
 * - Dev 模式 fallback:无 RESEND_API_KEY 时 console.log 链接,UI 拿到 devLink 可点
 * - 邮件 HTML 是手写 string(不引 react-email,简单)
 *
 * Resend 注册步骤:
 * 1. https://resend.com signup(GitHub 登录免信用卡)
 * 2. dashboard → API Keys → Create API Key(选 "Sending access" 权限)
 * 3. dev 阶段用 onboarding@resend.dev 测试域(免域名验证)
 * 4. 生产前注册 tastegraph.org 域名(以及 SPF/DKIM/DMARC) + 加 SPF/DKIM/DMARC 记录
 *
 * env 来源:
 * - RESEND_API_KEY + RESEND_FROM_EMAIL 在 .dev.vars 和 CF Pages secret
 */

export interface SendMagicLinkResult {
  ok: boolean;
  devLink?: string;
  error?: string;
}

const RESEND_API_URL = "https://api.resend.com/emails";

function emailHtml(link: string): string {
  // link 是 base64url + 普通 URL 字符,无引号 / 反引号 / 美元符,直接插 HTML 安全
  return `<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 40px auto; padding: 20px; color: #0A0A0A;">
  <h2 style="font-size: 18px; margin-bottom: 24px;">Sign in to TasteGraph</h2>
  <p style="font-size: 14px; line-height: 1.6; color: #333;">
    Click the button below to sign in. This link expires in 15 minutes and can only be used once.
  </p>
  <p style="margin: 32px 0;">
    <a href="${link}" style="display: inline-block; padding: 12px 24px; background: #0A0A0A; color: white; text-decoration: none; border-radius: 6px; font-size: 14px;">
      Sign in to TasteGraph
    </a>
  </p>
  <p style="font-size: 12px; color: #888; line-height: 1.5;">
    If you didn't request this, you can safely ignore this email.
  </p>
  <p style="font-size: 12px; color: #888; margin-top: 24px;">
    Or copy this link: <br>
    <code style="word-break: break-all;">${link}</code>
  </p>
</body>
</html>`;
}

export async function sendMagicLinkEmail(to: string, link: string): Promise<SendMagicLinkResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!fromEmail) {
    throw new Error(
      "RESEND_FROM_EMAIL environment variable is required (default: onboarding@resend.dev). " +
        "Sign up at https://resend.com to get a free account.",
    );
  }

  // Dev 模式 fallback:无 API key → console.log,UI 拿 devLink 可点
  if (!apiKey) {
    console.log(`[DEV MODE] Magic link for ${to}: ${link}`);
    return { ok: true, devLink: link };
  }

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `TasteGraph <${fromEmail}>`,
      to,
      subject: "Your TasteGraph sign-in link",
      html: emailHtml(link),
    }),
  });

  if (res.ok) {
    return { ok: true };
  }

  const errorText = await res.text();
  return { ok: false, error: errorText };
}
