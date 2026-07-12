import { NextRequest, NextResponse } from "next/server";
import { getOptionalUser } from "@/lib/auth/session";
import { getStripeClient } from "@/lib/stripe/client";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest): Promise<NextResponse> {
  // 1. 鉴权
  const user = await getOptionalUser(req);
  if (!user) {
    return NextResponse.json(
      { ok: false, error: { code: 'UNAUTHORIZED', message: 'Please sign in to upgrade.', retryable: false } },
      { status: 401 },
    );
  }

  // 2. 解析 body
  let body: { plan?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: 'INVALID_BODY', message: 'JSON body required.', retryable: false } },
      { status: 400 },
    );
  }

  if (body.plan !== 'monthly' && body.plan !== 'yearly') {
    return NextResponse.json(
      { ok: false, error: { code: 'INVALID_PLAN', message: 'Plan must be "monthly" or "yearly".', retryable: false } },
      { status: 400 },
    );
  }

  // 3. 选 price ID
  const priceId =
    body.plan === 'monthly'
      ? process.env.STRIPE_PRICE_ID_MONTHLY
      : process.env.STRIPE_PRICE_ID_YEARLY;

  if (!priceId) {
    return NextResponse.json(
      { ok: false, error: { code: 'STRIPE_NOT_CONFIGURED', message: `STRIPE_PRICE_ID_${body.plan.toUpperCase()} not set`, retryable: false } },
      { status: 500 },
    );
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { ok: false, error: { code: 'STRIPE_NOT_CONFIGURED', message: 'STRIPE_SECRET_KEY not set', retryable: false } },
      { status: 500 },
    );
  }

  // 4. 创建 checkout session
  try {
    const stripe = getStripeClient();
    const origin = req.nextUrl.origin;
    const session = await stripe.createCheckoutSession({
      priceId,
      customerEmail: user.email,
      successUrl: `${origin}/create?upgraded=true`,
      cancelUrl: `${origin}/pricing?canceled=true`,
      metadata: { user_id: user.id },
    });

    return NextResponse.json({ ok: true, url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('[stripe-checkout] error', err);
    return NextResponse.json(
      { ok: false, error: { code: 'STRIPE_ERROR', message: err instanceof Error ? err.message : 'Unknown error', retryable: true } },
      { status: 502 },
    );
  }
}