import { style } from "@vanilla-extract/css";
import { vars } from "../../shared/theme/theme.css";

export const root = style({
  maxWidth: 560,
  margin: "0 auto",
  padding: `4rem ${vars.space.xxl}`,
  color: vars.color.text,
  fontSize: vars.fontSize.base,
  lineHeight: 1.6,
});

export const heading = style({ margin: `0 0 ${vars.space.sm}`, fontSize: "1.1rem", fontWeight: 650 });

export const text = style({ margin: `1.25rem 0 ${vars.space.sm}`, color: vars.color.textMuted });

export const patterns = style({ margin: 0, paddingLeft: "1.25rem" });

export const code = style({
  margin: 0,
  padding: `${vars.space.md} ${vars.space.lg}`,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.lg,
  background: vars.color.surfaceSubtle,
  fontFamily: vars.font.mono,
  fontSize: vars.fontSize.label,
  whiteSpace: "pre-wrap",
  overflowWrap: "anywhere",
});

export const inline = style({ fontFamily: vars.font.mono, fontSize: vars.fontSize.label });
