import { z } from "zod";

export const planSchema = z.object({
  summary: z.string(),
  bestIdea: z.object({
    name: z.string(),
    why: z.string(),
    confidenceScore: z.number(),
    demandScore: z.number(),
    competitionScore: z.number(),
    pricingScore: z.number(),
    locationScore: z.number(),
  }),
  alternativeIdeas: z.array(z.object({ name: z.string(), why: z.string(), confidenceScore: z.number() })),
  roadmap: z.array(
    z.object({
      title: z.string(),
      duration: z.string(),
      category: z.enum(["training", "mentoring", "guidance", "setup", "launch", "growth"]),
      description: z.string(),
      actions: z.array(z.string()),
    }),
  ),
  support: z.array(
    z.object({
      type: z.enum(["training", "mentoring", "guidance"]),
      name: z.string(),
      howToAccess: z.string(),
      cost: z.string(),
    }),
  ),
  budget: z.object({
    total: z.number(),
    currency: z.string(),
    reserve: z.number(),
    items: z.array(
      z.object({
        category: z.string(),
        item: z.string(),
        amount: z.number(),
        priority: z.enum(["must", "later"]),
        whereToBuy: z.string(),
      }),
    ),
  }),
  pricing: z.array(
    z.object({ service: z.string(), price: z.number(), unit: z.string(), costPerUnit: z.number(), note: z.string() }),
  ),
  profit: z.object({
    monthlyRevenue: z.number(),
    monthlyCosts: z.number(),
    monthlyProfit: z.number(),
    breakEvenMonths: z.number(),
    projection: z.array(z.object({ month: z.string(), revenue: z.number(), cost: z.number(), profit: z.number() })),
  }),
  nextInvestment: z.array(
    z.object({ when: z.string(), what: z.string(), amount: z.number(), expectedImpact: z.string() }),
  ),
  competition: z.object({
    competitors: z.array(
      z.object({
        type: z.string(),
        typicalPrice: z.string(),
        strengths: z.string(),
        commonComplaints: z.array(z.string()),
        sampleReview: z.string(),
        sentiment: z.enum(["positive", "mixed", "negative"]),
      }),
    ),
    gaps: z.array(z.string()),
    yourEdge: z.string(),
  }),
  market: z.object({
    demandLevel: z.enum(["low", "medium", "high"]),
    segments: z.array(z.object({ segment: z.string(), needs: z.string(), willingnessToPay: z.string() })),
    unmetNeeds: z.array(z.string()),
    localNeeds: z.array(z.string()),
    trends: z.array(z.string()),
  }),
  schemes: z.array(
    z.object({ name: z.string(), provider: z.string(), benefit: z.string(), eligibility: z.string() }),
  ),
});

export type Plan = z.infer<typeof planSchema>;

export type PlanInputs = {
  name: string;
  skills: string;
  hours: string;
  budget: string;
  location: string;
  interests: string;
  language: string;
};
