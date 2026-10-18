import { style } from "@vanilla-extract/css";
import { vars } from "../../styles/theme.css";

// 위에서 떨어지는 전시 조명
export const hero = style({
  paddingBlock: "clamp(3.5rem, 9vw, 6.5rem) clamp(3rem, 8vw, 5rem)",
  background: `radial-gradient(ellipse 55% 45% at 50% 0%, ${vars.color.accentSoft}, transparent 75%)`,
  overflow: "hidden",
});

export const label = style({
  margin: 0,
  color: vars.color.textMuted,
  fontFamily: vars.font.mono,
  fontSize: "0.75rem",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
});

export const title = style({
  margin: "1rem 0 0",
  fontFamily: vars.font.display,
  fontSize: "clamp(3.5rem, 11vw, 8.5rem)",
  fontWeight: 400,
  lineHeight: 0.95,
  letterSpacing: "-0.02em",
});

// 한글은 이탤릭 글꼴이 없어 기울인 모양이 어색하므로 바로 세움
export const titleAccent = style({
  display: "block",
  color: vars.color.accent,
  fontStyle: "italic",
  selectors: { ":lang(ko) &": { fontStyle: "normal" } },
});

export const intro = style({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.2fr) auto",
  gridTemplateAreas: '"lead actions" "lead command"',
  alignItems: "start",
  gap: "1rem 3rem",
  marginTop: "2rem",
  "@media": {
    "(max-width: 860px)": {
      gridTemplateColumns: "minmax(0, 1fr)",
      gridTemplateAreas: '"lead" "actions" "command"',
    },
  },
});

export const lead = style({
  gridArea: "lead",
  maxWidth: "46ch",
  margin: 0,
  color: vars.color.textMuted,
  fontSize: "1.1875rem",
});

export const actions = style({
  gridArea: "actions",
  display: "flex",
  flexWrap: "wrap",
  gap: "0.75rem",
});

const button = style({
  display: "inline-flex",
  alignItems: "center",
  height: "48px",
  paddingInline: "1.375rem",
  borderRadius: "999px",
  fontWeight: 600,
  textDecoration: "none",
});

export const primary = style([
  button,
  {
    background: vars.color.accent,
    color: vars.color.onAccent,
    selectors: { "&:hover": { background: vars.color.accentStrong } },
  },
]);

export const secondary = style([
  button,
  {
    border: `1px solid ${vars.color.border}`,
    background: vars.color.surfaceRaised,
    selectors: { "&:hover": { borderColor: vars.color.accent } },
  },
]);

export const exhibit = style({
  position: "relative",
  margin: "clamp(3rem, 7vw, 4.5rem) 0 0",
});

// 진열장 유리, 비스듬한 반사광을 내용 위에 얹음
export const glass = style({
  position: "relative",
  padding: "clamp(0.5rem, 1.5vw, 1rem)",
  border: "1px solid rgba(255, 255, 255, 0.7)",
  borderRadius: "4px",
  background: "rgba(255, 255, 255, 0.45)",
  boxShadow: `inset 0 0 0 1px ${vars.color.border}, 0 40px 80px -40px rgba(16, 55, 188, 0.45)`,
  selectors: {
    "&::after": {
      content: '""',
      position: "absolute",
      inset: 0,
      background: "linear-gradient(115deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0) 32%)",
      pointerEvents: "none",
    },
  },
  "@media": {
    "(prefers-color-scheme: dark)": {
      border: "1px solid rgba(255, 255, 255, 0.12)",
      background: "rgba(255, 255, 255, 0.04)",
    },
  },
});

export const screenshot = style({
  display: "block",
  width: "100%",
  height: "auto",
});

export const plinth = style({
  height: "clamp(1.25rem, 3vw, 2rem)",
  marginInline: "clamp(1rem, 4vw, 3rem)",
  background: `linear-gradient(${vars.color.surface}, ${vars.color.border})`,
  boxShadow: "0 30px 50px -30px rgba(8, 11, 28, 0.55)",
});

export const caption = style({
  display: "flex",
  justifyContent: "flex-end",
  marginTop: "1.5rem",
});
