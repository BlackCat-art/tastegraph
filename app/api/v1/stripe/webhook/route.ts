import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { stripeEvents } from "@/lib/db/schema";
import { getStripeClient } from "@/lib/stripe/client";
import { syncStripeEventToUser, type StripeEventLike } from "@/lib/stripe/sync-user";

export const dynamic = "force-dynamic";

function getWebhookSecret(): string {
  const s = process.env.STRIPE_WEBHOOK_SECRET;
  if (!s) throw new Error('STRIPE_WEBHOOK_SECRET not set');
  return s;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const rawBody = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { ok: false, error: { code: 'MISSING_SIGNATURE', message: 'Missing stripe-signature header', retryable: false } },
      { status: 400 },
    );
  }

  let event;
  try {
    const stripe = getStripeClient();
    event = await stripe.verifyWebhookSignature(rawBody, signature, getWebhookSecret());
  } catch (err) {
    console.error('[stripe-webhook] signature verification failed', err);
    return NextResponse.json(
      { ok: false, error: { code: 'INVALID_SIGNATURE', message: err instanceof Error ? err.message : 'Invalid signature', retryable: false } },
      { status: 401 },
    );
  }

  let inserted;
  try {
    inserted = await db
      .insert(stripeEvents)
      .values({
        id: event.id,
        type: event.type,
        payload: event as unknown,
      })
      .onConflictDoNothing()
      .returning({ id: stripeEvents.id });
  } catch (err) {
    console.error('[stripe-webhook] failed to insert stripe_events', err);
    return new NextResponse('Database error', { status: 500 });
  }

  if (inserted.length === 0) {
    console.log(`[stripe-webhook] already processed: ${event.id}`);
    return NextResponse.json({ ok: true, skipped: true });
  }

  try {
    await syncStripeEventToUser(event as unknown as StripeEventLike);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[stripe-webhook] sync failed', err, event.id, event.type);
    return new NextResponse('Sync failed', { status: 500 });
  }
}
