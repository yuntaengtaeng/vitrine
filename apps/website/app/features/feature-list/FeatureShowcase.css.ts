import { keyframes, style } from "@vanilla-extract/css";
import { BRAND, INK, NEUTRAL, RED } from "@vitrine/brand";
import { vars } from "../../styles/theme.css";

export const frame = style({
  position: "relative",
  height: "260px",
  overflow: "hidden",
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
});

export const scene = style({
  position: "absolute",
  inset: 0,
  display: "grid",
  opacity: 0,
  transform: "translateY(8px)",
  transition: "opacity 220ms ease, transform 220ms ease",
  pointerEvents: "none",
  "@media": {
    "(prefers-reduced-motion: reduce)": { transition: "none" },
  },
});

export const sceneActive = style({ opacity: 1, transform: "none" });

export const toolbar = style({
  display: "flex",
  alignItems: "center",
  gap: "1.25rem",
  height: "44px",
  paddingInline: "1rem",
  borderBottom: `1px solid ${vars.color.border}`,
  color: vars.color.textMuted,
  fontSize: "0.8125rem",
});

export const activeTab = style({ color: vars.color.accent, fontWeight: 650 });

export const canvas = style({ display: "grid", placeItems: "center" });

export const dangerButton = style({
  padding: "0.625rem 1rem",
  background: RED[600],
  color: NEUTRAL[0],
  fontSize: "0.875rem",
  fontWeight: 650,
});

export const editor = style({
  display: "grid",
  alignContent: "center",
  padding: "1.25rem",
  background: INK[900],
  color: INK[100],
  fontFamily: vars.font.mono,
  fontSize: "0.75rem",
  lineHeight: 1.8,
  whiteSpace: "pre-wrap",
});

export const activeLine = style({
  marginInline: "-1.25rem",
  paddingInline: "1.125rem",
  borderLeft: `2px solid ${BRAND[400]}`,
  background: `color-mix(in srgb, ${BRAND[400]} 14%, transparent)`,
});

export const tree = style({
  display: "grid",
  alignContent: "center",
  gap: "0.5rem",
  padding: "1.5rem 2rem",
  fontSize: "0.875rem",
});

export const treeItem = style({
  paddingLeft: "1.25rem",
  color: vars.color.textMuted,
});

export const controls = style({
  display: "grid",
  alignContent: "center",
  gap: "0.75rem",
  padding: "1.5rem 2rem",
});

export const controlRow = style({
  display: "grid",
  gridTemplateColumns: "6rem minmax(0, 1fr)",
  alignItems: "center",
  color: vars.color.textMuted,
  fontFamily: vars.font.mono,
  fontSize: "0.8125rem",
});

export const controlValue = style({
  padding: "0.375rem 0.625rem",
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surfaceRaised,
  color: vars.color.text,
});

export const toggle = style({
  position: "relative",
  width: "28px",
  height: "16px",
  border: `1px solid ${vars.color.border}`,
  borderRadius: "999px",
  background: vars.color.surfaceRaised,
  selectors: {
    "&::after": {
      content: "",
      position: "absolute",
      top: "3px",
      left: "3px",
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      background: vars.color.textMuted,
    },
  },
});

// 장면이 보이는 순간 한 번 재생, 숨은 장면은 처음 상태로 돌아가 다음에 다시 재생
const appear = keyframes({ from: { opacity: 0, transform: "translateY(4px)" }, to: { opacity: 1, transform: "none" } });

export const reveal = style({
  opacity: 0,
  selectors: {
    [`${sceneActive} &`]: { animation: `${appear} 260ms ease forwards` },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": { opacity: 1, animation: "none" },
  },
});

export const primaryButton = style([dangerButton, { background: BRAND[600] }]);

export const neutralButton = style([
  dangerButton,
  { border: `1px solid ${vars.color.border}`, background: vars.color.surfaceRaised, color: vars.color.text },
]);

export const matrix = style({
  display: "grid",
  gridTemplateColumns: "repeat(3, auto)",
  justifyContent: "center",
  alignContent: "center",
  gap: "0.75rem 1.75rem",
});

export const cell = style({
  display: "grid",
  justifyItems: "start",
  gap: "0.25rem",
  color: vars.color.textMuted,
  fontFamily: vars.font.mono,
  fontSize: "0.6875rem",
});

export const split = style({
  display: "grid",
  gridTemplateRows: "minmax(0, 1fr) auto",
});

