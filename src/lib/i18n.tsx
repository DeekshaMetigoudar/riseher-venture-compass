import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { DICTS } from "./languages";

type Ctx = { lang: string; setLang: (l: string) => void; t: (k: string) => string };
const I18n = createContext<Ctx>({ lang: "en", setLang: () => {}, t: (k) => DICTS.en[k] ?? k });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState("en");
  useEffect(() => {
    const saved = localStorage.getItem("riseher-lang");
    if (saved && DICTS[saved]) setLangState(saved);
  }, []);
  const setLang = (l: string) => {
    setLangState(l);
    localStorage.setItem("riseher-lang", l);
  };
  const t = (k: string) => DICTS[lang]?.[k] ?? DICTS.en[k] ?? k;
  return <I18n.Provider value={{ lang, setLang, t }}>{children}</I18n.Provider>;
}

export const useI18n = () => useContext(I18n);
