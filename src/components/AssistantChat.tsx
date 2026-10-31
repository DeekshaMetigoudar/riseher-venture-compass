import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { MessageCircle, Send, X, Sparkles } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { askAssistant } from "@/lib/plan.functions";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Tiny store so the plan page can share its plan with the assistant.
let planContext = "";
const listeners = new Set<() => void>();
export function setAssistantContext(ctx: string) {
  planContext = ctx;
  listeners.forEach((l) => l());
}
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

type Msg = { role: "user" | "assistant"; content: string };

export function AssistantChat() {
  const { t, lang } = useI18n();
  const ctx = useSyncExternalStore(subscribe, () => planContext, () => "");
  const ask = useServerFn(askAssistant);
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [msgs, busy]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || busy) return;
    const next = [...msgs, { role: "user" as const, content: input.trim() }];
    setMsgs(next);
    setInput("");
    setBusy(true);
    try {
      const { reply } = await ask({ data: { language: lang, context: ctx, messages: next } });
      setMsgs([...next, { role: "assistant", content: reply }]);
    } catch (err) {
      setMsgs([...next, { role: "assistant", content: `⚠️ ${(err as Error).message}` }]);
    } finally {
      setBusy(false);
    }
  };

  if (!open)
    return (
      <Button variant="brand" size="lg" className="fixed bottom-6 right-6 z-50 h-14" onClick={() => setOpen(true)}>
        <MessageCircle className="h-5 w-5" /> {t("assistant")}
      </Button>
    );

  return (
    <div className="fixed bottom-6 right-6 z-50 flex h-[32rem] w-[min(24rem,calc(100vw-3rem))] flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-glow">
      <div className="flex items-center justify-between bg-brand px-4 py-3 text-primary-foreground">
        <span className="flex items-center gap-2 font-semibold"><Sparkles className="h-4 w-4" /> {t("assistant")}</span>
        <button onClick={() => setOpen(false)} aria-label="Close"><X className="h-4 w-4" /></button>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
        {msgs.length === 0 && <p className="text-muted-foreground">{t("f5d")}</p>}
        {msgs.map((m, i) => (
          <div key={i} className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 ${m.role === "user" ? "ml-auto bg-primary text-primary-foreground" : "bg-secondary"}`}>
            {m.content}
          </div>
        ))}
        {busy && <div className="w-16 animate-pulse rounded-2xl bg-secondary px-3 py-2">…</div>}
        <div ref={endRef} />
      </div>
      <form onSubmit={send} className="flex gap-2 border-t border-border p-3">
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder={t("askPh")} />
        <Button type="submit" size="icon" variant="brand" disabled={busy} aria-label={t("send")}><Send className="h-4 w-4" /></Button>
      </form>
    </div>
  );
}
