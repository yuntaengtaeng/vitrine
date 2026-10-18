import { style } from "@vanilla-extract/css";
import { vars } from "../../shared/theme/theme.css";
import { secondaryButton } from "../../shared/ui/button.css";
import { field } from "../../shared/ui/field.css";

export const root = style({ position: "relative", display: "inline-flex", alignItems: "center", gap: vars.space.sm });

export const button = style([secondaryButton, { padding: "0.2rem 0.6rem" }]);

export const saved = style({ color: vars.color.textMuted, fontSize: vars.fontSize.label, whiteSpace: "nowrap" });

// 패널이 화면 아래에 붙어 있어 무대 쪽인 위로 열고, 좁은 패널에서도 화면 밖으로 나가지 않게 폭을 제한
export const popover = style({
  position: "absolute",
  right: 0,
  bottom: "calc(100% + 6px)",
  zIndex: 3,
  display: "grid",
  gap: vars.space.sm,
  width: 280,
  maxWidth: "calc(100vw - 32px)",
  padding: vars.space.md,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.lg,
  background: vars.color.surface,
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.16)",
});

export const label = style({ display: "grid", gap: vars.space.xs, color: vars.color.textMuted, fontSize: vars.fontSize.label });

export const input = style([field, { fontSize: vars.fontSize.secondary }]);

export const error = style({ margin: 0, color: vars.color.error, fontSize: vars.fontSize.label, lineHeight: 1.5 });

export const actions = style({ display: "flex", justifyContent: "flex-end", gap: vars.space.sm });
