import { style } from "@vanilla-extract/css";
import { vars } from "../../shared/theme/theme.css";

export const root = style({
  width: "100%",
  maxWidth: 720,
  padding: `${vars.space.lg} 1.25rem`,
  border: `1px solid ${vars.color.errorBorder}`,
  borderRadius: vars.radius.lg,
  background: vars.color.errorSoft,
});

export const header = style({ display: "flex", alignItems: "flex-start", gap: vars.space.lg });

export const titles = style({ display: "grid", gap: 6, minWidth: 0, flex: 1 });

export const title = style({ margin: 0, color: vars.color.error, fontSize: vars.fontSize.label, fontWeight: 650 });

export const message = style({
  margin: 0,
  color: vars.color.text,
  fontFamily: vars.font.mono,
  fontSize: vars.fontSize.base,
  whiteSpace: "pre-wrap",
  overflowWrap: "anywhere",
});

export const details = style({ marginTop: "0.85rem" });

export const summary = style({ color: vars.color.textMuted, fontSize: vars.fontSize.label, cursor: "pointer" });

export const stack = style({
  margin: "0.5rem 0 0",
  maxHeight: 260,
  overflow: "auto",
  color: vars.color.textMuted,
  fontFamily: vars.font.mono,
  fontSize: vars.fontSize.label,
  whiteSpace: "pre",
});

export const libraryFrame = style({ opacity: 0.6 });
