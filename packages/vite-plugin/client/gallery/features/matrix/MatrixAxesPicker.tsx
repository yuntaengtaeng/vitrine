import type { MatrixAxis } from "./matrix";
import * as styles from "./MatrixAxesPicker.css";

const NONE = "";

export const MatrixAxesPicker = (props: {
  axes: readonly MatrixAxis[];
  rows: string;
  columns: string | null;
  onChange: (choice: { rows: string; columns: string | null }) => void;
}) => (
  <div className={styles.root} role="group" aria-label="Matrix axes">
    <label className={styles.picker}>
      Rows
      <select
        className={styles.select}
        value={props.rows}
        onChange={(event) => props.onChange({ rows: event.currentTarget.value, columns: props.columns })}
      >
        {props.axes.map((axis) => (
          <option key={axis.name} value={axis.name}>
            {axis.name}
          </option>
        ))}
      </select>
    </label>
    <label className={styles.picker}>
      Columns
      <select
        className={styles.select}
        value={props.columns ?? NONE}
        onChange={(event) => props.onChange({ rows: props.rows, columns: event.currentTarget.value || null })}
      >
        <option value={NONE}>None</option>
        {props.axes
          .filter((axis) => axis.name !== props.rows)
          .map((axis) => (
            <option key={axis.name} value={axis.name}>
              {axis.name}
            </option>
          ))}
      </select>
    </label>
  </div>
);

export const MatrixLimitNotice = (props: { count: number; max: number }) => (
  <p className={styles.notice} role="status">
    These axes need {props.count} previews, and a matrix shows at most {props.max}. Pick props with fewer
    options or set Columns to None
  </p>
);
