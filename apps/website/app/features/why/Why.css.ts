import { globalStyle, keyframes, style } from "@vanilla-extract/css";
import { BRAND, INK, RED } from "@vitrine/brand";
import { vars } from "../../styles/theme.css";

const PLAY_MS = 7000;
const PLAY = `${PLAY_MS}ms`;
const LINE = 28;
const DIGIT = 56;

export const toggle = style({
  display: "inline-flex",
  gap: "0.375rem",
  marginTop: "2rem",
  padding: "0.3125rem",
  borderRadius: "999px",
  background: vars.color.surface,
});

export const toggleButton = style({
  minHeight: "40px",
  paddingInline: "1.125rem",
  border: "none",
  borderRadius: "999px",
  background: "transparent",
  color: vars.color.textMuted,
  font: "inherit",
  fontSize: "0.9375rem",
  fontWeight: 600,
  cursor: "pointer",
  selectors: {
    '&[aria-pressed="true"]': { background: vars.color.text, color: vars.color.background },
  },
});

export const stage = style({
  display: "grid",
  marginTop: "1.75rem",
});

export const scene = style({
  gridArea: "1 / 1",
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.5fr) minmax(0, 1fr)",
  alignItems: "center",
  gap: "clamp(1.5rem, 4vw, 3rem)",
  transition: "opacity 300ms ease, visibility 300ms",
  selectors: {
    '&[data-active="false"]': { opacity: 0, visibility: "hidden", pointerEvents: "none" },
  },
  "@media": {
    "(max-width: 1024px)": { gridTemplateColumns: "minmax(0, 1fr)" },
    "(prefers-reduced-motion: reduce)": { transition: "none" },
  },
});

export const browser = style({
  alignSelf: "stretch",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.large,
  background: vars.color.surfaceRaised,
});

export const browserBar = style({
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  padding: "0.625rem 0.875rem",
  borderBottom: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
});

export const dots = style({ display: "flex", gap: "6px" });

globalStyle(`${dots} > span`, {
  width: "10px",
  height: "10px",
  borderRadius: "50%",
  background: vars.color.border,
});

export const address = style({
  flex: 1,
  minWidth: 0,
  height: `${LINE}px`,
  overflow: "hidden",
  border: `1px solid ${vars.color.border}`,
  borderRadius: "8px",
  background: vars.color.surfaceRaised,
  fontFamily: vars.font.mono,
  fontSize: "0.8125rem",
  color: vars.color.textMuted,
});

const step = (size: number) =>
  keyframes({
    "0%, 14%": { transform: "translateY(0)" },
    "18%, 30%": { transform: `translateY(-${size}px)` },
    "34%, 46%": { transform: `translateY(-${size * 2}px)` },
    "50%, 62%": { transform: `translateY(-${size * 3}px)` },
    "66%, 100%": { transform: `translateY(-${size * 4}px)` },
  });

/** 숫자와 주소가 다음 칸으로 넘어가는 간격 (ms), step의 각 이동 구간 중간 지점 */
export const PAGE_STEP_MS = PLAY_MS * 0.16;

const addressSteps = step(LINE);
const digitSteps = step(DIGIT);

export const addressTrack = style({
  display: "flex",
  flexDirection: "column",
  transform: `translateY(-${LINE * 4}px)`,
  selectors: {
    '&[data-state="playing"]': { animation: `${addressSteps} ${PLAY} cubic-bezier(.6,0,.2,1) both` },
  },
});

