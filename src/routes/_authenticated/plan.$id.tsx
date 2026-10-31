import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowLeft, GraduationCap, Users, Compass, Wrench, Rocket, TrendingUp, AlertTriangle, Info, Loader2 } from "lucide-react";
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip, Legend, AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import type { Plan } from "@/lib/plan-schema";
import { useI18n } from "@/lib/i18n";
import { setAssistantContext } from "@/components/AssistantChat";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/plan/$id")({
  head: () => ({
    meta: [
      { title: "Your business plan — RiseHer" },
      { name: "description", content: "Roadmap, budget, pricing, competition and market research for your business." },
      { property: "og:title", content: "Your business plan — RiseHer" },
      { property: "og:description", content: "A complete A–Z plan for your new business." },
    ],
  }),
  component: PlanPage,
});

const CHART = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--coral)", "var(--peach)"];
const CAT = {
  training: { icon: GraduationCap, cls: "border-chart-4 text-chart-4" },
  mentoring: { icon: Users, cls: "border-chart-2 text-chart-2" },
  guidance: { icon: Compass, cls: "border-chart-5 text-chart-5" },
  setup: { icon: Wrench, cls: "border-coral text-coral" },
  launch: { icon: Rocket, cls: "border-chart-1 text-chart-1" },
  growth: { icon: TrendingUp, cls: "border-success text-success" },
} as const;

