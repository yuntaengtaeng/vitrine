import { createContext, useContext, type ReactNode } from "react";

export type Locale = "en" | "ko";

const LocaleContext = createContext<Locale>("en");

export const LocaleProvider = ({ locale, children }: { locale: Locale; children: ReactNode }) => (
  <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
);

export const useLocale = () => useContext(LocaleContext);