export const addressLine = style({
  height: `${LINE}px`,
  lineHeight: `${LINE}px`,
  paddingInline: "0.625rem",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

export const page = style({
  position: "relative",
  flex: 1,
  minHeight: "240px",
  display: "grid",
  placeItems: "end center",
  padding: "1.5rem",
});

const load = keyframes({
  from: { opacity: 0, transform: "translateY(6px)" },
  to: { opacity: 1, transform: "none" },
});

export const skeleton = style({
  position: "absolute",
  inset: "1.5rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
  selectors: {
    '&[data-state="playing"]': { animation: `${load} 320ms ease-out both` },
  },
});

export const bone = style({
  display: "block",
  maxWidth: "100%",
  borderRadius: "6px",
  // 브라우저 페이지 배경에 섞어야 다크 모드에서도 배경과 구분됨
  background: `color-mix(in srgb, ${vars.color.accent} 14%, ${vars.color.surfaceRaised})`,
  selectors: {
    '&[data-shape="round"]': { borderRadius: "50%" },
    '&[data-shape="card"]': { borderRadius: vars.radius.medium },
    '&[data-tone="accent"]': { background: `color-mix(in srgb, ${vars.color.accent} 28%, ${vars.color.surfaceRaised})` },
  },
});

export const skeletonRow = style({ display: "flex", alignItems: "center", gap: "0.75rem" });

export const skeletonStack = style({
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
  minWidth: 0,
  selectors: { [`${skeletonRow} > &`]: { flex: 1 } },
});

export const loginForm = style([skeletonStack, { alignSelf: "center", alignItems: "center", width: "min(52%, 220px)" }]);

export const productGrid = style({ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "0.75rem" });

export const checkoutColumns = style({ display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)", gap: "1.25rem" });

// 주소가 넘어가기 직전에 눌러야 클릭 때문에 다음 페이지가 열리는 것으로 읽힘
const pulse = keyframes({
  "0%, 62%": { opacity: 0, transform: "scale(.4)" },
  "70%": { opacity: 0.9, transform: "scale(1)" },
  "86%, 100%": { opacity: 0, transform: "scale(1.6)" },
});

export const click = style({
  position: "absolute",
  left: "60%",
  top: "38%",
  width: "34px",
  height: "34px",
  borderRadius: "50%",
  border: `2px solid ${vars.color.accent}`,
  opacity: 0,
  animation: `${pulse} ${PAGE_STEP_MS}ms ease-out 4`,
});

const toastLife = keyframes({
  "0%, 64%": { opacity: 0, transform: "translateY(10px)" },
  "68%, 86%": { opacity: 1, transform: "none" },
  "94%, 100%": { opacity: 0, transform: "translateY(4px)" },
});

const toastBase = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.625rem",
  maxWidth: "100%",
  padding: "0.75rem 1rem",
  borderRadius: vars.radius.medium,
  background: INK[900],
  color: INK[50],
  fontSize: "0.875rem",
  lineHeight: 1.45,
  boxShadow: "0 16px 32px -18px rgba(8, 11, 28, 0.6)",
} as const;

export const todayToast = style({
  ...toastBase,
  position: "relative",
  selectors: {
    '&[data-state="playing"]': { animation: `${toastLife} ${PLAY} ease both` },
  },
});

export const toastDot = style({
  flex: "none",
  width: "8px",
  height: "8px",
  borderRadius: "50%",
  background: BRAND[300],
  selectors: {
    '&[data-tone="error"]': { background: RED[400] },
    '&[data-tone="warning"]': { background: "#fbbf24" },
    '&[data-tone="success"]': { background: "#4ade80" },
  },
});

export const copy = style({
  display: "flex",
  flexDirection: "column",
  gap: "0.875rem",
});

export const count = style({
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  margin: 0,
});

export const counter = style({
  display: "inline-block",
  height: `${DIGIT}px`,
  overflow: "hidden",
  fontSize: "3rem",
  fontWeight: 650,
  letterSpacing: "-0.04em",
  lineHeight: `${DIGIT}px`,
  alignSelf: "center",
});

export const counterTrack = style({
  display: "flex",
  flexDirection: "column",
  transform: `translateY(-${DIGIT * 4}px)`,
  selectors: {
    '&[data-state="playing"]': { animation: `${digitSteps} ${PLAY} cubic-bezier(.6,0,.2,1) both` },
  },
});

export const zero = style([counter, { color: vars.color.accent }]);

export const countText = style({
  marginLeft: "0.5rem",
  color: vars.color.textMuted,
  fontSize: "1.0625rem",
  selectors: { ":lang(ko) &": { marginLeft: "0.125rem" } },
});

const appear = keyframes({ from: { opacity: 0 }, to: { opacity: 1 } });

export const gone = style({
  margin: 0,
  fontWeight: 600,
  selectors: {
    '&[data-state="playing"]': { animation: `${appear} 0.4s ease 6.6s both` },
  },
});

export const text = style({
  margin: 0,
  color: vars.color.textMuted,
  lineHeight: 1.65,
});

// 코드가 잘리면 장면의 요점이 사라지므로 코드 폭을 먼저 보장
export const split = style({
  alignSelf: "stretch",
  display: "grid",
  gridTemplateColumns: "auto minmax(0, 1fr)",
  overflow: "hidden",
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.large,
  "@media": { "(max-width: 560px)": { gridTemplateColumns: "minmax(0, 1fr)" } },
});

export const code = style({
  margin: 0,
  padding: "1.25rem",
  background: vars.color.surface,
  fontFamily: vars.font.mono,
  fontSize: "0.75rem",
  lineHeight: 1.7,
  whiteSpace: "pre",
  overflowX: "auto",
});

export const gallery = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: "0.625rem",
  padding: "1.25rem",
  backgroundImage: `radial-gradient(${vars.color.border} 1px, transparent 1px)`,
  backgroundSize: "14px 14px",
  backgroundColor: vars.color.surfaceRaised,
});

const pop = keyframes({
  from: { opacity: 0, transform: "translateY(8px) scale(.97)" },
  to: { opacity: 1, transform: "none" },
});

export const galleryToast = style({
  ...toastBase,
  fontSize: "0.8125rem",
  animation: `${pop} 0.4s cubic-bezier(.2,.8,.2,1) both`,
  "@media": { "(prefers-reduced-motion: reduce)": { animation: "none" } },
});

export const visuallyHidden = style({
  position: "absolute",
  width: "1px",
  height: "1px",
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
});
