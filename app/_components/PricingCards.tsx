'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const PLANS = [
  { id: 'monthly' as const, label: 'Monthly', price: '$4.99', period: '/month', save: null },
  { id: 'yearly' as const, label: 'Yearly', price: '$39', period: '/year', save: 'Save $20.88' },
];

type PlanId = 'monthly' | 'yearly';

export function PricingCards() {
  const router = useRouter();
  const [loading, setLoading] = useState<PlanId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    fetch('/api/v1/auth/me')
      .then((r) => r.json())
      .then((d) => setUserPlan(d.user?.plan ?? null))
      .catch(() => setUserPlan(null))
      .finally(() => setLoadingUser(false));
  }, []);

  async function handleSubscribe(plan: PlanId) {
    setLoading(plan);
    setError(null);
    try {
      const res = await fetch('/api/v1/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      if (res.status === 401) {
        // /signin 是 D7 error fallback(没表单),跳到 /create 让 AuthChip 展开 MagicLinkForm
        router.push('/create?redirect=/pricing');
        return;
      }
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || err.message || 'Checkout failed');
      }
      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(null);
    }
  }

  async function handleManage() {
    setLoading('monthly');
    setError(null);
    try {
      const res = await fetch('/api/v1/stripe/portal', { method: 'POST' });
      if (res.status === 401) {
        router.push('/create?redirect=/pricing');
        return;
      }
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || err.message || 'Failed');
      }
      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(null);
    }
  }

  if (loadingUser) {
    return <p className="text-gray-500">Loading...</p>;
  }

  if (userPlan === 'pro') {
    return (
      <div className="border border-yellow-400 bg-yellow-50 rounded-xl p-8">
        <p className="text-2xl font-bold mb-2">You&apos;re already Pro! ✓</p>
        <p className="text-gray-700 mb-4">Manage your subscription from the dashboard.</p>
        <button
          onClick={handleManage}
          disabled={loading !== null}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Manage subscription'}
        </button>
        {error && <p className="mt-4 text-red-600">{error}</p>}
      </div>
    );
  }

  // D14 Plan A: Pro 支付通道在中国大陆被 Stripe / PayPal 阻 — disable
  return (
    <div className="rounded-xl border border-line bg-bgcard p-8 text-center">
      <p className="text-2xl font-bold mb-2 text-fg">Pro — Coming soon</p>
      <p className="text-sm text-fgmute mb-4 max-w-md mx-auto">
        Pro subscriptions are temporarily disabled while we set up payment
        infrastructure for our launch. Stay tuned — we&apos;ll re-enable Pro
        on this page as soon as it&apos;s ready.
      </p>
      <p className="text-xs text-fgfaint">
        In the meantime, Free (3 renders/day) is fully functional.
      </p>
    </div>
  );
}
