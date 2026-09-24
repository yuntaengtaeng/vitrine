import type { CSSProperties } from "react";
import { COLOR } from "../../tokens/color";
import { FONT_SIZE } from "../../tokens/fontSize";
import { FIELD_BORDER_RADIUS } from "./fieldStyle";

type Option = string | number;

const Styled = {
  Radios: { display: "flex", flexWrap: "wrap", gap: 4 } satisfies CSSProperties,
  Radio: {
    minHeight: 30,
    padding: "0.25rem 0.6rem",
    border: `1px solid ${COLOR.border}`,
    borderRadius: FIELD_BORDER_RADIUS,
    fontFamily: "inherit",
    fontSize: FONT_SIZE.secondary,
    cursor: "pointer",
  } satisfies CSSProperties,
};

export const RadioControl = (props: {
  value: unknown;
  options: Option[];
  onChange: (value: Option) => void;
}) => (
  <div style={Styled.Radios} role="radiogroup">
    {props.options.map((option) => {
      const selected = props.value === option;
      return (
        <button
          key={String(option)}
          type="button"
          role="radio"
          aria-checked={selected}
          style={{
            ...Styled.Radio,
            borderColor: selected ? COLOR.activeText : COLOR.border,
            background: selected ? COLOR.activeBg : COLOR.surface,
            color: selected ? COLOR.activeText : COLOR.body,
          }}
          onClick={() => props.onChange(option)}
        >
          {String(option)}
        </button>
      );
    })}
  </div>
);
