import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Compass, Gauge, Route as RouteIcon, Landmark, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher, Logo } from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RiseHer — Rise. Build. Own it." },
      { name: "description", content: "Turn your skills into a business that's truly yours. AI ideas, roadmap, budget, pricing and market research in your language." },
      { property: "og:title", content: "RiseHer — Rise. Build. Own it." },
      { property: "og:description", content: "AI business planner for women entrepreneurs, in regional languages." },
    ],
  }),
  component: Index,
});

function Index() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
    const { data } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate({ to: "/dashboard" });
    });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { data, error } =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
    setBusy(false);
    if (error) return toast.error(error.message);
    if (mode === "register" && !data.session) toast.success(t("checkEmail"));
  };

  const forgot = async () => {
    if (!email) return toast.error(t("email"));
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error(error.message);
    else toast.success(t("resetSent"));
  };

  const features = [
    { icon: Compass, title: t("f1t"), desc: t("f1d") },
    { icon: Gauge, title: t("f2t"), desc: t("f2d") },
    { icon: RouteIcon, title: t("f3t"), desc: t("f3d") },
    { icon: Landmark, title: t("f4t"), desc: t("f4d") },
    { icon: Sparkles, title: t("f5t"), desc: t("f5d") },
  ];

  return (
    <div className="min-h-screen px-6 pb-16">
      <header className="mx-auto flex max-w-6xl items-center justify-between py-8">
        <div className="w-32" />
        <div className="text-center">
          <Logo />
          <div className="mx-auto mt-1 h-0.5 w-full bg-brand" />
        </div>
        <div className="flex w-32 justify-end">
          <LanguageSwitcher />
        </div>
      </header>
      <p className="mb-10 text-center text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
        {t("tagline")}
      </p>
      <main className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <section>
          <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">
            {t("hero1")} <em className="text-brand">{t("hero2")}</em>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">{t("heroSub")}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {features.map((f) => (
              <div key={f.title} className="tile flex gap-3 p-4">
                <f.icon className="mt-0.5 h-5 w-5 shrink-0 text-coral" />
                <div>
                  <p className="font-semibold">{f.title}</p>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-3xl bg-surface p-8 text-surface-foreground shadow-glow">
          <div className="mb-6 grid grid-cols-2 rounded-full bg-peach/25 p-1">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`rounded-full py-2 text-sm transition ${mode === m ? "bg-background text-foreground" : ""}`}
              >
                {t(m)}
              </button>
            ))}
          </div>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">{t("email")}</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="border-surface-foreground/15 bg-surface" />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <Label htmlFor="pw">{t("password")}</Label>
                {mode === "login" && (
                  <button type="button" onClick={forgot} className="text-xs text-coral">
                    {t("forgot")}
                  </button>
                )}
              </div>
              <Input id="pw" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="border-surface-foreground/15 bg-surface" />
            </div>
            <Button type="submit" variant="brand" size="lg" className="w-full" disabled={busy}>
              {mode === "login" ? t("loginBtn") : t("registerBtn")}
            </Button>
          </form>
        </section>
      </main>
    </div>
  );
}
