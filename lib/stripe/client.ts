/**
 * Stripe client wrapper — D8 Stripe integration
 *
 * 使用 Stripe REST API(非 SDK),减少 bundle 体积
 * 支持本地 wrangler dev 和生产环境
 */

type StripeClientOptions = {
  apiKey: string;
  baseUrl?: string;
};

export type StripeCheckoutSession = {
  id: string;
  url: string | null;
};

export type StripePortalSession = {
  url: string;
};

export type StripeSubscription = {
  id: string;
  status: string;
  current_period_end: number;
  customer: string;
};

export type StripeWebhookEvent = {
  id: string;
  type: string;
  data: Record<string, unknown>;
};

const BASE_URL = "https://api.stripe.com/v1";

function createStripeClient(options: StripeClientOptions) {
  const { apiKey, baseUrl = BASE_URL } = options;

  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const url = `${baseUrl}${path}`;
    const res = await fetch(url, {
      ...init,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
        ...init?.headers,
      },
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Stripe API error ${res.status}: ${body.slice(0, 200)}`);
    }

    return res.json() as Promise<T>;
  }

  return {
    /**
     * 创建 Checkout Session
     */
    async createCheckoutSession(params: {
      priceId: string;
      customerEmail: string;
      successUrl: string;
      cancelUrl: string;
      metadata?: Record<string, string>;
    }): Promise<StripeCheckoutSession> {
      const body = new URLSearchParams({
        "line_items[0][price]": params.priceId,
        "line_items[0][quantity]": "1",
        mode: "subscription",
        customer_email: params.customerEmail,
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
      });

      if (params.metadata) {
        for (const [k, v] of Object.entries(params.metadata)) {
          body.append(`metadata[${k}]`, v);
        }
      }

      return request<StripeCheckoutSession>("/checkout/sessions", {
        method: "POST",
        body,
      });
    },

    /**
     * 创建 Customer Portal Session
     */
    async createPortalSession(params: { customerId: string; returnUrl: string }): Promise<StripePortalSession> {
      const body = new URLSearchParams({
        customer: params.customerId,
        return_url: params.returnUrl,
      });
      return request<StripePortalSession>("/billing_portal/sessions", {
        method: "POST",
        body,
      });
    },

    /**
     * 获取 Stripe subscription
     */
    async getSubscription(id: string): Promise<StripeSubscription> {
      return request<StripeSubscription>(`/subscriptions/${id}`);
    },

    /**
     * 验证 webhook signature
     */
    async verifyWebhookSignature(payload: string, signature: string, secret: string): Promise<StripeWebhookEvent> {
      const parts = signature.split(",");
      const tsPart = parts.find((p) => p.startsWith("t="));
      const sigPart = parts.find((p) => p.startsWith("v1="));

      if (!tsPart || !sigPart) {
        throw new Error("Invalid webhook signature format");
      }

      const timestamp = parseInt(tsPart.slice(2), 10);
      const now = Math.floor(Date.now() / 1000);
      if (Math.abs(now - timestamp) > 300) {
        throw new Error("Webhook timestamp too old");
      }

      // HMAC-SHA256 via Web Crypto API(CF Workers 兼容)
      const encoder = new TextEncoder();
      const keyData = encoder.encode(secret);
      const messageData = encoder.encode(`${timestamp}.${payload}`);

      const cryptoKey = await crypto.subtle.importKey(
        "raw",
        keyData,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
      );

      const sigBytes = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
      const expectedSig = Array.from(new Uint8Array(sigBytes))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      if (expectedSig !== sigPart.slice(3)) {
        throw new Error("Invalid webhook signature");
      }

      return JSON.parse(payload) as StripeWebhookEvent;
    },
  };
}

/**
 * 获取 Stripe client(从环境变量读取 API key)
 */
export function getStripeClient(env?: { STRIPE_SECRET_KEY?: string }) {
  const apiKey = env?.STRIPE_SECRET_KEY ?? process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return createStripeClient({ apiKey });
}