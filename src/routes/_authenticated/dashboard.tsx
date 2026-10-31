import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Sparkles, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { generatePlan } from "@/lib/plan.functions";
import { useI18n } from "@/lib/i18n";
import { LANGS } from "@/lib/languages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Find your business — RiseHer" },
      { name: "description", content: "Tell RiseHer your skills, time, budget and area to get a full business plan." },
      { property: "og:title", content: "Find your business — RiseHer" },
      { property: "og:description", content: "Get a personalised business plan in your language." },
    ],
  }),
  component: Dashboard,
});

type Row = { id: string; title: string; created_at: string; language: string };

function Dashboard() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const gen = useServerFn(generatePlan);
  const [plans, setPlans] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({ name: "", skills: "", hours: "2-4 hours", budget: "", location: "", interests: "" });

  useEffect(() => {
    supabase
      .from("plans")
      .select("id,title,created_at,language")
      .order("created_at", { ascending: false })
      .then(({ data }) => setPlans(data ?? []));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { id } = await gen({ data: { ...f, language: lang } });
      navigate({ to: "/plan/$id", params: { id } });
    } catch (err) {
      toast.error((err as Error).message);
      setBusy(false);
    }
  };

  const field = (k: keyof typeof f, label: string, ph?: string) => (
    <div className="space-y-1.5">
      <Label htmlFor={k}>{label}</Label>
      <Input id={k} required={k !== "interests"} placeholder={ph} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
    </div>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
      <form onSubmit={submit} className="tile space-y-5 p-6 md:p-8">
        <h1 className="text-3xl font-extrabold">{t("newPlan")}</h1>
        <div className="grid gap-4 md:grid-cols-2">
          {field("name", t("yourName"))}
          {field("location", t("location"), t("locationPh"))}
        </div>
        {field("skills", t("skills"), t("skillsPh"))}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="hours">{t("hours")}</Label>
            <select id="hours" value={f.hours} onChange={(e) => setF({ ...f, hours: e.target.value })} className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm">
              {["Less than 2 hours", "2-4 hours", "4-6 hours", "Full day"].map((h) => (
                <option key={h} className="bg-popover">{h}</option>
              ))}
            </select>
          </div>
          {field("budget", t("budget"), t("budgetPh"))}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="interests">{t("interests")}</Label>
          <Textarea id="interests" value={f.interests} onChange={(e) => setF({ ...f, interests: e.target.value })} />
        </div>
        <Button type="submit" variant="brand" size="lg" className="w-full" disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} {t("generate")}
        </Button>
        {busy && <p className="text-center text-sm text-muted-foreground">{t("generating")}</p>}
      </form>
      <aside className="space-y-3">
        <h2 className="text-xl font-bold">{t("myPlans")}</h2>
        {plans.length === 0 && <p className="text-sm text-muted-foreground">{t("noPlans")}</p>}
        {plans.map((p) => (
          <Link key={p.id} to="/plan/$id" params={{ id: p.id }} className="tile flex items-center justify-between p-4 transition hover:bg-accent">
            <div>
              <p className="font-semibold">{p.title}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(p.created_at).toLocaleDateString()} · {LANGS.find((l) => l.code === p.language)?.label}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-coral" />
          </Link>
        ))}
      </aside>
    </div>
  );
}
