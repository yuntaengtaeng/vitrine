import type { CSSProperties } from "react";
import { COLOR } from "../tokens/color";
import { FONT_SIZE } from "../tokens/fontSize";
import { BooleanControl } from "./controls/BooleanControl";
import { ControlField } from "./controls/ControlField";
import { NumberControl } from "./controls/NumberControl";
import { RadioControl } from "./controls/RadioControl";
import { SelectControl } from "./controls/SelectControl";
import { TextControl } from "./controls/TextControl";
import type { ControlsMap } from "./previewConfig";

const Styled = {
  Root: {
    width: "100%",
    maxHeight: 280,
    flexShrink: 0,
    padding: "0.85rem 1rem 1rem",
    borderTop: `1px solid ${COLOR.border}`,
    boxSizing: "border-box",
    overflowY: "auto",
    background: COLOR.surfaceSubtle,
  } satisfies CSSProperties,
  Header: { display: "flex", alignItems: "baseline", gap: 8, marginBottom: "0.7rem" } satisfies CSSProperties,
  Heading: {
    margin: 0,
    color: COLOR.body,
    fontSize: FONT_SIZE.secondary,
    fontWeight: 650,
  } satisfies CSSProperties,
  Count: { color: COLOR.label, fontSize: FONT_SIZE.label } satisfies CSSProperties,
  Fields: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "0.5rem 1.5rem",
  } satisfies CSSProperties,
};

export const Controls = (props: {
  controls: ControlsMap;
  args: Record<string, unknown>;
  onChange: (name: string, value: unknown) => void;
}) => {
  const entries = Object.entries(props.controls);
  if (entries.length === 0) return null;

  return (
    <aside style={Styled.Root}>
      <div style={Styled.Header}>
        <h2 style={Styled.Heading}>Props</h2>
        <span style={Styled.Count}>{entries.length}</span>
      </div>
      <div style={Styled.Fields}>
        {entries.map(([name, control]) => {
          const value = props.args[name];
          const change = (next: unknown) => props.onChange(name, next);
          return (
            <ControlField key={name} name={name} optional={control.optional}>
              {control.type === "boolean" ? (
                <BooleanControl value={value} onChange={change} />
              ) : control.type === "number" ? (
                <NumberControl value={value} onChange={change} />
              ) : control.type === "radio" ? (
                <RadioControl value={value} options={control.options ?? []} onChange={change} />
              ) : control.type === "select" ? (
                <SelectControl value={value} options={control.options ?? []} optional={control.optional} onChange={change} />
              ) : (
                <TextControl value={value} onChange={change} />
              )}
            </ControlField>
          );
        })}
      </div>
    </aside>
  );
};
