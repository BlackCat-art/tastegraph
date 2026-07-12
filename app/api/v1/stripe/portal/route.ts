import { NextRequest, NextResponse } from "next/server";
import { getOptionalUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest): Promise<NextResponse> {
  // 用 getOptionalUser 而不是 getCurrentUser:JWT 里的 stripeId 可能 stale
  // (用户先登录拿到 JWT,后来通过 Stripe webhook 写入 stripe_id)
  // getOptionalUser 读 DB 拿最新 stripeId
  const user = await getOptionalUser(req);
  if (!user) {
    return NextResponse.json(
      { ok: false, error: { code: "UNAUTHORIZED", message: "Sign in first", retryable: false } },
      { status: 401 },
    );
  }

  if (!user.stripeId) {
    return NextResponse.json(
      { ok: false, error: { code: "NO_SUBSCRIPTION", message: "No active subscription found. Subscribe first.", retryable: false } },
      { status: 404 },
    );
  }

  const { getStripeClient } = await import("@/lib/stripe/client");
  const stripe = getStripeClient();

  try {
    const portal = await stripe.createPortalSession({
      customerId: user.stripeId,
      returnUrl: `${req.nextUrl.origin}/create`,
    });

    return NextResponse.json({ ok: true, url: portal.url });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: { code: "STRIPE_ERROR", message: e?.message ?? "Stripe error", retryable: true } },
      { status: 502 },
    );
  }
}