import type { PreviewWrapperProps } from "vite-plugin-react-vitrine/preview";
import { DarkModeProvider } from "./DarkModeProvider";

export default function PreviewSetup({ children }: PreviewWrapperProps) {
  return <DarkModeProvider>{children}</DarkModeProvider>;
}
