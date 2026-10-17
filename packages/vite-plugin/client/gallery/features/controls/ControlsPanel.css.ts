import { style } from "@vanilla-extract/css";
import { vars } from "../../shared/theme/theme.css";
import { secondaryButton } from "../../shared/ui/button.css";

export const root = style({
  width: "100%",
  maxHeight: 280,
  flexShrink: 0,
  padding: `0.85rem ${vars.space.lg} ${vars.space.lg}`,
  borderTop: `1px solid ${vars.color.border}`,
  overflowY: "auto",
  background: vars.color.surface,
});

export const header = style({ display: "flex", alignItems: "center", gap: vars.space.sm, marginBottom: "0.6rem" });

export const heading = style({ margin: 0, color: vars.color.text, fontSize: vars.fontSize.secondary, fontWeight: 650 });

export const count = style({ color: vars.color.textMuted, fontSize: vars.fontSize.label });

export const resetAll = style([secondaryButton, { marginLeft: "auto", padding: "0.2rem 0.6rem" }]);

export const fields = style({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
  gap: `0.9rem ${vars.space.xl}`,
});