function PlanPage() {
  const { id } = Route.useParams();
  const { t } = useI18n();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loc, setLoc] = useState("");

  useEffect(() => {
    supabase.from("plans").select("result,inputs").eq("id", id).single().then(({ data }) => {
      if (!data) return;
      const p = data.result as unknown as Plan;
      setPlan(p);
      setLoc((data.inputs as { location?: string })?.location ?? "");
      setAssistantContext(JSON.stringify({ location: (data.inputs as object), idea: p.bestIdea, budget: p.budget, pricing: p.pricing, profit: p.profit }));
    });
    return () => setAssistantContext("");
  }, [id]);

  if (!plan) return <div className="flex justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-coral" /></div>;
  const cur = plan.budget.currency === "INR" ? "₹" : plan.budget.currency + " ";
  const money = (n: number) => `${cur}${Math.round(n).toLocaleString("en-IN")}`;

  const Note = () => (
    <p className="flex items-start gap-2 rounded-xl bg-warning/10 p-3 text-xs text-warning">
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {t("aiNote")}
    </p>
  );

  return (
    <div className="space-y-6">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> {t("back")}
      </Link>
      <div className="tile grid gap-6 p-6 md:grid-cols-[1fr_auto] md:p-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-coral">{loc}</p>
          <h1 className="mt-1 text-4xl font-extrabold">{plan.bestIdea.name}</h1>
          <p className="mt-3 text-muted-foreground">{plan.summary}</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-brand text-3xl font-black text-primary-foreground shadow-glow">
            {Math.round(plan.bestIdea.confidenceScore)}%
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{t("confidence")}</p>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="flex h-auto flex-wrap justify-start gap-1 bg-card p-1">
          {["overview", "roadmap", "budgetTab", "pricing", "competition", "market", "schemes"].map((k) => (
            <TabsTrigger key={k} value={k} className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{t(k)}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-4">
            {[["Demand", plan.bestIdea.demandScore], ["Competition", plan.bestIdea.competitionScore], ["Pricing", plan.bestIdea.pricingScore], ["Location", plan.bestIdea.locationScore]].map(([k, v]) => (
              <div key={k as string} className="tile p-4">
                <p className="text-sm text-muted-foreground">{k}</p>
                <p className="text-2xl font-bold">{Math.round(v as number)}</p>
                <div className="mt-2 h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-brand" style={{ width: `${v}%` }} /></div>
              </div>
            ))}
          </div>
          <div className="tile p-6"><p>{plan.bestIdea.why}</p></div>
          <div className="grid gap-4 md:grid-cols-3">
            {plan.alternativeIdeas.map((a) => (
              <div key={a.name} className="tile p-4">
                <div className="flex items-center justify-between"><p className="font-semibold">{a.name}</p><Badge variant="secondary">{Math.round(a.confidenceScore)}%</Badge></div>
                <p className="mt-2 text-sm text-muted-foreground">{a.why}</p>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="roadmap" className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {Object.entries(CAT).map(([k, v]) => (
              <span key={k} className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs capitalize ${v.cls}`}><v.icon className="h-3 w-3" />{k}</span>
            ))}
          </div>
          <div className="mx-auto max-w-2xl">
            {plan.roadmap.map((s, i) => {
              const c = CAT[s.category];
              return (
                <div key={i} className="flex flex-col items-center">
                  <div className={`tile w-full border-l-4 p-5 ${c.cls}`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 font-semibold text-foreground"><c.icon className="h-4 w-4" /> {i + 1}. {s.title}</span>
                      <Badge variant="outline" className={c.cls}>{s.duration}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
                    <ul className="mt-2 list-inside list-disc text-sm text-foreground/90">{s.actions.map((a) => <li key={a}>{a}</li>)}</ul>
                  </div>
                  {i < plan.roadmap.length - 1 && <ArrowDown className="my-1 h-6 w-6 text-coral" />}
                </div>
              );
            })}
          </div>
          <h3 className="text-xl font-bold">Training · Mentoring · Guidance</h3>
          <div className="grid gap-4 md:grid-cols-3">
            {plan.support.map((s) => {
              const c = CAT[s.type];
              return (
                <div key={s.name} className={`tile border-t-4 p-4 ${c.cls}`}>
                  <p className="flex items-center gap-2 font-semibold text-foreground"><c.icon className="h-4 w-4" />{s.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{s.howToAccess}</p>
                  <p className="mt-2 text-xs">{s.cost}</p>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="budgetTab" className="grid gap-6 lg:grid-cols-2">
          <div className="tile h-80 p-4">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={[...plan.budget.items.map((i) => ({ name: i.item, value: i.amount })), { name: "Reserve", value: plan.budget.reserve }]} dataKey="value" nameKey="name" innerRadius={60} outerRadius={110}>
                  {plan.budget.items.concat([] as never[]).map((_, i) => <Cell key={i} fill={CHART[i % CHART.length]} />)}
                  <Cell fill="var(--muted-foreground)" />
                </Pie>
                <Tooltip formatter={(v: number) => money(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="tile overflow-x-auto p-4">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-muted-foreground"><th className="p-2">Item</th><th className="p-2">Where</th><th className="p-2 text-right">Amount</th></tr></thead>
              <tbody>
                {plan.budget.items.map((i, k) => (
                  <tr key={k} className="border-t border-border">
                    <td className="p-2"><span className="mr-2 inline-block h-2 w-2 rounded-full" style={{ background: CHART[k % CHART.length] }} />{i.item}<div className="text-xs text-muted-foreground">{i.category} · {i.priority === "must" ? "Must have" : "Can wait"}</div></td>
                    <td className="p-2 text-xs text-muted-foreground">{i.whereToBuy}</td>
                    <td className="p-2 text-right font-medium">{money(i.amount)}</td>
                  </tr>
                ))}
                <tr className="border-t border-border"><td className="p-2">Emergency reserve</td><td /><td className="p-2 text-right">{money(plan.budget.reserve)}</td></tr>
                <tr className="border-t border-border font-bold"><td className="p-2">Total</td><td /><td className="p-2 text-right text-coral">{money(plan.budget.total)}</td></tr>
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-4">
            {[["Monthly revenue", money(plan.profit.monthlyRevenue)], ["Monthly costs", money(plan.profit.monthlyCosts)], ["Monthly profit", money(plan.profit.monthlyProfit)], ["Break-even", `${plan.profit.breakEvenMonths} mo`]].map(([k, v]) => (
              <div key={k} className="tile p-4"><p className="text-sm text-muted-foreground">{k}</p><p className="text-2xl font-bold">{v}</p></div>
            ))}
          </div>
          <div className="tile overflow-x-auto p-4">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-muted-foreground"><th className="p-2">Service</th><th className="p-2 text-right">Price</th><th className="p-2 text-right">Cost</th><th className="p-2 text-right">Margin</th></tr></thead>
              <tbody>
                {plan.pricing.map((p) => (
                  <tr key={p.service} className="border-t border-border">
                    <td className="p-2">{p.service}<div className="text-xs text-muted-foreground">{p.note}</div></td>
                    <td className="p-2 text-right">{money(p.price)} <span className="text-xs text-muted-foreground">/{p.unit}</span></td>
                    <td className="p-2 text-right">{money(p.costPerUnit)}</td>
                    <td className="p-2 text-right text-success">{p.price ? Math.round(((p.price - p.costPerUnit) / p.price) * 100) : 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="tile h-80 p-4">
            <ResponsiveContainer>
              <AreaChart data={plan.profit.projection}>
                <CartesianGrid stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip formatter={(v: number) => money(v)} contentStyle={{ background: "var(--card)", border: "none" }} />
                <Legend />
                <Area dataKey="revenue" stroke="var(--chart-2)" fill="var(--chart-2)" fillOpacity={0.2} />
                <Area dataKey="cost" stroke="var(--chart-4)" fill="var(--chart-4)" fillOpacity={0.15} />
                <Area dataKey="profit" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.35} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <h3 className="text-xl font-bold">Next investments</h3>
          <div className="grid gap-4 md:grid-cols-3">
            {plan.nextInvestment.map((n) => (
              <div key={n.what} className="tile p-4">
                <Badge className="bg-brand text-primary-foreground">{n.when}</Badge>
                <p className="mt-2 font-semibold">{n.what}</p>
                <p className="text-lg font-bold text-coral">{money(n.amount)}</p>
                <p className="text-sm text-muted-foreground">{n.expectedImpact}</p>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="competition" className="space-y-4">
          <Note />
          <div className="grid gap-4 md:grid-cols-2">
            {plan.competition.competitors.map((c) => (
              <div key={c.type} className="tile space-y-2 p-5">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{c.type}</p>
                  <Badge variant="outline" className={c.sentiment === "negative" ? "border-destructive text-destructive" : c.sentiment === "mixed" ? "border-warning text-warning" : "border-success text-success"}>{c.sentiment}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{c.typicalPrice} · {c.strengths}</p>
                <ul className="space-y-1 text-sm">{c.commonComplaints.map((x) => <li key={x} className="flex gap-2"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />{x}</li>)}</ul>
                <blockquote className="border-l-2 border-coral pl-3 text-sm italic text-muted-foreground">“{c.sampleReview}”</blockquote>
              </div>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="tile p-5"><p className="mb-2 font-semibold">Gaps you can fill</p><ul className="list-inside list-disc text-sm">{plan.competition.gaps.map((g) => <li key={g}>{g}</li>)}</ul></div>
            <div className="tile bg-brand/10 p-5"><p className="mb-2 font-semibold">Your edge</p><p className="text-sm">{plan.competition.yourEdge}</p></div>
          </div>
        </TabsContent>

        <TabsContent value="market" className="space-y-4">
          <Note />
          <div className="tile flex items-center gap-3 p-4"><span className="text-sm text-muted-foreground">Demand</span><Badge className="bg-brand uppercase text-primary-foreground">{plan.market.demandLevel}</Badge></div>
          <div className="grid gap-4 md:grid-cols-3">
            {plan.market.segments.map((s) => (
              <div key={s.segment} className="tile p-4"><p className="font-semibold">{s.segment}</p><p className="mt-1 text-sm text-muted-foreground">{s.needs}</p><p className="mt-2 text-xs text-coral">{s.willingnessToPay}</p></div>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[["What customers need but don't get", plan.market.unmetNeeds], ["What people in this area need", plan.market.localNeeds], ["Local trends", plan.market.trends]].map(([k, list]) => (
              <div key={k as string} className="tile p-5"><p className="mb-2 font-semibold">{k as string}</p><ul className="list-inside list-disc space-y-1 text-sm">{(list as string[]).map((x) => <li key={x}>{x}</li>)}</ul></div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="schemes" className="grid gap-4 md:grid-cols-2">
          {plan.schemes.map((s) => (
            <div key={s.name} className="tile p-5">
              <p className="font-semibold">{s.name}</p>
              <p className="text-xs text-coral">{s.provider}</p>
              <p className="mt-2 text-sm">{s.benefit}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.eligibility}</p>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
