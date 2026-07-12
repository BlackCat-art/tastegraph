import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/v1/stripe/webhook
 *
 * Stripe 发送的事件:
 * - checkout.session.completed → 更新 user.plan = 'pro', 写 stripe_subscriptions
 * - customer.subscription.updated → 更新 subscription status
 * - customer.subscription.deleted → 用户取消订阅,降级 plan = 'free'
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

  // Validate webhook signature
  const { getStripeClient } = await import("@/lib/stripe/client");
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

  // 幂等去重
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext();
    const db = (env as any).DB;

    if (!db) {
      return NextResponse.json({ ok: true, reason: "no-db" });
    }

    const existing = await db.prepare(
      "SELECT id FROM stripe_events WHERE stripe_event_id = ? LIMIT 1",
    ).bind(event.id).first();

    if (existing) {
      return NextResponse.json({ ok: true, reason: "duplicate" });
    }

    // 记录 event(幂等)
    await db.prepare(
      "INSERT INTO stripe_events (stripe_event_id, type, payload) VALUES (?, ?, ?)",
    ).bind(event.id, event.type, JSON.stringify(event)).run();

    const obj = event.data.object as Record<string, unknown>;

    switch (event.type) {
      case "checkout.session.completed": {
        const customerId = obj.customer as string;
        const subscriptionId = obj.subscription as string;
        const metadata = obj.metadata as Record<string, string> | undefined;
        const userId = metadata?.userId;

        if (userId && customerId) {
          // 更新 user plan → pro
          await db.prepare(
            "UPDATE users SET plan = 'pro', stripe_id = ? WHERE id = ?",
          ).bind(customerId, userId).run();

          // 写 subscription
          if (subscriptionId) {
            await db.prepare(
              `INSERT INTO stripe_subscriptions (user_id, stripe_subscription_id, stripe_customer_id, status)
               VALUES (?, ?, ?, 'active')`,
            ).bind(userId, subscriptionId, customerId).run();
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscriptionId = obj.id as string;
        const status = obj.status as string;
        const customerId = obj.customer as string;

        // 更新 subscription status
        await db.prepare(
          "UPDATE stripe_subscriptions SET status = ?, updated_at = datetime('now') WHERE stripe_subscription_id = ?",
        ).bind(status, subscriptionId).run();

        if (status === "canceled" || status === "unpaid") {
          // 降级用户 plan
          await db.prepare(
            "UPDATE users SET plan = 'free' WHERE stripe_id = ?",
          ).bind(customerId).run();
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscriptionId = obj.id as string;
        const customerId = obj.customer as string;

        await db.prepare(
          "UPDATE stripe_subscriptions SET status = 'canceled', updated_at = datetime('now') WHERE stripe_subscription_id = ?",
        ).bind(subscriptionId).run();

        await db.prepare(
          "UPDATE users SET plan = 'free' WHERE stripe_id = ?",
        ).bind(customerId).run();
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
