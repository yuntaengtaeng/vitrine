import type { FrameControl } from "@vitrine/protocol";
import type { CSSProperties } from "react";
import { COLOR } from "../../../tokens/color";
import { FONT_SIZE } from "../../../tokens/fontSize";
import { SECONDARY_BUTTON } from "../../shared/ui/buttonStyle";
import { ControlField } from "./ControlField";
import { ControlInput } from "./ControlInput";
import { controlTypeLabel } from "./controlType";

const Styled = {
  Root: {
    width: "100%",
    maxHeight: 280,
    flexShrink: 0,
    padding: "0.85rem 1rem 1rem",
    borderTop: `1px solid ${COLOR.border}`,
    boxSizing: "border-box",
    overflowY: "auto",
    background: COLOR.surface,
  } satisfies CSSProperties,
  Header: { display: "flex", alignItems: "center", gap: 8, marginBottom: "0.6rem" } satisfies CSSProperties,
  Heading: {
    margin: 0,
    color: COLOR.body,
    fontSize: FONT_SIZE.secondary,
    fontWeight: 650,
  } satisfies CSSProperties,
  Count: { color: COLOR.label, fontSize: FONT_SIZE.label } satisfies CSSProperties,
  ResetAll: { ...SECONDARY_BUTTON, marginLeft: "auto", padding: "0.2rem 0.6rem" } satisfies CSSProperties,
  Fields: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "0.9rem 1.5rem",
  } satisfies CSSProperties,
};

export const ControlsPanel = (props: {
  controls: Record<string, FrameControl>;
  args: Record<string, unknown>;
  /** variant 값에서 바꾼 prop */
  changed: ReadonlySet<string>;
  onChange: (name: string, value: unknown) => void;
  onReset: (name: string) => void;
  onResetAll: () => void;
}) => {
  const entries = Object.entries(props.controls);
  if (entries.length === 0) return null;

  return (
    <aside style={Styled.Root} aria-label="Props">
      <div style={Styled.Header}>
        <h2 style={Styled.Heading}>Props</h2>
        <span style={Styled.Count}>{entries.length}</span>
        {props.changed.size > 0 && (
          <button type="button" style={Styled.ResetAll} onClick={props.onResetAll}>
            Reset all
          </button>
        )}
      </div>
      <div style={Styled.Fields}>
        {entries.map(([name, control]) => (
          <ControlField key={name}>
            <ControlField.Label name={name} type={controlTypeLabel(control)} optional={control.optional} />
            <ControlField.Input>
              <ControlInput
                name={name}
                control={control}
                value={props.args[name]}
                onChange={(next) => props.onChange(name, next)}
              />
            </ControlField.Input>
            {props.changed.has(name) && <ControlField.Reset name={name} onReset={() => props.onReset(name)} />}
          </ControlField>
        ))}
      </div>
    </aside>
  );
};
