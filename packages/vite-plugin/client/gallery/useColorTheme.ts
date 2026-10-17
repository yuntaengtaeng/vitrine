import { isThemeChangedMessage, type NegotiatedCapabilities, type ThemeKind } from "@vitrine/protocol";
import { useEffect, useState } from "react";
import { resolveTheme } from "./colorTheme";

const DARK_QUERY = "(prefers-color-scheme: dark)";

/** Gallery 색 테마를 정해 `<html data-vt-theme>`에 적용 */
export const useColorTheme = (embedded: boolean, host: NegotiatedCapabilities | null): ThemeKind => {
  const [systemDark, setSystemDark] = useState(() => window.matchMedia(DARK_QUERY).matches);
  const [hostTheme, setHostTheme] = useState<ThemeKind | null>(null);

  useEffect(() => {
    const query = window.matchMedia(DARK_QUERY);
    const update = () => setSystemDark(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  // 확장은 handshake 응답 직후 테마를 보내므로 협상이 끝나기 전부터 받아 둠
  useEffect(() => {
    if (!embedded) return;
    const handleMessage = (event: MessageEvent) => {
      if (event.source === window.parent && isThemeChangedMessage(event.data)) setHostTheme(event.data.kind);
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [embedded]);

  const theme = resolveTheme({ host, hostTheme, systemDark });
  useEffect(() => {
    document.documentElement.dataset.vtTheme = theme;
  }, [theme]);
  return theme;
};
