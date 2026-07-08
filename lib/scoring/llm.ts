// Provider abstraction for LLM calls.
// Priority:
//   1) env.AI binding (CF Workers runtime in production)
//   2) env.OPENAI_API_KEY (any OpenAI-compatible endpoint)
//
// Both paths accept the same input shape and return the same parsed JSON.
// Both paths set a 25-second hard timeout via AbortController.

// NOTE: @cloudflare/workers-types uses ambient declarations and doesn't export `Env`.
// We define a local alias here; runtime behavior is unchanged (body uses `(env as any).AI` etc).
type Env = Record<string, unknown>;

export type ProviderUsed = "cf-ai" | "openai" | "heuristic";

export interface CallLLMOpts {
  prompt: string;
  systemPrompt?: string;
  expectJson: boolean;        // true => we ask for JSON and try to parse
  maxTokens?: number;
}

export interface CallLLMResult<T = unknown> {
  raw: string;
  parsed: T | null;
  providerUsed: ProviderUsed;
  modelUsed: string;
  neuronEstimate?: number;    // rough; from table in MEMORY.md
}

const DEFAULT_CF_MODEL = "@cf/meta/llama-3.1-8b-instruct-fp8-fast";
const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";
const TIMEOUT_MS = 25_000;

// Approximate neuron cost per CF Workers AI call.
// 8B model: ~9 neurons per typical request (500 in + 200 out).
function estimateNeurons(text: string, isOutput: boolean): number {
  const tokens = Math.ceil(text.length / 4);
  return isOutput ? tokens * 0.0349 : tokens * 0.0041;
}

export async function callLLM<T = unknown>(
  env: Env | Record<string, unknown>,
  opts: CallLLMOpts
): Promise<CallLLMResult<T>> {
  // Path 1: Cloudflare Workers AI.
  const aiBinding = (env as any).AI;
  if (aiBinding && typeof (aiBinding as any).run === "function") {
    const model = (env as any).SCORING_MODEL_CF ?? DEFAULT_CF_MODEL;
    const controller = new AbortController();
    const to = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const messages = [];
      if (opts.systemPrompt) messages.push({ role: "system", content: opts.systemPrompt });
      messages.push({ role: "user", content: opts.prompt });
      const out = await (aiBinding as any).run(model, {
        messages,
        max_tokens: opts.maxTokens ?? 600,
      });
      const raw: string = out?.response ?? "";
      const parsed = opts.expectJson ? safeParseJson<T>(raw) : null;
      return {
        raw,
        parsed,
        providerUsed: "cf-ai",
        modelUsed: model,
        neuronEstimate:
          estimateNeurons(opts.prompt, false) + estimateNeurons(raw, true),
      };
    } finally {
      clearTimeout(to);
    }
  }

  // Path 2: OpenAI-compatible.
  const apiKey = (env as any).OPENAI_API_KEY;
  if (apiKey) {
    const baseUrl = (env as any).OPENAI_BASE_URL ?? "https://api.openai.com/v1";
    const model = (env as any).SCORING_MODEL ?? DEFAULT_OPENAI_MODEL;
    const controller = new AbortController();
    const to = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const body: Record<string, unknown> = {
        model,
        messages: [
          ...(opts.systemPrompt ? [{ role: "system", content: opts.systemPrompt }] : []),
          { role: "user", content: opts.prompt },
        ],
        max_tokens: opts.maxTokens ?? 600,
      };
      if (opts.expectJson) body.response_format = { type: "json_object" };
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      if (!res.ok) {
        throw new Error(`openai ${res.status}: ${await res.text()}`);
      }
      const json = (await res.json()) as any;
      const raw: string = json?.choices?.[0]?.message?.content ?? "";
      const parsed = opts.expectJson ? safeParseJson<T>(raw) : null;
      return { raw, parsed, providerUsed: "openai", modelUsed: model };
    } finally {
      clearTimeout(to);
    }
  }

  // No provider: surface a typed error.
  throw new NoLLMProviderError();
}

export class NoLLMProviderError extends Error {
  code = "NO_LLM_PROVIDER" as const;
  retryable = false;
  constructor() {
    super("No LLM provider available: set OPENAI_API_KEY or run on CF Workers.");
  }
}

function safeParseJson<T>(raw: string): T | null {
  // Strip ```json fences if the model wrapped the output.
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();
  // Try whole string first.
  try {
    return JSON.parse(cleaned) as T;
  } catch {}
  // Fallback: extract first {...} block.
  const m = cleaned.match(/\{[\s\S]*\}/);
  if (m) {
    try {
      return JSON.parse(m[0]) as T;
    } catch {}
  }
  return null;
}