export const toast = style({
  display: "inline-flex",
  gap: "0.875rem",
  padding: "0.5rem 0.875rem",
  background: INK[900],
  color: INK[50],
  fontSize: "0.8125rem",
});

export const toastAction = style({ color: BRAND[300], fontWeight: 650 });

export const log = style({
  display: "grid",
  gap: "0.25rem",
  padding: "0.75rem 1rem",
  borderTop: `1px solid ${vars.color.border}`,
  fontFamily: vars.font.mono,
  fontSize: "0.75rem",
  color: vars.color.textMuted,
});

export const logName = style({ color: vars.color.accent, fontWeight: 650 });

export const select = style({
  padding: "0.125rem 0.5rem",
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surfaceRaised,
  color: vars.color.text,
});

export const darkCanvas = style([canvas, { background: INK[950] }]);

export const card = style({
  display: "grid",
  gap: "0.625rem",
  padding: "1rem 1.25rem",
  border: `1px solid ${INK[700]}`,
  background: INK[800],
  color: INK[50],
  fontSize: "0.8125rem",
});

export const compare = style({
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
});

export const version = style({
  display: "grid",
  alignContent: "center",
  justifyItems: "center",
  gap: "0.75rem",
  color: vars.color.textMuted,
  fontSize: "0.75rem",
  selectors: { "& + &": { borderLeft: `1px dashed ${vars.color.border}` } },
});

export const withToolbar = style({
  display: "grid",
  gridTemplateRows: "auto minmax(0, 1fr)",
});

export const stage = style({
  display: "grid",
  placeItems: "center",
  backgroundImage: `radial-gradient(${vars.color.border} 1px, transparent 1px)`,
  backgroundSize: "14px 14px",
});

// 화면 너비가 375px로 줄어드는 모습을 보여 주는 frame
const narrow = keyframes({ "0%, 30%": { width: "88%" }, "55%, 100%": { width: "34%" } });

export const viewportFrame = style({
  display: "grid",
  gap: "0.5rem",
  padding: "0.75rem",
  border: `1px dashed ${BRAND[300]}`,
  background: vars.color.surfaceRaised,
  width: "34%",
  selectors: {
    [`${sceneActive} &`]: { animation: `${narrow} 1600ms ease forwards` },
  },
  "@media": { "(prefers-reduced-motion: reduce)": { animation: "none" } },
});

export const widthLabel = style({
  justifySelf: "end",
  color: vars.color.textMuted,
  fontFamily: vars.font.mono,
  fontSize: "0.6875rem",
});

export const bar = style({ height: "8px", background: vars.color.border });

export const address = style({
  margin: "1rem",
  padding: "0.5rem 0.75rem",
  border: `1px solid ${vars.color.border}`,
  borderRadius: "999px",
  background: vars.color.surfaceRaised,
  color: vars.color.textMuted,
  fontFamily: vars.font.mono,
  fontSize: "0.75rem",
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
});

export const addressParam = style({ color: vars.color.accent });

export const copied = style({
  justifySelf: "end",
  marginRight: "1rem",
  padding: "0.375rem 0.75rem",
  background: INK[900],
  color: INK[50],
  fontSize: "0.75rem",
});

const swapOut = keyframes({ "0%, 35%": { opacity: 1 }, "45%, 100%": { opacity: 0 } });
const swapIn = keyframes({ "0%, 35%": { opacity: 0, transform: "translateY(3px)" }, "45%, 100%": { opacity: 1, transform: "none" } });

export const swap = style({ display: "inline-grid" });

const swapLayer = { gridArea: "1 / 1", textAlign: "center" } as const;

export const swapFrom = style({
  ...swapLayer,
  opacity: 0,
  selectors: { [`${sceneActive} &`]: { animation: `${swapOut} 1.6s ease both` } },
  "@media": { "(prefers-reduced-motion: reduce)": { animation: "none", opacity: 0 } },
});

export const swapTo = style({
  ...swapLayer,
  selectors: { [`${sceneActive} &`]: { animation: `${swapIn} 1.6s ease both` } },
  "@media": { "(prefers-reduced-motion: reduce)": { animation: "none" } },
});

export const swapFromLate = style([swapFrom, { selectors: { [`${sceneActive} &`]: { animationDelay: "0.35s" } } }]);

export const swapToLate = style([swapTo, { selectors: { [`${sceneActive} &`]: { animationDelay: "0.35s" } } }]);
