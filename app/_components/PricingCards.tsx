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

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PLANS.map((p) => (
          <div key={p.id} className="border border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-md transition">
            <h2 className="text-2xl font-bold mb-2">{p.label}</h2>
            <p className="text-5xl font-extrabold mb-1">
              {p.price}
              <span className="text-lg text-gray-500 font-normal">{p.period}</span>
            </p>
            {p.save && <p className="text-green-600 font-semibold mb-4">{p.save}</p>}
            <ul className="space-y-2 mb-6 text-gray-700">
              <li>✓ Unlimited renders</li>
              <li>✓ No watermark</li>
              <li>✓ All templates & palettes</li>
              <li>✓ Up to 4K resolution</li>
              <li>✓ Cancel anytime</li>
            </ul>
            <button
              onClick={() => handleSubscribe(p.id)}
              disabled={loading !== null}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50 transition"
            >
              {loading === p.id ? 'Loading...' : `Subscribe ${p.label}`}
            </button>
          </div>
        ))}
      </div>
      {error && <p className="mt-4 text-red-600">{error}</p>}
    </>
  );
}
