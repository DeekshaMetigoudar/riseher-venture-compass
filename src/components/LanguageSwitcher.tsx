import { Languages } from "lucide-react";
import { LANGS } from "@/lib/languages";
import { useI18n } from "@/lib/i18n";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function LanguageSwitcher() {
  const { lang, setLang, t } = useI18n();
  return (
    <Select value={lang} onValueChange={setLang}>
      <SelectTrigger className="tile h-9 w-auto gap-2 rounded-full px-3" aria-label={t("language")}>
        <Languages className="h-4 w-4 text-coral" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {LANGS.map((l) => (
          <SelectItem key={l.code} value={l.code}>
            {l.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function Logo({ small }: { small?: boolean }) {
  return (
    <span className={`font-display font-black tracking-tight ${small ? "text-2xl" : "text-5xl"}`}>
      RISE<span className="text-brand">HER</span>
    </span>
  );
}
