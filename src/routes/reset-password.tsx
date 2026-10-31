import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/LanguageSwitcher";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password — RiseHer" },
      { name: "description", content: "Set a new password for your RiseHer account." },
      { property: "og:title", content: "Reset password — RiseHer" },
      { property: "og:description", content: "Set a new password for your RiseHer account." },
    ],
  }),
  component: Reset,
});

function Reset() {
  const [pw, setPw] = useState("");
  const navigate = useNavigate();
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) return toast.error(error.message);
    toast.success("Password updated");
    navigate({ to: "/dashboard" });
  };
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-6">
      <Logo />
      <form onSubmit={save} className="w-full max-w-sm space-y-4 rounded-3xl bg-surface p-8 text-surface-foreground">
        <h1 className="text-2xl font-bold">New password</h1>
        <Input type="password" minLength={6} required value={pw} onChange={(e) => setPw(e.target.value)} className="bg-surface" />
        <Button variant="brand" className="w-full" type="submit">Save</Button>
      </form>
    </div>
  );
}
