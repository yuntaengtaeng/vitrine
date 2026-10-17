import { BRAND, INK, NEUTRAL, RED } from "@vitrine/brand";

/** 갤러리 UI 용도별 색상 토큰, 값은 palette에서만 조회 */
export const COLOR = {
  surface: NEUTRAL[0],
  surfaceSubtle: NEUTRAL[50],
  border: NEUTRAL[200],
  label: NEUTRAL[400],
  body: NEUTRAL[800],
  muted: NEUTRAL[500],
  error: RED[600],
  activeBg: BRAND[50],
  activeText: BRAND[600],
  hoverBg: NEUTRAL[100],
  switchOff: NEUTRAL[300],
  sidebarBg: BRAND[50],
  sidebarActiveBg: BRAND[100],
  sidebarHoverBg: NEUTRAL[0],
  stageDot: NEUTRAL[200],
  frameBorder: BRAND[200],
  frameDarkBg: INK[900],
  frameDarkBorder: INK[700],
  checkerLight: NEUTRAL[0],
  checkerDark: NEUTRAL[200],
} as const;
