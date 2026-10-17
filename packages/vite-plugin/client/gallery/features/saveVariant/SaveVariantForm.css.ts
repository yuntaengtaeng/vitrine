import { style } from "@vanilla-extract/css";
import { vars } from "../../shared/theme/theme.css";
import { secondaryButton } from "../../shared/ui/button.css";
import { field } from "../../shared/ui/field.css";

export const form = style({ display: "inline-flex", alignItems: "center", gap: vars.space.sm });

export const input = style([field, { width: 160, height: 26, fontSize: vars.fontSize.label }]);

export const button = style([secondaryButton, { padding: "0.2rem 0.6rem" }]);

export const status = style({ maxWidth: 320, color: vars.color.textMuted, fontSize: vars.fontSize.label });
