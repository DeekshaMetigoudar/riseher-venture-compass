import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { PlanInputs } from "./plan-schema";
import { LANG_NAMES } from "./languages";

export const generatePlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: PlanInputs) => input)
  .handler(async ({ data, context }) => {
    const { streamText, Output } = await import("ai");
    const { getProvider, MODEL, responsesOptions, friendlyAiError } = await import("./ai/gateway.server");
    const { planSchema } = await import("./plan-schema");
    const lang = LANG_NAMES[data.language] ?? "English";

    const instructions = `You are RiseHer, an expert small-business advisor for women entrepreneurs in India.
Create a realistic, practical business plan. Write ALL text values in ${lang} (numbers stay numeric).
Use Indian Rupees (INR) unless the location is outside India. Budget items must add up to roughly the user's budget minus the reserve.
If the budget is very low or zero, focus on low-cost ideas and government schemes (PMEGP, Mudra, Stand-Up India, state schemes, NRLM/SHG, etc.).
Roadmap: 8-10 sequential steps that include training, mentoring and guidance steps alongside setup, launch and growth.
Competition: describe the kinds of businesses near the given location, what customers typically complain about in their reviews, and a representative sample review. These are informed estimates based on typical patterns for that area, not scraped data.
Market research: what customers in that area actually need, unmet needs, and local trends.
Profit projection: 12 months. Scores are 0-100.`;

    const prompt = `Name: ${data.name}
Skills: ${data.skills}
Free time per day: ${data.hours}
Budget available: ${data.budget}
Location: ${data.location}
Interests / ideas: ${data.interests || "none given"}`;

    try {
      const result = streamText({
        model: getProvider().responses(MODEL),
        instructions,
        prompt,
        output: Output.object({ schema: planSchema }),
        providerOptions: responsesOptions,
      });
      const plan = await result.output;
      const { data: row, error } = await context.supabase
        .from("plans")
        .insert({
          user_id: context.userId,
          title: plan.bestIdea.name,
          language: data.language,
          inputs: data,
          result: plan,
        })
        .select("id")
        .single();
      if (error) throw error;
      return { id: row.id };
    } catch (e) {
      throw friendlyAiError(e);
    }
  });

export const askAssistant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      language: string;
      context: string;
      messages: { role: "user" | "assistant"; content: string }[];
    }) => input,
  )
  .handler(async ({ data }) => {
    const { streamText } = await import("ai");
    const { getProvider, MODEL, responsesOptions, friendlyAiError } = await import("./ai/gateway.server");
    const lang = LANG_NAMES[data.language] ?? "English";
    try {
      const result = streamText({
        model: getProvider().responses(MODEL),
        instructions: `You are RiseHer's friendly AI business assistant for women entrepreneurs. Reply in ${lang}, simply and practically, in short paragraphs or bullet points. Help with business ideas, pricing, budgeting, government schemes, marketing, training and mentoring.${
          data.context ? `\n\nThe user's current plan (for context):\n${data.context.slice(0, 6000)}` : ""
        }`,
        messages: data.messages.slice(-12),
        providerOptions: responsesOptions,
      });
      return { reply: await result.text };
    } catch (e) {
      throw friendlyAiError(e);
    }
  });
