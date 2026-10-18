import { globalStyle } from "@vanilla-extract/css";
import { vars } from "./theme.css";

globalStyle("*, *::before, *::after", {
  boxSizing: "border-box",
});

globalStyle("html", {
  scrollBehavior: "smooth",
  "@media": {
    "(prefers-reduced-motion: reduce)": { scrollBehavior: "auto" },
  },
});

globalStyle("body", {
  margin: 0,
  background: vars.color.background,
  color: vars.color.text,
  fontFamily: vars.font.body,
  fontSize: "1.0625rem",
  lineHeight: 1.6,
  WebkitFontSmoothing: "antialiased",
});

// 한국어는 기본 줄바꿈이 음절 단위라 제목과 말풍선이 단어 중간에서 끊김
globalStyle("html:lang(ko) body", {
  wordBreak: "keep-all",
});

globalStyle("a", {
  color: "inherit",
});

globalStyle("code, pre", {
  fontFamily: vars.font.mono,
});

globalStyle(":focus-visible", {
  outline: `2px solid ${vars.color.accent}`,
  outlineOffset: "3px",
});
