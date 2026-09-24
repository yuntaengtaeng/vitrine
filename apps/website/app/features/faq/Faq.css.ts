import { style } from "@vanilla-extract/css";
import { vars } from "../../styles/theme.css";

export const list = style({
  marginTop: "2.5rem",
  maxWidth: "780px",
  borderTop: `1px solid ${vars.color.border}`,
});

export const item = style({
  borderBottom: `1px solid ${vars.color.border}`,
});

export const question = style({
  display: "flex",
  justifyContent: "space-between",
  gap: "1rem",
  paddingBlock: "1.375rem",
  fontSize: "1.125rem",
  fontWeight: 600,
  listStyle: "none",
  cursor: "pointer",
  selectors: {
    "&::-webkit-details-marker": { display: "none" },
    "&::after": {
      content: "+",
      color: vars.color.accent,
      fontSize: "1.5rem",
      fontWeight: 300,
      lineHeight: 1,
    },
    "details[open] > &::after": { transform: "rotate(45deg)" },
  },
});

export const answer = style({
  margin: 0,
  paddingBottom: "1.5rem",
  maxWidth: "62ch",
  color: vars.color.textMuted,
});

export const answerLink = style({
  color: vars.color.accent,
  fontWeight: 600,
  textUnderlineOffset: "0.2em",
});
