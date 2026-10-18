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
}) => {
  const entries = Object.entries(props.controls);
  if (entries.length === 0) return <p className={styles.empty}>This preview has no props to edit</p>;

  return (
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
  );
};

export const ResetAllButton = (props: { onResetAll: () => void }) => (
  <button type="button" className={styles.resetAll} onClick={props.onResetAll}>
    Reset all
  </button>
);
