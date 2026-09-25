import type { CSSProperties } from "react";
import { COLOR } from "../../tokens/color";
import { FONT_SIZE } from "../../tokens/fontSize";
import { FIELD_BORDER, FIELD_BORDER_RADIUS, FIELD_HEIGHT } from "./fieldStyle";

const Styled = {
  Root: {
    display: "grid",
    gridTemplateColumns: "32px minmax(60px, 1fr) 32px",
    height: FIELD_HEIGHT,
    overflow: "hidden",
    border: FIELD_BORDER,
    borderRadius: FIELD_BORDER_RADIUS,
    background: COLOR.surface,
  } satisfies CSSProperties,
  Button: {
    border: 0,
    background: COLOR.surfaceSubtle,
    color: COLOR.body,
    fontSize: "1rem",
    cursor: "pointer",
  } satisfies CSSProperties,
  Input: {
    minWidth: 0,
    padding: "0 0.4rem",
    border: 0,
    borderLeft: FIELD_BORDER,
    borderRight: FIELD_BORDER,
    outline: 0,
    textAlign: "center",
    color: COLOR.body,
    fontFamily: "inherit",
    fontSize: FONT_SIZE.secondary,
  } satisfies CSSProperties,
};

export const NumberControl = (props: { value: unknown; onChange: (value: number) => void }) => {
  const value = typeof props.value === "number" && Number.isFinite(props.value) ? props.value : 0;
  return (
    <div style={Styled.Root}>
      <button type="button" aria-label="Decrease" style={Styled.Button} onClick={() => props.onChange(value - 1)}>−</button>
      <input
        type="number"
        style={Styled.Input}
        value={value}
        onChange={(event) => {
          const nextValue = event.currentTarget.valueAsNumber;
          if (Number.isFinite(nextValue)) props.onChange(nextValue);
        }}
      />
      <button type="button" aria-label="Increase" style={Styled.Button} onClick={() => props.onChange(value + 1)}>+</button>
    </div>
  );
};
