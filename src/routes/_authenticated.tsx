import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher, Logo } from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { AssistantChat } from "@/components/AssistantChat";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/" });
  },
  component: Layout,
});

function Layout() {
  const { t } = useI18n();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link to="/dashboard"><Logo small /></Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Button
            variant="glass"
            size="sm"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/" });
            }}
          >
            <LogOut className="h-4 w-4" /> {t("logout")}
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 pb-24">
        <Outlet />
      </main>
      <AssistantChat />
    </div>
  );
}
