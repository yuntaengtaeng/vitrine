import type { CSSProperties } from "react";
import { COLOR } from "../../tokens/color";
import { FONT_SIZE } from "../../tokens/fontSize";

const InputStyle = {
  width: "100%",
  height: 32,
  padding: "0 0.65rem",
  boxSizing: "border-box",
  border: `1px solid ${COLOR.border}`,
  borderRadius: 6,
  outlineColor: COLOR.activeText,
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
