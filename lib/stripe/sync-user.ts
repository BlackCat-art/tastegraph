/**
 * Stripe webhook → Drizzle ORM 用户同步
 *
 * 幂等: stripe_events 表去重
 */

import { db } from "@/lib/db/client";
import { stripeEvents, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function isEventProcessed(stripeEventId: string): Promise<boolean> {
  const existing = await db.query.stripeEvents.findFirst({
    where: eq(stripeEvents.stripeEventId, stripeEventId),
  });
  return !!existing;
}

export async function recordEvent(stripeEventId: string, type: string, payload: unknown): Promise<void> {
  await db.insert(stripeEvents).values({
    stripeEventId,
    type,
    payload: payload as any,
  });
}

export async function upgradeUserToPro(userId: string, stripeCustomerId: string): Promise<void> {
  await db.update(users).set({
    plan: "pro",
    stripeId: stripeCustomerId,
  }).where(eq(users.id, userId));
}

export async function downgradeUserToFree(stripeCustomerId: string): Promise<void> {
  await db.update(users).set({
    plan: "free",
    stripeId: null,
  }).where(eq(users.stripeId, stripeCustomerId));
}