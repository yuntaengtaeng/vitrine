import { keyframes, style } from "@vanilla-extract/css";
import { BRAND } from "@vitrine/brand";
import { vars } from "../../styles/theme.css";

export const titleAccent = style({ color: vars.color.accent });

export const groupLabel = style({
  margin: "clamp(2.5rem, 6vw, 3.5rem) 0 1rem",
  color: vars.color.textMuted,
  fontSize: "0.9375rem",
  fontWeight: 600,
});

export const cards = style({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "1rem",
  margin: 0,
  padding: 0,
  listStyle: "none",
});

const replay = `${cards}[data-replay="true"]`;

export const card = style({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  padding: "1.375rem",
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.large,
  background: vars.color.surfaceRaised,
  transition: "transform 300ms ease, border-color 300ms ease",
  selectors: {
    [`&[data-lit="true"], ${replay} &:hover`]: { transform: "translateY(-4px)", borderColor: vars.color.accent },
  },
  "@media": { "(prefers-reduced-motion: reduce)": { transition: "none" } },
});

export const spot = style({
  position: "absolute",
  inset: 0,
  borderRadius: "inherit",
  pointerEvents: "none",
  background: `radial-gradient(ellipse 70% 60% at 50% 0%, color-mix(in srgb, ${BRAND[400]} 24%, transparent), transparent 70%)`,
  opacity: 0,
  transition: "opacity 400ms ease",
  selectors: {
    [`${card}[data-lit="true"] &, ${replay} ${card}:hover &`]: { opacity: 1 },
  },
});

export const visual = style({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  minHeight: "124px",
  padding: "0.875rem",
  borderRadius: vars.radius.medium,
  background: vars.color.surface,
  overflow: "hidden",
});

export const text = style({
  position: "relative",
  margin: 0,
  color: vars.color.textMuted,
  fontSize: "0.9375rem",
  lineHeight: 1.6,
});

export const mini = style({
  margin: 0,
  fontFamily: vars.font.mono,
  fontSize: "0.8125rem",
  lineHeight: 1.6,
  whiteSpace: "pre",
});

export const muted = style({ color: vars.color.textMuted });

const glowOnce = keyframes({
  "0%": { background: "transparent" },
  "30%, 70%": { background: `color-mix(in srgb, ${vars.color.accent} 18%, transparent)` },
  "100%": { background: "transparent" },
});

export const glow = style({
  borderRadius: "4px",
  color: vars.color.accent,
  selectors: {
    [`${card}[data-lit="true"] &, ${replay} ${card}:hover &`]: { animation: `${glowOnce} 1.4s ease` },
  },
});

export const cursorLine = style({
  borderRadius: "3px",
  boxShadow: `inset 2px 0 0 ${vars.color.accent}`,
  paddingLeft: "4px",
  selectors: {
    [`${card}[data-lit="true"] &, ${replay} ${card}:hover &`]: { animation: `${glowOnce} 1.4s ease` },
  },
});

const rise = keyframes({
  from: { opacity: 0, transform: "translateY(6px)" },
  to: { opacity: 1, transform: "none" },
});

export const reveal = style({
  selectors: {
    [`${card}[data-lit="true"] &, ${replay} ${card}:hover &`]: { animation: `${rise} 0.5s ease 0.3s both` },
  },
});

export const stack = style({
  display: "flex",
  flexDirection: "column",
  gap: "0.625rem",
});

export const row = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "0.5rem",
  flexWrap: "wrap",
});

export const monoSmall = style({
  fontFamily: vars.font.mono,
  fontSize: "0.6875rem",
  whiteSpace: "nowrap",
});

export const badge = style({
  padding: "0.125rem 0.5rem",
  borderRadius: "999px",
  background: vars.color.accentSoft,
  color: vars.color.accent,
  fontSize: "0.6875rem",
  fontWeight: 600,
  whiteSpace: "nowrap",
});

export const profile = style({
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.375rem 0.5rem",
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.small,
  background: vars.color.surfaceRaised,
  fontSize: "0.8125rem",
  whiteSpace: "nowrap",
});

export const avatar = style({
  width: "20px",
  height: "20px",
  borderRadius: "50%",
  background: vars.color.accentSoft,
});

export const follow = style({
  marginLeft: "auto",
  padding: "0.1875rem 0.5rem",
  borderRadius: "6px",
  background: vars.color.accent,
  color: vars.color.onAccent,
  fontSize: "0.6875rem",
  fontWeight: 600,
});

export const control = style({
  display: "flex",
  alignItems: "center",
  gap: "0.625rem",
});

export const controlName = style({
  fontFamily: vars.font.mono,
  fontSize: "0.75rem",
  color: vars.color.textMuted,
});

export const select = style({
  flex: 1,
  padding: "0.25rem 0.5rem",
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.small,
  background: vars.color.surfaceRaised,
  fontSize: "0.8125rem",
});
