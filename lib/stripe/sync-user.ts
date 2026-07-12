import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * 处理 Stripe webhook 事件 → 同步到 users 表
 *
 * 4 类事件(per spec §3.3):
 * - checkout.session.completed → 只写 users.stripe_id(不写 plan)
 * - customer.subscription.created / updated → 写 plan + pro_expires_at
 * - customer.subscription.deleted → plan='free', pro_expires_at=null(保留 stripe_id)
 */

export type StripeEventLike = {
  id: string;
  type: string;
  data: { object: Record<string, unknown> };
};

function getCustomerId(obj: Record<string, unknown>): string | null {
  const c = obj.customer;
  return typeof c === 'string' ? c : (c && typeof c === 'object' && 'id' in c ? String((c as { id: unknown }).id) : null);
}

export async function syncStripeEventToUser(event: StripeEventLike): Promise<void> {
  const obj = event.data.object;

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = obj as {
        metadata?: Record<string, string>;
      };
      const userId = session.metadata?.user_id;
      const customerId = getCustomerId(obj);
      if (!userId || !customerId) {
        console.warn('[sync-user] checkout.session.completed missing user_id or customer', { userId, customerId });
        return;
      }
      // 只写 stripeId,不写 plan(等 subscription.created)
      await db.update(users).set({ stripeId: customerId }).where(eq(users.id, userId));
      console.log(`[sync-user] checkout.session.completed: user ${userId} -> stripe ${customerId}`);
      break;
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = obj as {
        status: string;
        customer: string | { id: string };
        current_period_end: number;
      };
      const customerId = getCustomerId(obj);
      if (!customerId) {
        console.warn('[sync-user] subscription missing customer');
        return;
      }
      const isActive = sub.status === 'active' || sub.status === 'trialing';
      const periodEnd = new Date(sub.current_period_end * 1000);
      await db.update(users)
        .set({
          plan: isActive ? 'pro' : 'free',
          proExpiresAt: isActive ? periodEnd : null,
        })
        .where(eq(users.stripeId, customerId));
      console.log(`[sync-user] subscription ${sub.status}: stripe ${customerId} -> ${isActive ? 'pro' : 'free'}`);
      break;
    }

    case 'customer.subscription.deleted': {
      const customerId = getCustomerId(obj);
      if (!customerId) {
        console.warn('[sync-user] subscription.deleted missing customer');
        return;
      }
      // 保留 stripeId,只清 plan 和过期时间
      await db.update(users)
        .set({ plan: 'free', proExpiresAt: null })
        .where(eq(users.stripeId, customerId));
      console.log(`[sync-user] subscription.deleted: stripe ${customerId} -> free (stripeId preserved)`);
      break;
    }

    default:
      console.log(`[sync-user] ignored event type: ${event.type}`);
  }
}