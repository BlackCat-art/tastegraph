import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json(
      { ok: false, error: { code: "UNAUTHORIZED", message: "Sign in first", retryable: false } },
      { status: 401 },
    );
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { ok: false, error: { code: "STRIPE_NOT_CONFIGURED", message: "Stripe is not configured", retryable: false } },
      { status: 500 },
    );
  }

  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) {
    return NextResponse.json(
      { ok: false, error: { code: "STRIPE_NOT_CONFIGURED", message: "Stripe is not configured", retryable: false } },
      { status: 500 },
    );
  }

  const { getStripeClient } = await import("@/lib/stripe/client");
  const stripe = getStripeClient();

  try {
    const session = await stripe.createCheckoutSession({
      priceId,
      customerEmail: user.email,
      successUrl: `${req.nextUrl.origin}/create?subscribed=true`,
      cancelUrl: `${req.nextUrl.origin}/create`,
      metadata: { userId: user.id },
    });

    return NextResponse.json({ ok: true, url: session.url });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: { code: "STRIPE_ERROR", message: e?.message ?? "Stripe error", retryable: true } },
      { status: 500 },
    );
  }
}