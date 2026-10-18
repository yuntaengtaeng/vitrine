import { assignVars, createGlobalThemeContract, globalStyle } from "@vanilla-extract/css";
import { BRAND, INK, NEUTRAL, PAPER } from "@vitrine/brand";

/** 사이트 전체의 용도별 디자인 토큰, 값은 @vitrine/brand 팔레트에서만 조회 */
export const vars = createGlobalThemeContract({
  color: {
    background: "color-background",
    surface: "color-surface",
    surfaceRaised: "color-surface-raised",
    text: "color-text",
    textMuted: "color-text-muted",
    border: "color-border",
    accent: "color-accent",
    accentStrong: "color-accent-strong",
    accentSoft: "color-accent-soft",
    onAccent: "color-on-accent",
    codeBackground: "color-code-background",
    codeText: "color-code-text",
    codeComment: "color-code-comment",
    room: "color-room",
    roomText: "color-room-text",
    roomMuted: "color-room-muted",
    frame: "color-frame",
  },
  font: {
    body: "font-body",
    display: "font-display",
    mono: "font-mono",
  },
  radius: {
    small: "radius-small",
    medium: "radius-medium",
    large: "radius-large",
  },
  layout: {
    maxWidth: "layout-max-width",
    gutter: "layout-gutter",
  },
});

type ColorTokens = Record<keyof typeof vars.color, string>;

const lightColors: ColorTokens = {
  background: PAPER[50],
  surface: PAPER[100],
  surfaceRaised: NEUTRAL[0],
  text: INK[950],
  textMuted: INK[500],
  border: PAPER[200],
  accent: BRAND[600],
  accentStrong: BRAND[800],
  accentSoft: BRAND[100],
  onAccent: NEUTRAL[0],
  codeBackground: INK[900],
  codeText: INK[100],
  codeComment: BRAND[300],
  room: INK[950],
  roomText: INK[50],
  roomMuted: INK[300],
  frame: NEUTRAL[0],
};

const darkColors: ColorTokens = {
  background: INK[950],
  surface: INK[900],
  surfaceRaised: INK[800],
  text: INK[50],
  textMuted: INK[300],
  border: INK[700],
  accent: BRAND[400],
  accentStrong: BRAND[200],
  accentSoft: INK[700],
  onAccent: INK[950],
  codeBackground: INK[900],
  codeText: INK[100],
  codeComment: BRAND[300],
  room: INK[900],
  roomText: INK[50],
  roomMuted: INK[300],
  frame: INK[800],
};

globalStyle(":root", {
  vars: assignVars(vars, {
    color: lightColors,
    font: {
      body: '"Pretendard Variable", Pretendard, system-ui, -apple-system, "Segoe UI", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif',
      // 한글 글리프가 없어 한국어 제목은 본문 글꼴로 이어짐
      display: '"Instrument Serif", "Pretendard Variable", Pretendard, Georgia, serif',
      mono: '"JetBrains Mono Variable", ui-monospace, "SFMono-Regular", Menlo, monospace',
    },
    radius: { small: "6px", medium: "12px", large: "20px" },
    layout: { maxWidth: "1180px", gutter: "24px" },
  }),
  "@media": {
    "(prefers-color-scheme: dark)": {
      vars: assignVars(vars.color, darkColors),
      colorScheme: "dark",
    },
  },
});
