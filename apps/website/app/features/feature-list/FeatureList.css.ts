import { style } from "@vanilla-extract/css";
import { vars } from "../../styles/theme.css";

export const layout = style({
  display: "grid",
  gridTemplateColumns: "minmax(0, 0.8fr) minmax(0, 1.2fr)",
  gridTemplateAreas: `"heading ." "showcase catalog"`,
  columnGap: "3rem",
  rowGap: "2.5rem",
  alignItems: "start",
  "@media": {
    "(max-width: 860px)": {
      gridTemplateColumns: "minmax(0, 1fr)",
      gridTemplateAreas: `"heading" "catalog"`,
    },
  },
});

export const heading = style({
  gridArea: "heading",
});

export const showcase = style({
  gridArea: "showcase",
  position: "sticky",
  top: "88px",
  "@media": {
    "(max-width: 860px)": { display: "none" },
  },
});

export const catalog = style({
  gridArea: "catalog",
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
  selectors: {
    "&:first-child": {
      alignContent: "start",
      paddingTop: 0,
    },
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
