import { NextRequest, NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe/client";
import { isEventProcessed, recordEvent, upgradeUserToPro, downgradeUserToFree } from "@/lib/stripe/sync-user";

export const dynamic = "force-dynamic";

/**
 * POST /api/v1/stripe/webhook
 *
 * Stripe 发送的事件:
 * - checkout.session.completed → 升级 user.plan = 'pro'
 * - customer.subscription.deleted → 降级 user.plan = 'free'
 *
 * 幂等: 通过 stripe_events 表去重
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { ok: false, error: { code: "STRIPE_NOT_CONFIGURED", message: "Webhook secret not set", retryable: false } },
      { status: 500 },
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { ok: false, error: { code: "MISSING_SIGNATURE", message: "Missing stripe-signature header", retryable: false } },
      { status: 400 },
    );
  }

  const rawBody = await req.text();

  const stripe = getStripeClient();

  let event: { id: string; type: string; data: { object: Record<string, unknown> } };
  try {
    event = await stripe.verifyWebhookSignature(rawBody, signature, webhookSecret) as any;
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: { code: "INVALID_SIGNATURE", message: e?.message ?? "Invalid signature", retryable: false } },
      { status: 400 },
    );
  }

  try {
    // 幂等去重
    const alreadyProcessed = await isEventProcessed(event.id);
    if (alreadyProcessed) {
      return NextResponse.json({ ok: true, reason: "duplicate" });
    }

    // 记录 event
    await recordEvent(event.id, event.type, event);

    const obj = event.data.object as Record<string, unknown>;

    switch (event.type) {
      case "checkout.session.completed": {
        const customerId = obj.customer as string;
        const metadata = obj.metadata as Record<string, string> | undefined;
        const userId = metadata?.userId;

        if (userId && customerId) {
          await upgradeUserToPro(userId, customerId);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const customerId = obj.customer as string;
        if (customerId) {
          await downgradeUserToFree(customerId);
        }
        break;
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("Webhook handler error:", e);
    return NextResponse.json(
      { ok: false, error: { code: "WEBHOOK_ERROR", message: e?.message ?? "Webhook processing failed", retryable: true } },
      { status: 500 },
    );
  }
}