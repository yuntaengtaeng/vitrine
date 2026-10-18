import { keyframes, style } from "@vanilla-extract/css";
import { vars } from "../../styles/theme.css";

export const tabs = style({
  display: "flex",
  gap: "0.5rem",
  margin: "2.5rem 0 1.5rem",
});

export const tab = style({
  padding: "0.5rem 1.125rem",
  border: `1px solid ${vars.color.border}`,
  borderRadius: "999px",
  background: "transparent",
  color: vars.color.textMuted,
  font: "inherit",
  fontWeight: 600,
  cursor: "pointer",
  selectors: {
    "&:hover": { color: vars.color.text },
    '&[aria-selected="true"]': { borderColor: vars.color.accent, background: vars.color.accent, color: vars.color.onAccent },
  },
});

export const layout = style({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.1fr)",
  gap: "3rem",
  alignItems: "start",
  "@media": {
    "(max-width: 860px)": { gridTemplateColumns: "minmax(0, 1fr)", gap: "2rem" },
  },
});

export const catalog = style({
  display: "grid",
  gap: "1.75rem",
});

export const list = style({
  display: "flex",
  flexWrap: "wrap",
  gap: "0.25rem 1.5rem",
  margin: 0,
  padding: "0 0 0.75rem",
  borderBottom: `1px solid ${vars.color.border}`,
  listStyle: "none",
});

export const item = style({
  padding: "0.375rem 0",
  border: "none",
  borderBottom: "2px solid transparent",
  background: "transparent",
  color: vars.color.textMuted,
  font: "inherit",
  fontSize: "0.9375rem",
  cursor: "pointer",
  selectors: {
    "&:hover": { color: vars.color.text },
    '&[aria-pressed="true"]': { borderBottomColor: vars.color.accent, color: vars.color.text, fontWeight: 650 },
  },
});

const enter = keyframes({ from: { opacity: 0, transform: "translateY(6px)" }, to: { opacity: 1, transform: "none" } });

// 기능이 바뀔 때마다 key로 다시 그려져 설명도 장면과 함께 나타남
export const detail = style({
  display: "grid",
  gap: "1.25rem",
  animation: `${enter} 220ms ease`,
  "@media": { "(prefers-reduced-motion: reduce)": { animation: "none" } },
});

export const text = style({
  margin: 0,
  color: vars.color.textMuted,
});
