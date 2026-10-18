import { THEME_SYNC_CAPABILITY, type NegotiatedCapabilities, type ThemeKind } from "@vitrine/protocol";

/** VS Code가 테마를 알려주기로 했으면 그 테마, 아니면 브라우저와 OS 설정 */
export function resolveTheme(input: {
  host: NegotiatedCapabilities | null;
  hostTheme: ThemeKind | null;
  systemDark: boolean;
}): ThemeKind {
  const synced = input.host?.supported[THEME_SYNC_CAPABILITY] !== undefined;
  if (synced && input.hostTheme) return input.hostTheme;
  return input.systemDark ? "dark" : "light";
}
