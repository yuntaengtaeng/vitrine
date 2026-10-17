import type { PreviewGlobals, PreviewWrapperProps } from "vite-plugin-react-vitrine/preview";
import { DarkModeProvider } from "./DarkModeProvider";
import { LocaleProvider } from "./LocaleProvider";
import "./index.css";

export const globals = {
  locale: { label: "Locale", options: ["en", "ko"], default: "en" },
} as const satisfies PreviewGlobals;

export default function PreviewSetup({ children, globals: selected }: PreviewWrapperProps<typeof globals>) {
  return (
    <LocaleProvider locale={selected.locale}>
      <DarkModeProvider>{children}</DarkModeProvider>
    </LocaleProvider>
  );
}
