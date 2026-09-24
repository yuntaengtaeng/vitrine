import { style } from "@vanilla-extract/css";
import { vars } from "../../styles/theme.css";

export const shell = style({
  display: "grid",
  gridTemplateColumns: "14rem minmax(0, 1fr)",
  gap: "clamp(2.5rem, 7vw, 7rem)",
  paddingBlock: "clamp(2.5rem, 6vw, 5rem)",
  "@media": {
    "(max-width: 800px)": { gridTemplateColumns: "minmax(0, 1fr)", gap: "2rem" },
  },
});

export const sidebar = style({
  position: "sticky",
  top: "5.5rem",
  alignSelf: "start",
  paddingRight: "2rem",
  borderRight: `1px solid ${vars.color.border}`,
  "@media": { "(max-width: 800px)": { display: "none" } },
});

export const sidebarTitle = style({
  margin: "0 0 1rem",
  fontSize: "0.875rem",
  fontWeight: 650,
});

export const navigation = style({ display: "grid", gap: "0.25rem" });

export const navigationLink = style({
  paddingBlock: "0.625rem",
  color: vars.color.textMuted,
  textDecoration: "none",
  selectors: {
    "&:hover": { color: vars.color.text },
    '&[aria-current="page"]': { color: vars.color.accent, fontWeight: 650 },
  },
});

export const mobileNavigation = style({
  display: "none",
  paddingBlock: "0.75rem",
  borderBlock: `1px solid ${vars.color.border}`,
  "@media": { "(max-width: 800px)": { display: "block" } },
});

export const mobileSummary = style({ cursor: "pointer", fontWeight: 650 });
