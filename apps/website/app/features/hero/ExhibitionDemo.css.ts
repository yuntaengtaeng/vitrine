import { style, styleVariants } from "@vanilla-extract/css";
import { BRAND, INK, NEUTRAL, RED } from "@vitrine/brand";
import { vars } from "../../styles/theme.css";

export const frame = style({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
  overflow: "hidden",
  border: `1px solid ${INK[700]}`,
  borderRadius: vars.radius.large,
  background: INK[900],
  "@media": {
    "(max-width: 860px)": { gridTemplateColumns: "minmax(0, 1fr)" },
  },
});

export const tabBar = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  height: "42px",
  paddingInline: "1rem",
  borderBottom: `1px solid ${INK[700]}`,
  color: INK[50],
  fontFamily: vars.font.mono,
  fontSize: "0.8125rem",
});

export const iconButton = style({
  display: "grid",
  placeItems: "center",
  width: "26px",
  height: "26px",
  padding: 0,
  border: `1px solid ${INK[700]}`,
  borderRadius: "999px",
  background: "transparent",
  color: INK[300],
  cursor: "pointer",
  selectors: { "&:hover": { color: INK[50], borderColor: INK[500] } },
});

// 가로 스크롤 영역을 만들지 않도록 좁은 화면에서는 코드 줄을 감쌈
export const code = style({
  margin: 0,
  padding: "0.75rem 0 1rem",
  color: INK[100],
  fontFamily: vars.font.mono,
  fontSize: "clamp(0.75rem, 1.5vw, 0.875rem)",
  lineHeight: 1.75,
});

export const block = style({
  position: "relative",
  display: "block",
  width: "100%",
  padding: "0.5rem 1.25rem",
  border: 0,
  background: "transparent",
  color: "inherit",
  font: "inherit",
  textAlign: "left",
  cursor: "pointer",
});

export const highlight = style({
  position: "absolute",
  inset: 0,
  borderLeft: `2px solid ${BRAND[400]}`,
  background: `color-mix(in srgb, ${BRAND[400]} 14%, transparent)`,
});

export const line = style({
  position: "relative",
  display: "block",
  whiteSpace: "pre-wrap",
  overflowWrap: "anywhere",
});

export const importLine = style([line, { padding: "0.5rem 1.25rem" }]);

export const comment = style({ color: BRAND[300] });
export const keyword = style({ color: "#c4a7ff" });
export const tag = style({ color: "#7fd8ff" });
export const string = style({ color: "#9ee6a8" });

export const caret = style({
  display: "inline-block",
  width: "2px",
  height: "1.1em",
  marginLeft: "2px",
  verticalAlign: "text-bottom",
  background: INK[50],
});

export const room = style({
  position: "relative",
  display: "grid",
  gridTemplateRows: "1fr auto",
  minHeight: "440px",
  overflow: "hidden",
  background: INK[950],
  borderLeft: `1px solid ${INK[700]}`,
  "@media": {
    "(max-width: 860px)": { borderLeft: 0, borderTop: `1px solid ${INK[700]}` },
  },
});

export const stage = style({
  position: "relative",
  display: "grid",
  alignContent: "center",
  justifyItems: "center",
  padding: "2.5rem 1.5rem 1.5rem",
});

export const spotlight = style({
  position: "absolute",
  top: 0,
  left: "50%",
  width: "300px",
  height: "100%",
  transform: "translateX(-50%)",
  background: `color-mix(in srgb, ${BRAND[200]} 7%, transparent)`,
  clipPath: "polygon(38% 0, 62% 0, 100% 100%, 0 100%)",
  pointerEvents: "none",
});

export const glass = style({
  position: "relative",
  display: "grid",
  placeItems: "center",
  width: "min(100%, 280px)",
  height: "160px",
  overflow: "hidden",
  border: `1px solid color-mix(in srgb, ${NEUTRAL[0]} 20%, transparent)`,
  borderRadius: "12px 12px 3px 3px",
  background: `color-mix(in srgb, ${NEUTRAL[0]} 4%, transparent)`,
});

export const reflection = style({
  position: "absolute",
  top: "-20%",
  bottom: "-20%",
  width: "22%",
  background: `color-mix(in srgb, ${NEUTRAL[0]} 9%, transparent)`,
  transform: "skewX(-18deg)",
  pointerEvents: "none",
});

export const plinth = style({
  width: "min(108%, 300px)",
  height: "12px",
  borderRadius: "2px",
  background: INK[700],
});

const exhibitBase = style({
  padding: "0.7rem 1.25rem",
  borderRadius: "8px",
  fontFamily: "system-ui, sans-serif",
  fontSize: "0.9375rem",
  fontWeight: 600,
  whiteSpace: "nowrap",
});

export const exhibit = styleVariants({
  primary: [exhibitBase, { background: BRAND[600], color: NEUTRAL[0] }],
  danger: [exhibitBase, { background: RED[600], color: NEUTRAL[0] }],
  ghost: [exhibitBase, { border: `1.5px solid ${INK[300]}`, color: INK[50] }],
});

export const panel = style({
  display: "grid",
  gap: "0.625rem",
  padding: "1rem 1.25rem 1.25rem",
  borderTop: `1px solid ${INK[700]}`,
  background: INK[900],
  fontSize: "0.8125rem",
});

export const panelHeader = style({
  display: "flex",
  alignItems: "baseline",
  gap: "0.625rem",
  paddingBottom: "0.25rem",
  color: INK[50],
});

export const panelNumber = style({
  color: BRAND[300],
  fontFamily: vars.font.mono,
  fontSize: "0.75rem",
});

export const panelName = style({
  fontSize: "0.9375rem",
  fontWeight: 650,
});

export const panelGroup = style({
  color: INK[300],
});

export const propRow = style({
  display: "grid",
  gridTemplateColumns: "72px minmax(0, 1fr)",
  alignItems: "center",
  gap: "0.75rem",
  color: INK[300],
  fontFamily: vars.font.mono,
});

export const toneOptions = style({
  display: "flex",
  flexWrap: "wrap",
  gap: "0.375rem",
});

export const toneOption = style({
  padding: "0.125rem 0.5rem",
  border: `1px solid ${INK[700]}`,
  borderRadius: "999px",
  color: INK[300],
});

export const toneOptionActive = style({
  borderColor: BRAND[400],
  background: `color-mix(in srgb, ${BRAND[400]} 18%, transparent)`,
  color: INK[50],
});

export const propValue = style({
  color: INK[50],
});

export const toggle = style({
  position: "relative",
  width: "28px",
  height: "16px",
  borderRadius: "999px",
  background: INK[700],
  selectors: {
    "&::after": {
      content: "",
      position: "absolute",
      top: "3px",
      left: "3px",
      width: "10px",
      height: "10px",
      borderRadius: "50%",
      background: INK[300],
    },
  },
});
