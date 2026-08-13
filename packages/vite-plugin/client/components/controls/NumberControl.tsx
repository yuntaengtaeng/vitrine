import type { CSSProperties } from "react";
import { COLOR } from "../../tokens/color";
import { FONT_SIZE } from "../../tokens/fontSize";

const Styled = {
  Root: {
    display: "grid",
    gridTemplateColumns: "32px minmax(60px, 1fr) 32px",
    height: 32,
    overflow: "hidden",
    border: `1px solid ${COLOR.border}`,
    borderRadius: 6,
    background: "white",
  } satisfies CSSProperties,
  Button: {
    border: 0,
    background: "#f8fafc",
    color: COLOR.body,
    fontSize: "1rem",
    cursor: "pointer",
  } satisfies CSSProperties,
  Input: {
    minWidth: 0,
    padding: "0 0.4rem",
    border: 0,
    borderLeft: `1px solid ${COLOR.border}`,
    borderRight: `1px solid ${COLOR.border}`,
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
        onChange={(event) => props.onChange(event.currentTarget.valueAsNumber)}
      />
      <button type="button" aria-label="Increase" style={Styled.Button} onClick={() => props.onChange(value + 1)}>+</button>
    </div>
  );
};
