import type { CSSProperties } from "react";
import { COLOR } from "../../tokens/color";
import { FONT_SIZE } from "../../tokens/fontSize";

type Option = string | number;

const Styled = {
  Select: {
    width: "100%",
    height: 32,
    padding: "0 0.6rem",
    border: `1px solid ${COLOR.border}`,
    borderRadius: 6,
    outlineColor: COLOR.activeText,
    background: "white",
    color: COLOR.body,
    fontFamily: "inherit",
    fontSize: FONT_SIZE.secondary,
  } satisfies CSSProperties,
  Radios: { display: "flex", flexWrap: "wrap", gap: 4 } satisfies CSSProperties,
  Radio: {
    minHeight: 30,
    padding: "0.25rem 0.6rem",
    border: `1px solid ${COLOR.border}`,
    borderRadius: 6,
    fontFamily: "inherit",
    fontSize: FONT_SIZE.secondary,
    cursor: "pointer",
  } satisfies CSSProperties,
};

export const SelectControl = (props: {
  value: unknown;
  options: Option[];
  optional: boolean;
  onChange: (value: Option | undefined) => void;
}) => (
  <select
    style={Styled.Select}
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
            background: selected ? COLOR.activeBg : "white",
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
