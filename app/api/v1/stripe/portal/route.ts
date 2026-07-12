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

  if (!user.stripeId) {
    return NextResponse.json(
      { ok: false, error: { code: "NO_STRIPE_CUSTOMER", message: "No Stripe customer found", retryable: false } },
      { status: 400 },
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
      { status: 500 },
    );
  }
}