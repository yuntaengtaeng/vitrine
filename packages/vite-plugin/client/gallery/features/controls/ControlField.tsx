import type { CSSProperties, ReactNode } from "react";
import { COLOR } from "../../../tokens/color";
import { FONT_FAMILY } from "../../../tokens/fontFamily";
import { FONT_SIZE } from "../../../tokens/fontSize";
import { ResetIcon } from "../../shared/icons/ResetIcon";

const RESET_SIZE = 24;

const Styled = {
  // Reset 버튼이 없는 줄도 입력 칸 너비가 같도록 세 칸 고정
  Root: {
    display: "grid",
    gridTemplateColumns: `minmax(72px, 0.45fr) minmax(110px, 1fr) ${RESET_SIZE}px`,
    alignItems: "center",
    minHeight: 40,
    gap: "0.75rem",
  } satisfies CSSProperties,
  Label: { display: "grid", gap: 1, minWidth: 0 } satisfies CSSProperties,
  Name: {
    overflow: "hidden",
    color: COLOR.body,
    fontSize: FONT_SIZE.secondary,
    fontWeight: 500,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  } satisfies CSSProperties,
  Optional: { marginLeft: 4, color: COLOR.label, fontSize: FONT_SIZE.caption, fontWeight: 400 } satisfies CSSProperties,
  Type: {
    overflow: "hidden",
    color: COLOR.label,
    fontFamily: FONT_FAMILY.mono,
    fontSize: FONT_SIZE.caption,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  } satisfies CSSProperties,
  Reset: {
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
    <span style={Styled.Name} title={props.name}>
      {props.name}
      {props.optional && <span style={Styled.Optional}>optional</span>}
    </span>
    <code style={Styled.Type} title={props.type}>
      {props.type}
    </code>
  </div>
);

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

export const ControlField = Object.assign(Root, { Label, Reset });
