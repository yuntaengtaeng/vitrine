import { resolveGlobals, type FrameGlobal, type FrameGlobalValues } from "@vitrine/protocol";
import * as styles from "./GlobalsPicker.css";

export const GlobalsPicker = (props: {
  declared: Record<string, FrameGlobal>;
  chosen: FrameGlobalValues;
  /** preview()나 variant가 고정해 바꿀 수 없는 값 */
  fixed: FrameGlobalValues;
  onChange: (name: string, value: string) => void;
}) => {
  const values = resolveGlobals(props.declared, props.chosen, props.fixed);
  const names = Object.keys(props.declared);
  if (names.length === 0) return null;

  return (
    <div className={styles.root} role="group" aria-label="Globals">
      {names.map((name) => {
        const global = props.declared[name];
        const fixed = props.fixed[name] !== undefined;
        return (
          <label key={name} className={styles.picker} title={fixed ? "Fixed by preview() for this preview" : undefined}>
            {global.label}
            <select
              className={styles.select}
              value={values[name]}
              disabled={fixed}
              onChange={(event) => props.onChange(name, event.currentTarget.value)}
            >
              {global.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        );
      })}
    </div>
  );
};
