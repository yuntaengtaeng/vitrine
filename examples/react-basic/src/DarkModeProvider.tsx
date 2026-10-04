import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

interface DarkModeContextValue {
  dark: boolean;
  toggle: () => void;
}

const DarkModeContext = createContext<DarkModeContextValue | null>(null);

export const DarkModeProvider = ({ children }: { children: ReactNode }) => {
  const [dark, setDark] = useState(false);
  const value = useMemo(
    () => ({ dark, toggle: () => setDark((current) => !current) }),
    [dark],
  );
  return <DarkModeContext.Provider value={value}>{children}</DarkModeContext.Provider>;
};

export const useDarkMode = () => {
  const value = useContext(DarkModeContext);
  if (!value) throw new Error("useDarkMode must be used inside DarkModeProvider");
  return value;
};
