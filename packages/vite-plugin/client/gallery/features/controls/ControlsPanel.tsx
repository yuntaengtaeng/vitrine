import type { FrameControl } from "@vitrine/protocol";
import { ControlField } from "./ControlField";
import { ControlInput } from "./ControlInput";
import * as styles from "./ControlsPanel.css";
import { controlTypeLabel } from "./controlType";

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
    <aside className={styles.root} aria-label="Props">
      <div className={styles.header}>
        <h2 className={styles.heading}>Props</h2>
        <span className={styles.count}>{entries.length}</span>
        {props.changed.size > 0 && (
          <button type="button" className={styles.resetAll} onClick={props.onResetAll}>
            Reset all
          </button>
        )}
      </div>
      <div className={styles.fields}>
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
