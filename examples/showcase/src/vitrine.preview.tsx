import type { PreviewGlobals, PreviewWrapperProps } from "vite-plugin-react-vitrine/preview";
import { LocaleProvider } from "./locale";
import "./showcase.css";

export const globals = {
  theme: { label: "Theme", options: ["light", "dark"], default: "light" },
  locale: { label: "Locale", options: ["en", "ko"], default: "en" },
} as const satisfies PreviewGlobals;

export default function PreviewSetup({ children, globals: selected }: PreviewWrapperProps<typeof globals>) {
  return (
    <LocaleProvider locale={selected.locale}>
      <div className="theme" data-theme={selected.theme}>
        {children}
      </div>
    </LocaleProvider>
  );
}
