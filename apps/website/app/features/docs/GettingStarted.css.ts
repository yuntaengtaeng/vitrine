import { style } from "@vanilla-extract/css";
import { vars } from "../../styles/theme.css";

export const intro = style({
  paddingBlock: "clamp(4rem, 9vw, 7rem)",
  borderBottom: `1px solid ${vars.color.border}`,
});

export const label = style({
  margin: "0 0 1rem",
  color: vars.color.accent,
  fontSize: "0.9375rem",
  fontWeight: 650,
});

export const title = style({
  margin: 0,
  maxWidth: "13ch",
  fontSize: "clamp(2.75rem, 7vw, 5.75rem)",
  lineHeight: 0.98,
  letterSpacing: "-0.055em",
});

export const lead = style({
  margin: "2rem 0 0",
  maxWidth: "58ch",
  color: vars.color.textMuted,
  fontSize: "clamp(1.125rem, 2vw, 1.375rem)",
});

export const guide = style({
  paddingBlock: "clamp(3rem, 8vw, 6rem)",
});

export const contents = style({
  display: "flex",
  flexWrap: "wrap",
  gap: "0.75rem 1.5rem",
  marginBottom: "3rem",
  paddingBottom: "1.5rem",
  borderBottom: `1px solid ${vars.color.border}`,
  color: vars.color.textMuted,
  fontSize: "0.9375rem",
});

export const contentsLabel = style({ color: vars.color.text, fontWeight: 650 });
export const contentsLink = style({ color: vars.color.accent, textUnderlineOffset: "0.2em" });

export const steps = style({
  margin: 0,
  padding: 0,
  listStyle: "none",
});

export const step = style({
  display: "grid",
  gridTemplateColumns: "5rem minmax(0, 1fr)",
  gap: "clamp(1rem, 4vw, 3rem)",
  paddingBlock: "clamp(2.5rem, 6vw, 4.5rem)",
  borderTop: `1px solid ${vars.color.border}`,
  "@media": {
    "(max-width: 600px)": {
      gridTemplateColumns: "1fr",
      gap: "1rem",
    },
  },
});

export const stepNumber = style({
  color: vars.color.accent,
  fontFamily: vars.font.mono,
  fontSize: "0.875rem",
});

export const stepBody = style({
  maxWidth: "760px",
});

export const stepTitle = style({
  margin: 0,
  fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
  letterSpacing: "-0.025em",
});

export const stepText = style({
  margin: "0.75rem 0 1.75rem",
  maxWidth: "62ch",
  color: vars.color.textMuted,
});

export const address = style({
  display: "grid",
  gap: "0.5rem",
  color: vars.color.textMuted,
});

export const addressCode = style({
  color: vars.color.accent,
  overflowWrap: "anywhere",
});

export const docSection = style({
  display: "grid",
  gridTemplateColumns: "minmax(0, 0.7fr) minmax(0, 1.3fr)",
  gap: "clamp(2rem, 7vw, 6rem)",
  paddingBlock: "clamp(4rem, 9vw, 7rem)",
  borderTop: `1px solid ${vars.color.border}`,
  scrollMarginTop: "88px",
  "@media": {
    "(max-width: 760px)": { gridTemplateColumns: "minmax(0, 1fr)" },
  },
});

export const sectionLabel = style({
  margin: "0 0 0.75rem",
  color: vars.color.accent,
  fontFamily: vars.font.mono,
  fontSize: "0.875rem",
});

export const docTitle = style({
  margin: 0,
  fontSize: "clamp(2rem, 4vw, 3.25rem)",
  lineHeight: 1.05,
  letterSpacing: "-0.04em",
});

export const docLead = style({
  margin: "1.25rem 0 0",
  color: vars.color.textMuted,
});

export const docContent = style({
  display: "grid",
  minWidth: 0,
  gap: "1.75rem",
});

export const rules = style({
  display: "grid",
  gap: "0.75rem",
  margin: 0,
  paddingLeft: "1.25rem",
  color: vars.color.textMuted,
});

export const supported = style({
  margin: 0,
  color: vars.color.textMuted,
});

export const options = style({
  margin: 0,
  borderTop: `1px solid ${vars.color.border}`,
});

export const option = style({
  display: "grid",
  gridTemplateColumns: "8rem minmax(0, 1fr)",
  gap: "1rem",
  paddingBlock: "1rem",
  borderBottom: `1px solid ${vars.color.border}`,
  "@media": {
    "(max-width: 520px)": { gridTemplateColumns: "minmax(0, 1fr)", gap: "0.25rem" },
  },
});

export const optionName = style({ color: vars.color.accent });
export const optionDescription = style({ margin: 0, color: vars.color.textMuted });

export const note = style({
  margin: 0,
  paddingLeft: "1rem",
  borderLeft: `2px solid ${vars.color.accent}`,
  color: vars.color.textMuted,
});

export const next = style({
  padding: "clamp(2rem, 5vw, 3.5rem) 0",
  borderBlock: `1px solid ${vars.color.border}`,
});

export const nextTitle = style({
  margin: 0,
  fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
  letterSpacing: "-0.03em",
});

export const nextText = style({
  margin: "1rem 0 1.75rem",
  maxWidth: "64ch",
  color: vars.color.textMuted,
});

export const links = style({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "1rem 1.5rem",
});

export const primaryLink = style({
  display: "inline-flex",
  alignItems: "center",
  minHeight: "44px",
  paddingInline: "1.125rem",
  background: vars.color.accent,
  color: vars.color.onAccent,
  fontWeight: 650,
  textDecoration: "none",
});

export const textLink = style({
  color: vars.color.accent,
  fontWeight: 600,
  textUnderlineOffset: "0.2em",
});
