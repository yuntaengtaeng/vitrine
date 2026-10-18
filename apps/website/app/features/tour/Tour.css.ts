import { style } from "@vanilla-extract/css";
import { vars } from "../../styles/theme.css";

export const layout = style({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
  alignItems: "center",
  gap: "clamp(2.5rem, 6vw, 5rem)",
  "@media": { "(max-width: 900px)": { gridTemplateColumns: "minmax(0, 1fr)" } },
});

export const command = style({
  marginTop: "2rem",
});

export const links = style({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "1.5rem",
  marginTop: "1.5rem",
});

export const demo = style({
  display: "inline-flex",
  alignItems: "center",
  height: "48px",
  paddingInline: "1.375rem",
  borderRadius: "999px",
  background: vars.color.roomText,
  color: vars.color.room,
  fontWeight: 600,
  textDecoration: "none",
  selectors: { "&:hover": { opacity: 0.88 } },
});

export const guide = style({
  color: vars.color.roomMuted,
  selectors: { "&:hover": { color: vars.color.roomText } },
});

// 스포트라이트를 받는 작품처럼 살짝 기울여 걸고, 누르면 라이브 데모로 이동
export const preview = style({
  display: "grid",
  gap: "1rem",
  color: vars.color.roomMuted,
  textDecoration: "none",
});

export const image = style({
  display: "block",
  width: "100%",
  height: "auto",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  boxShadow: "0 40px 80px -30px rgba(0, 0, 0, 0.7), 0 0 0 10px rgba(255, 255, 255, 0.04)",
  transform: "perspective(1400px) rotateY(-6deg)",
  transition: "transform 300ms ease",
  selectors: { [`${preview}:hover &`]: { transform: "perspective(1400px) rotateY(0deg)" } },
  "@media": { "(prefers-reduced-motion: reduce)": { transform: "none", transition: "none" } },
});

export const note = style({
  fontFamily: vars.font.mono,
  fontSize: "0.8125rem",
  fontStyle: "italic",
});
