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
