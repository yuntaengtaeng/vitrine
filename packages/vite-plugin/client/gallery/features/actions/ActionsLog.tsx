import type { FrameActionMessage } from "@vitrine/protocol";
import * as styles from "./ActionsLog.css";
import { formatActionTime } from "./actionTime";

export const ActionsLog = (props: {
  calls: readonly Omit<FrameActionMessage, "type">[];
  /** 이 프리뷰에서 기록하는 함수 prop */
  names: readonly string[];
}) => {
  if (props.calls.length === 0) {
    return <p className={styles.empty}>Use the preview to record calls to {props.names.join(", ")}</p>;
  }
  return (
    <ol className={styles.list} aria-label="Action calls" reversed>
      {[...props.calls].reverse().map((call, index) => (
        <li key={`${call.at}-${index}`} className={styles.row}>
          <span className={styles.time}>{formatActionTime(call.at)}</span>
          <span className={styles.name}>{call.name}</span>
          <span className={styles.args}>{call.args.join(", ")}</span>
        </li>
      ))}
    </ol>
  );
};

export const ClearActionsButton = (props: { onClear: () => void }) => (
  <button type="button" className={styles.clear} onClick={props.onClear}>
    Clear
  </button>
);
