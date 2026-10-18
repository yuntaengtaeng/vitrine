import { style } from "@vanilla-extract/css";
import { vars } from "../../shared/theme/theme.css";
import { iconButton } from "../../shared/ui/button.css";

const RESET_SIZE = "22px";

export const root = style({
  display: "grid",
  gridTemplateColumns: `minmax(0, 1fr) ${RESET_SIZE}`,
  gridTemplateRows: `${RESET_SIZE} auto`,
  alignItems: "center",
  gap: `0.3rem ${vars.space.sm}`,
});

export const label = style({
  gridRow: 1,
  gridColumn: 1,
  display: "flex",
  alignItems: "baseline",
  gap: 6,
  minWidth: 0,
  whiteSpace: "nowrap",
});

export const name = style({ color: vars.color.text, fontSize: vars.fontSize.secondary, fontWeight: 500 });

export const optional = style({ color: vars.color.textMuted, fontSize: vars.fontSize.caption });

export const type = style({
  overflow: "hidden",
  color: vars.color.textMuted,
  fontFamily: vars.font.mono,
  fontSize: vars.fontSize.caption,
  textOverflow: "ellipsis",
});

export const input = style({ gridRow: 2, gridColumn: "1 / -1", minWidth: 0 });

export const reset = style([iconButton, { gridRow: 1, gridColumn: 2, width: RESET_SIZE, height: RESET_SIZE }]);
