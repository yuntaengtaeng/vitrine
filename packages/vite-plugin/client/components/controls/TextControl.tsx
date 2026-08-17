import type { CSSProperties } from "react";
import { COLOR } from "../../tokens/color";
import { FONT_SIZE } from "../../tokens/fontSize";
import { FIELD_BORDER, FIELD_BORDER_RADIUS, FIELD_FOCUS, FIELD_HEIGHT } from "./fieldStyle";

const InputStyle = {
  width: "100%",
  height: FIELD_HEIGHT,
  padding: "0 0.65rem",
  boxSizing: "border-box",
  border: FIELD_BORDER,
  borderRadius: FIELD_BORDER_RADIUS,
  ...FIELD_FOCUS,
  background: "white",
  color: COLOR.body,
  fontFamily: "inherit",
  fontSize: FONT_SIZE.secondary,
} satisfies CSSProperties;

export const TextControl = (props: { value: unknown; onChange: (value: string) => void }) => (
  <input
    style={InputStyle}
    type="text"
    value={String(props.value ?? "")}
    onChange={(event) => props.onChange(event.currentTarget.value)}
  />
);
