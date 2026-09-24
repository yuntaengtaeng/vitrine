import { style } from "@vanilla-extract/css";
import { vars } from "../../styles/theme.css";

export const layout = style({
  display: "grid",
  gridTemplateColumns: "minmax(0, 0.8fr) minmax(0, 1.2fr)",
  gap: "3rem",
  alignItems: "start",
  "@media": {
    "(max-width: 860px)": { gridTemplateColumns: "minmax(0, 1fr)" },
  },
});

export const heading = style({
  position: "sticky",
  top: "88px",
  "@media": {
    "(max-width: 860px)": { position: "static" },
  },
});

export const catalog = style({
  margin: 0,
  padding: 0,
  listStyle: "none",
});

export const entry = style({
  display: "grid",
  gap: "1.25rem",
  minHeight: "min(62vh, 560px)",
  alignContent: "center",
  paddingBlock: "3rem",
  borderBottom: `1px solid ${vars.color.border}`,
  selectors: {
    "&:first-child": { paddingTop: "1rem" },
  },
  "@media": {
    "(max-width: 860px)": {
      minHeight: "auto",
      paddingBlock: "2.5rem",
    },
  },
});

export const summary = style({
  display: "grid",
  gridTemplateColumns: "minmax(0, 0.8fr) minmax(0, 1fr)",
  gap: "1.5rem",
  "@media": {
    "(max-width: 560px)": { gridTemplateColumns: "minmax(0, 1fr)", gap: "0.75rem" },
  },
});

export const text = style({
  margin: 0,
  color: vars.color.textMuted,
});
