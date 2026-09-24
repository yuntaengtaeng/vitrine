import type { CSSProperties } from "react";
import { COLOR } from "../../tokens/color";
import { FONT_SIZE } from "../../tokens/fontSize";
import { FIELD_BORDER, FIELD_BORDER_RADIUS, FIELD_FOCUS, FIELD_HEIGHT } from "./fieldStyle";

type Option = string | number;

const Styled = {
  width: "100%",
  height: FIELD_HEIGHT,
  padding: "0 0.6rem",
  border: FIELD_BORDER,
  borderRadius: FIELD_BORDER_RADIUS,
  ...FIELD_FOCUS,
  background: COLOR.surface,
  color: COLOR.body,
  fontFamily: "inherit",
  fontSize: FONT_SIZE.secondary,
} satisfies CSSProperties;

export const SelectControl = (props: {
  value: unknown;
  options: Option[];
  optional: boolean;
  onChange: (value: Option | undefined) => void;
}) => (
  <select
    style={Styled}
    value={String(props.value ?? "")}
    onChange={(event) => {
      if (event.currentTarget.value === "" && props.optional) return props.onChange(undefined);
      props.onChange(props.options.find((option) => String(option) === event.currentTarget.value));
    }}
  >
    {props.optional && <option value="">Unset</option>}
    {props.options.map((option) => <option key={String(option)} value={String(option)}>{String(option)}</option>)}
  </select>
);
