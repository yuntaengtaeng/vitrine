import type { CSSProperties, ReactNode } from "react";
import { COLOR } from "../../../tokens/color";
import { FONT_FAMILY } from "../../../tokens/fontFamily";
import { FONT_SIZE } from "../../../tokens/fontSize";
import { ResetIcon } from "../../shared/icons/ResetIcon";

const RESET_SIZE = 22;

const Styled = {
  Root: {
    display: "grid",
    gridTemplateColumns: `minmax(0, 1fr) ${RESET_SIZE}px`,
    gridTemplateRows: `${RESET_SIZE}px auto`,
    alignItems: "center",
    gap: "0.3rem 0.5rem",
  } satisfies CSSProperties,
  Label: {
    gridRow: 1,
    gridColumn: 1,
    display: "flex",
    alignItems: "baseline",
    gap: 6,
    minWidth: 0,
    whiteSpace: "nowrap",
  } satisfies CSSProperties,
  Name: { color: COLOR.body, fontSize: FONT_SIZE.secondary, fontWeight: 500 } satisfies CSSProperties,
  Optional: { color: COLOR.label, fontSize: FONT_SIZE.caption } satisfies CSSProperties,
  Type: {
    overflow: "hidden",
    color: COLOR.label,
    fontFamily: FONT_FAMILY.mono,
    fontSize: FONT_SIZE.caption,
    textOverflow: "ellipsis",
  } satisfies CSSProperties,
  Input: { gridRow: 2, gridColumn: "1 / -1", minWidth: 0 } satisfies CSSProperties,
  Reset: {
    gridRow: 1,
    gridColumn: 2,
    display: "grid",
    placeItems: "center",
    width: RESET_SIZE,
    height: RESET_SIZE,
    padding: 0,
    border: "none",
    borderRadius: 6,
    background: "transparent",
    color: COLOR.muted,
    cursor: "pointer",
  } satisfies CSSProperties,
};

const Root = (props: { children: ReactNode }) => <div style={Styled.Root}>{props.children}</div>;

const Label = (props: { name: string; type: string; optional: boolean }) => (
  <div style={Styled.Label}>
    <span style={Styled.Name}>{props.name}</span>
    {props.optional && <span style={Styled.Optional}>optional</span>}
    <code style={Styled.Type} title={props.type}>
      {props.type}
    </code>
  </div>
);

const Input = (props: { children: ReactNode }) => <div style={Styled.Input}>{props.children}</div>;

const Reset = (props: { name: string; onReset: () => void }) => (
  <button
    type="button"
    aria-label={`Reset ${props.name}`}
    title="Reset to the variant value"
    style={Styled.Reset}
    onClick={props.onReset}
  >
    <ResetIcon size={14} />
  </button>
);

export const ControlField = Object.assign(Root, { Label, Input, Reset });
