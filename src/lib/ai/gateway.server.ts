import { createOpenAI } from "@ai-sdk/openai";

const BASE_URL = "https://ai.gateway.lovable.dev/v1";
export const MODEL = "openai/gpt-6-astra";

export function getProvider() {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured");
  let runId: string | undefined;
  return createOpenAI({
    baseURL: BASE_URL,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: async (input, init) => {
      const headers = new Headers(init?.headers);
      if (runId) headers.set("X-Lovable-AIG-Run-ID", runId);
      const res = await fetch(input, { ...init, headers });
      runId ??= res.headers.get("X-Lovable-AIG-Run-ID") ?? undefined;
      return res;
    },
  });
}

export const responsesOptions = {
  openai: {
    store: false,
    forceReasoning: true,
    reasoningEffort: "low",
    reasoningSummary: "auto",
    include: ["reasoning.encrypted_content"],
  },
} as const;

export function friendlyAiError(e: unknown): Error {
  const status = (e as { statusCode?: number })?.statusCode;
  if (status === 429) return new Error("Too many requests right now. Please wait a minute and try again.");
  if (status === 402) return new Error("AI credits are used up. Please add credits to continue.");
  console.error(e);
  return new Error("The AI could not complete this request. Please try again.");
}
