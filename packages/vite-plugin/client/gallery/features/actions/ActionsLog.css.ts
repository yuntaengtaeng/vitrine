import { style } from "@vanilla-extract/css";
import { vars } from "../../shared/theme/theme.css";
import { secondaryButton } from "../../shared/ui/button.css";

export const list = style({ margin: 0, padding: 0, listStyle: "none", fontFamily: vars.font.mono, fontSize: vars.fontSize.label });

export const row = style({
  display: "grid",
  gridTemplateColumns: "auto auto 1fr",
  gap: vars.space.md,
  padding: `${vars.space.xs} 0`,
  borderBottom: `1px solid ${vars.color.border}`,
  selectors: { "&:last-child": { borderBottom: "none" } },
});

export const time = style({ color: vars.color.textMuted, fontVariantNumeric: "tabular-nums" });

export const name = style({ color: vars.color.accent, fontWeight: 600 });

export const args = style({ minWidth: 0, color: vars.color.text, overflowWrap: "anywhere" });

export const empty = style({ margin: 0, color: vars.color.textMuted, fontSize: vars.fontSize.secondary });

export const clear = style([secondaryButton, { padding: "0.2rem 0.6rem" }]);
