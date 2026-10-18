import { globalStyle, keyframes, style } from "@vanilla-extract/css";
import { BRAND, INK, RED } from "@vitrine/brand";
import { vars } from "../../styles/theme.css";

const rise = keyframes({
  from: { opacity: 0, transform: "translateY(6px)" },
  to: { opacity: 1, transform: "none" },
});

const motion = (delay: string) => ({
  animation: `${rise} 0.4s ease ${delay} both`,
  "@media": { "(prefers-reduced-motion: reduce)": { animation: "none" } },
});

export const root = style({ display: "flex", flexDirection: "column", gap: "1rem" });

export const tabs = style({ display: "flex", flexWrap: "wrap", gap: "0.5rem" });

export const tab = style({
  minHeight: "40px",
  paddingInline: "1rem",
  border: `1px solid ${vars.color.border}`,
  borderRadius: "999px",
  background: vars.color.surfaceRaised,
  color: vars.color.textMuted,
  font: "inherit",
  fontSize: "0.875rem",
  fontWeight: 600,
  cursor: "pointer",
  selectors: {
    "&:hover": { color: vars.color.text },
    '&[aria-pressed="true"]': { borderColor: vars.color.text, background: vars.color.text, color: vars.color.background },
  },
});

export const window = style({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.15fr) minmax(0, 1fr)",
  overflow: "hidden",
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.large,
  "@media": { "(max-width: 760px)": { gridTemplateColumns: "minmax(0, 1fr)" } },
});

export const conversation = style({
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  minHeight: "260px",
  padding: "1.375rem",
  background: vars.color.surface,
});

export const channel = style({ margin: 0, color: vars.color.textMuted, fontSize: "0.8125rem" });

export const message = style({ display: "flex", alignItems: "flex-start", gap: "0.75rem", ...motion("0.1s") });

export const reply = style(motion("0.9s"));

export const avatar = style({
  flex: "none",
  display: "grid",
  placeItems: "center",
  width: "32px",
  height: "32px",
  borderRadius: "9px",
  color: "#ffffff",
  fontSize: "0.8125rem",
  fontWeight: 650,
  selectors: { '&[data-me="true"]': { background: vars.color.text, color: vars.color.background } },
});

export const body = style({
  display: "flex",
  flexDirection: "column",
  gap: "0.3125rem",
  minWidth: 0,
  fontSize: "0.9375rem",
  lineHeight: 1.5,
});

export const author = style({ fontSize: "0.8125rem", fontWeight: 650 });

export const role = style({ fontWeight: 400, color: vars.color.textMuted });

export const link = style({
  alignSelf: "flex-start",
  maxWidth: "100%",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  padding: "0.375rem 0.625rem",
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.small,
  background: vars.color.surfaceRaised,
  color: vars.color.accent,
  fontFamily: vars.font.mono,
  fontSize: "0.75rem",
});

export const gallery = style({
  display: "flex",
  flexDirection: "column",
  borderLeft: `1px solid ${vars.color.border}`,
  "@media": { "(max-width: 760px)": { borderLeft: "none", borderTop: `1px solid ${vars.color.border}` } },
});

export const galleryBar = style({
  margin: 0,
  padding: "0.75rem 1rem",
  borderBottom: `1px solid ${vars.color.border}`,
  color: vars.color.textMuted,
  fontFamily: vars.font.mono,
  fontSize: "0.75rem",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

export const stage = style({
  flex: 1,
  minHeight: "220px",
  display: "grid",
  placeItems: "center",
  padding: "1.5rem",
  backgroundImage: `radial-gradient(${vars.color.border} 1px, transparent 1px)`,
  backgroundSize: "14px 14px",
  ...motion("1.4s"),
});

export const center = style({ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" });

export const caption = style({ color: vars.color.textMuted, fontFamily: vars.font.mono, fontSize: "0.75rem" });

export const button = style({
  display: "inline-flex",
  padding: "0.6875rem 1.25rem",
  borderRadius: vars.radius.small,
  background: BRAND[600],
  color: "#ffffff",
  fontWeight: 600,
  whiteSpace: "nowrap",
  selectors: { '&[data-disabled="true"]': { opacity: 0.45 } },
});

export const toast = style({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.625rem",
  maxWidth: "280px",
  padding: "0.6875rem 0.875rem",
  borderRadius: vars.radius.medium,
  background: INK[900],
  color: INK[50],
  fontSize: "0.8125rem",
  lineHeight: 1.45,
});

export const toastDot = style({
  flex: "none",
  width: "8px",
  height: "8px",
  borderRadius: "50%",
  background: "#4ade80",
  selectors: { [`${toast}[data-tone="error"] &`]: { background: RED[400] } },
});

export const miniGallery = style({
  width: "100%",
  maxWidth: "300px",
  overflow: "hidden",
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.medium,
  background: vars.color.surfaceRaised,
});

export const miniHint = style({
  margin: 0,
  padding: "0.5rem 0.75rem",
  borderBottom: `1px solid ${vars.color.border}`,
  color: vars.color.textMuted,
  fontSize: "0.6875rem",
});

export const miniBody = style({ display: "flex" });

export const miniSidebar = style({
  display: "flex",
  flexDirection: "column",
  gap: "0.375rem",
  width: "84px",
  padding: "0.625rem",
  borderRight: `1px solid ${vars.color.border}`,
  color: vars.color.textMuted,
  fontSize: "0.6875rem",
});

globalStyle(`${miniSidebar} > [data-current="true"]`, { color: vars.color.accent, fontWeight: 650 });

export const miniStage = style({ flex: 1, display: "grid", placeItems: "center", padding: "1rem 0.625rem" });

export const search = style({ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%", maxWidth: "260px" });

export const searchBox = style({
  padding: "0.5rem 0.75rem",
  border: `1px solid ${vars.color.accent}`,
  borderRadius: vars.radius.small,
  background: vars.color.surfaceRaised,
  fontSize: "0.8125rem",
});

export const result = style({
  padding: "0.5rem 0.75rem",
  borderRadius: vars.radius.small,
  color: vars.color.textMuted,
  fontSize: "0.8125rem",
  selectors: {
    '&[data-current="true"]': { background: vars.color.accentSoft, color: vars.color.accent, fontWeight: 650 },
  },
});
