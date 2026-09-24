import { keyframes, style } from "@vanilla-extract/css";
import { BRAND, INK, NEUTRAL } from "@vitrine/brand";
import { vars } from "../../styles/theme.css";

export const demo = style({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.15fr) minmax(0, 0.85fr)",
  marginTop: "3.5rem",
  overflow: "hidden",
  border: `1px solid ${INK[700]}`,
  background: INK[900],
  "@media": {
    "(max-width: 760px)": { gridTemplateColumns: "minmax(0, 1fr)" },
  },
});

export const editor = style({ minWidth: 0 });

export const preview = style({
  minWidth: 0,
  borderLeft: `1px solid ${INK[700]}`,
  "@media": {
    "(max-width: 760px)": { borderLeft: 0, borderTop: `1px solid ${INK[700]}` },
  },
});

export const bar = style({
  height: "42px",
  padding: "0.7rem 1rem",
  borderBottom: `1px solid ${INK[700]}`,
  color: INK[300],
  fontFamily: vars.font.mono,
  fontSize: "0.75rem",
});

export const previewBar = style({
  display: "flex",
  justifyContent: "space-between",
  gap: "1rem",
});

export const status = style({ color: BRAND[300] });
export const readyStatus = style({ color: BRAND[300], fontWeight: 650 });

export const code = style({
  minHeight: "230px",
  margin: 0,
  padding: "1.5rem",
  color: INK[100],
  fontFamily: vars.font.mono,
  fontSize: "clamp(0.75rem, 1.5vw, 0.875rem)",
  lineHeight: 1.75,
  whiteSpace: "pre-wrap",
  overflowWrap: "anywhere",
});

export const codeLine = style({ display: "block" });

export const activeLine = style({
  display: "block",
  marginInline: "-1.5rem",
  paddingInline: "calc(1.5rem - 2px)",
  borderLeft: `2px solid ${BRAND[400]}`,
  background: `color-mix(in srgb, ${BRAND[400]} 14%, transparent)`,
  transition: "background 180ms ease",
});

const blink = keyframes({
  "0%, 45%": { opacity: 1 },
  "46%, 100%": { opacity: 0 },
});

export const caret = style({
  display: "inline-block",
  width: "2px",
  height: "1.1em",
  marginLeft: "2px",
  verticalAlign: "text-bottom",
  background: BRAND[300],
  animation: `${blink} 700ms step-end infinite`,
  "@media": {
    "(prefers-reduced-motion: reduce)": { animation: "none" },
  },
});

export const gallery = style({
  display: "grid",
  gridTemplateColumns: "92px minmax(0, 1fr)",
  minHeight: "230px",
});

export const galleryWithoutSidebar = style({
  gridTemplateColumns: "minmax(0, 1fr)",
});

export const sidebar = style({
  display: "grid",
  alignContent: "start",
  gap: "0.25rem",
  padding: "1rem 0.625rem",
  borderRight: `1px solid ${INK[700]}`,
  background: INK[900],
  fontSize: "0.6875rem",
});

export const sidebarGroup = style({
  marginBottom: "0.25rem",
  color: INK[300],
  fontWeight: 650,
});

export const sidebarItem = style({
  padding: "0.3rem 0.4rem",
  color: INK[300],
});

export const activeItem = style([sidebarItem, {
  borderLeft: `2px solid ${BRAND[400]}`,
  background: `color-mix(in srgb, ${BRAND[400]} 14%, transparent)`,
  color: INK[50],
}]);

export const canvas = style({
  position: "relative",
  display: "grid",
  overflow: "hidden",
  placeItems: "center",
  padding: "1.5rem",
  background: INK[950],
});

const scan = keyframes({
  from: { transform: "translateY(-106px)" },
  to: { transform: "translateY(106px)" },
});

export const scanLine = style({
  position: "absolute",
  left: "12%",
  right: "12%",
  top: "50%",
  height: "1px",
  background: BRAND[400],
  animation: `${scan} 420ms ease-in-out both`,
});

const previewEnter = keyframes({
  from: { opacity: 0, transform: "translateY(14px) scale(0.96)" },
  to: { opacity: 1, transform: "none" },
});

export const previewButton = style({
  padding: "0.7rem 1.25rem",
  background: BRAND[600],
  color: NEUTRAL[0],
  fontSize: "0.9375rem",
  fontWeight: 650,
  animation: `${previewEnter} 300ms cubic-bezier(0.2, 0.8, 0.2, 1) both`,
  "@media": {
    "(prefers-reduced-motion: reduce)": { animation: "none" },
  },
});

export const previewBadge = style([previewButton, {
  padding: "0.35rem 0.7rem",
  border: `1px solid ${BRAND[400]}`,
  background: "transparent",
  color: BRAND[300],
  fontSize: "0.75rem",
}]);

export const waiting = style({
  maxWidth: "18ch",
  color: INK[300],
  fontSize: "0.875rem",
  textAlign: "center",
});
