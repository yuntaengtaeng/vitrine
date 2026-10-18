import { style } from "@vanilla-extract/css";
import { vars } from "../../shared/theme/theme.css";
import { FIELD_HEIGHT, field, fieldBorder } from "../../shared/ui/field.css";

export const textInput = style([field, { padding: `0 0.65rem` }]);

export const select = field;

export const switchButton = style({
  display: "inline-flex",
  alignItems: "center",
  justifySelf: "start",
  gap: "0.55rem",
  padding: 0,
  border: 0,
  background: "transparent",
  color: vars.color.text,
  fontFamily: "inherit",
  fontSize: vars.fontSize.secondary,
  cursor: "pointer",
});

export const switchTrack = style({
  position: "relative",
  width: 34,
  height: 20,
  borderRadius: vars.radius.full,
  background: vars.color.switchOff,
  transition: "background 120ms ease",
  selectors: { [`${switchButton}[aria-checked="true"] &`]: { background: vars.color.accent } },
});

export const switchThumb = style({
  position: "absolute",
  top: 3,
  left: 3,
  width: 14,
  height: 14,
  borderRadius: "50%",
  background: vars.color.surface,
  boxShadow: "0 1px 2px rgba(0,0,0,0.22)",
  transition: "left 120ms ease",
  selectors: { [`${switchButton}[aria-checked="true"] &`]: { left: 17 } },
});

export const number = style({
  display: "grid",
  gridTemplateColumns: `${FIELD_HEIGHT} minmax(60px, 1fr) ${FIELD_HEIGHT}`,
  height: FIELD_HEIGHT,
  overflow: "hidden",
  border: fieldBorder,
  borderRadius: vars.radius.md,
  background: vars.color.surface,
});

export const numberStep = style({
  border: 0,
  background: vars.color.surfaceSubtle,
  color: vars.color.text,
  fontSize: vars.fontSize.title,
  cursor: "pointer",
  ":hover": { background: vars.color.hover },
});

export const numberInput = style({
  minWidth: 0,
  padding: "0 0.4rem",
  border: 0,
  borderLeft: fieldBorder,
  borderRight: fieldBorder,
  outlineColor: vars.color.accent,
  background: vars.color.surface,
  textAlign: "center",
  color: vars.color.text,
  fontFamily: "inherit",
  fontSize: vars.fontSize.secondary,
});

export const radios = style({ display: "flex", flexWrap: "wrap", gap: vars.space.xs });

export const radio = style({
  minHeight: 30,
  padding: `0.25rem ${vars.space.sm}`,
  border: fieldBorder,
  borderRadius: vars.radius.md,
  background: vars.color.surface,
  color: vars.color.text,
  fontFamily: "inherit",
  fontSize: vars.fontSize.secondary,
  cursor: "pointer",
  selectors: {
    "&:hover": { background: vars.color.hover },
    '&[aria-checked="true"]': {
      borderColor: vars.color.accent,
      background: vars.color.accentSoft,
      color: vars.color.accent,
    },
  },
});
