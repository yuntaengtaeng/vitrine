import type { CSSProperties } from "react";
import { COLOR } from "../../../tokens/color";
import { FONT_SIZE } from "../../../tokens/fontSize";
import { FIELD_BORDER, FIELD_BORDER_RADIUS } from "./fieldStyle";

export const SECONDARY_BUTTON = {
  flexShrink: 0,
  padding: "0.3rem 0.7rem",
  border: FIELD_BORDER,
  borderRadius: FIELD_BORDER_RADIUS,
  background: COLOR.surface,
  color: COLOR.body,
  fontFamily: "inherit",
  fontSize: FONT_SIZE.label,
  cursor: "pointer",
} satisfies CSSProperties;
