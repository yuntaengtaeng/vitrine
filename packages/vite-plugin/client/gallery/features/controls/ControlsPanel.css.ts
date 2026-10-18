import { style } from "@vanilla-extract/css";
import { vars } from "../../shared/theme/theme.css";
import { secondaryButton } from "../../shared/ui/button.css";

export const resetAll = style([secondaryButton, { padding: "0.2rem 0.6rem" }]);

export const fields = style({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
  gap: `0.9rem ${vars.space.xl}`,
});

export const empty = style({ margin: 0, color: vars.color.textMuted, fontSize: vars.fontSize.secondary });
