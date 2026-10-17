import type { SnapshotHistory } from "@vitrine/protocol";
import { comparableSnapshots, snapshotLabel, type HistoryChoice, type HistoryMode } from "./history";
import * as styles from "./HistoryPicker.css";

const MODES: { value: HistoryMode; label: string }[] = [
  { value: "side", label: "Side by side" },
  { value: "overlay", label: "Overlay" },
];

export const HistoryPicker = (props: {
  history: SnapshotHistory;
  /** 지금 비교 중인 스냅샷 번호 */
  snapshot: number;
  mode: HistoryMode;
  onChange: (choice: HistoryChoice) => void;
}) => {
  const pruned = props.history.pruned > 0 ? `, ${props.history.pruned} older saves were removed` : "";
  return (
    <div className={styles.root} role="group" aria-label="History">
      <label className={styles.picker}>
        Compare
        <select
          className={styles.select}
          value={props.snapshot}
          onChange={(event) => props.onChange({ snapshot: Number(event.currentTarget.value), mode: props.mode })}
        >
          {comparableSnapshots(props.history).map((snapshot) => (
            <option key={snapshot.number} value={snapshot.number}>
              {snapshotLabel(snapshot)}
            </option>
          ))}
        </select>
      </label>
      <label className={styles.picker}>
        Mode
        <select
          className={styles.select}
          value={props.mode}
          onChange={(event) =>
            props.onChange({ snapshot: props.snapshot, mode: event.currentTarget.value as HistoryMode })
          }
        >
          {MODES.map((mode) => (
            <option key={mode.value} value={mode.value}>
              {mode.label}
            </option>
          ))}
        </select>
      </label>
      <span
        className={styles.note}
        title={`Saves of @preview files are kept in memory while the dev server runs. Snapshot 1 is when it started or when the file got @preview. Renamed files start a new history${pruned}`}
      >
        Kept until the dev server stops
      </span>
    </div>
  );
};
