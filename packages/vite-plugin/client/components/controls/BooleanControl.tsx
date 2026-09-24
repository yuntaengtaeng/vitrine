import type { CSSProperties } from "react";
import { COLOR } from "../../tokens/color";
import { FONT_SIZE } from "../../tokens/fontSize";

const Styled = {
  Button: {
    display: "inline-flex",
    alignItems: "center",
    justifySelf: "start",
    gap: "0.55rem",
    padding: 0,
    border: 0,
    background: "transparent",
    color: COLOR.body,
    fontFamily: "inherit",
    fontSize: FONT_SIZE.secondary,
    cursor: "pointer",
  } satisfies CSSProperties,
  Track: {
    position: "relative",
    width: 34,
    height: 20,
    borderRadius: 999,
    transition: "background 120ms ease",
  } satisfies CSSProperties,
  Thumb: {
    position: "absolute",
    top: 3,
    width: 14,
    height: 14,
    borderRadius: "50%",
    background: COLOR.surface,
    boxShadow: "0 1px 2px rgba(0,0,0,0.22)",
    transition: "left 120ms ease",
  } satisfies CSSProperties,
};

export const BooleanControl = (props: { value: unknown; onChange: (value: boolean) => void }) => {
  const checked = Boolean(props.value);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      style={Styled.Button}
      onClick={() => props.onChange(!checked)}
    >
      <span style={{ ...Styled.Track, background: checked ? COLOR.activeText : COLOR.switchOff }}>
        <span style={{ ...Styled.Thumb, left: checked ? 17 : 3 }} />
      </span>
      {checked ? "On" : "Off"}
    </button>
  );
};
