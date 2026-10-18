import { assignVars, createGlobalTheme, createGlobalThemeContract, globalStyle } from "@vanilla-extract/css";
import { BRAND, INK, NEUTRAL, RED } from "@vitrine/brand";

// 다크 모드와 VS Code 테마는 같은 계약에 값만 바꿔 적용하므로 이름을 CSS 변수로 고정
export const vars = createGlobalThemeContract(
  {
    color: {
      surface: "color-surface",
      surfaceSubtle: "color-surface-subtle",
      sidebar: "color-sidebar",
      sidebarActive: "color-sidebar-active",
      hover: "color-hover",
      border: "color-border",
      text: "color-text",
      /** 흰 배경과 사이드바 배경 모두에서 4.5:1 이상 */
      textMuted: "color-text-muted",
      accent: "color-accent",
      accentSoft: "color-accent-soft",
      error: "color-error",
      errorSoft: "color-error-soft",
      errorBorder: "color-error-border",
      stageDot: "color-stage-dot",
      frameBorder: "color-frame-border",
      switchOff: "color-switch-off",
    },
    space: {
      xs: "space-xs",
      sm: "space-sm",
      md: "space-md",
      lg: "space-lg",
      xl: "space-xl",
      xxl: "space-xxl",
    },
    radius: {
      sm: "radius-sm",
      md: "radius-md",
      lg: "radius-lg",
      full: "radius-full",
    },
    font: {
      ui: "font-ui",
      mono: "font-mono",
    },
    fontSize: {
      caption: "font-size-caption",
      label: "font-size-label",
      secondary: "font-size-secondary",
      base: "font-size-base",
      title: "font-size-title",
    },
  },
  (_value, path) => `vt-${path.join("-")}`,
);

type ColorTokens = Record<keyof typeof vars.color, string>;

const darkColors: ColorTokens = {
  surface: INK[900],
  surfaceSubtle: INK[800],
  sidebar: INK[950],
  sidebarActive: INK[700],
  hover: INK[800],
  border: INK[700],
  text: INK[50],
  textMuted: INK[300],
  accent: BRAND[300],
  accentSoft: INK[800],
  error: RED[400],
  errorSoft: RED[900],
  errorBorder: RED[600],
  stageDot: INK[700],
  frameBorder: INK[500],
  switchOff: INK[500],
};

createGlobalTheme(":root", vars, {
  color: {
    surface: NEUTRAL[0],
    surfaceSubtle: NEUTRAL[50],
    sidebar: BRAND[50],
    sidebarActive: BRAND[100],
    hover: NEUTRAL[100],
    border: NEUTRAL[200],
    text: NEUTRAL[800],
    textMuted: NEUTRAL[600],
    accent: BRAND[600],
    accentSoft: BRAND[50],
    error: RED[600],
    errorSoft: RED[50],
    errorBorder: RED[200],
    stageDot: NEUTRAL[200],
    frameBorder: BRAND[200],
    switchOff: NEUTRAL[300],
  },
  space: { xs: "4px", sm: "8px", md: "12px", lg: "16px", xl: "24px", xxl: "32px" },
  radius: { sm: "4px", md: "6px", lg: "8px", full: "999px" },
  font: {
    ui: "system-ui, sans-serif",
    mono: "ui-monospace, SFMono-Regular, Menlo, monospace",
  },
  fontSize: { caption: "0.68rem", label: "0.75rem", secondary: "0.85rem", base: "0.88rem", title: "1rem" },
});

globalStyle("body", {
  margin: 0,
  background: vars.color.surface,
  color: vars.color.text,
  fontFamily: vars.font.ui,
});

globalStyle("*, *::before, *::after", { boxSizing: "border-box" });

globalStyle(":focus-visible", {
  outline: `2px solid ${vars.color.accent}`,
  outlineOffset: 2,
});

globalStyle(':root[data-vt-theme="dark"]', {
  colorScheme: "dark",
  vars: assignVars(vars.color, darkColors),
});
