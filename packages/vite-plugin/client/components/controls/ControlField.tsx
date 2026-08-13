import type { CSSProperties, ReactNode } from "react";
import { COLOR } from "../../tokens/color";
import { FONT_SIZE } from "../../tokens/fontSize";

const Styled = {
  Root: {
    display: "grid",
    gridTemplateColumns: "minmax(72px, 0.45fr) minmax(110px, 1fr)",
    alignItems: "center",
    minHeight: 34,
    gap: "0.75rem",
  } satisfies CSSProperties,
  Label: {
    overflow: "hidden",
    color: COLOR.body,
    fontSize: FONT_SIZE.secondary,
    fontWeight: 500,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  } satisfies CSSProperties,
  Optional: { marginLeft: 4, color: COLOR.label, fontSize: "0.68rem", fontWeight: 400 } satisfies CSSProperties,
};

export const ControlField = (props: {
  name: string;
  optional: boolean;
  children: ReactNode;
}) => (
  <div style={Styled.Root}>
    <div style={Styled.Label} title={props.name}>
      {props.name}
      {props.optional && <span style={Styled.Optional}>optional</span>}
    </div>
    {props.children}
  </div>
);
