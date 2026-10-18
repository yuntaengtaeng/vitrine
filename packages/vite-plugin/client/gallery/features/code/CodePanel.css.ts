import { style } from "@vanilla-extract/css";
import { vars } from "../../shared/theme/theme.css";
import { secondaryButton } from "../../shared/ui/button.css";

export const root = style({ display: "grid", gap: vars.space.sm });

export const code = style({
  margin: 0,
  padding: `${vars.space.md} ${vars.space.lg}`,
  overflowX: "auto",
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.lg,
  background: vars.color.surfaceSubtle,
  color: vars.color.text,
  fontFamily: vars.font.mono,
  fontSize: vars.fontSize.label,
  lineHeight: 1.6,
});

export const actions = style({ display: "flex", alignItems: "center", gap: vars.space.md });

export const copy = style([secondaryButton]);

export const status = style({ color: vars.color.textMuted, fontSize: vars.fontSize.label });

export const note = style({ margin: 0, color: vars.color.textMuted, fontSize: vars.fontSize.label });
