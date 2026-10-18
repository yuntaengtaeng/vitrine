import * as styles from "./controls.css";

export const BooleanControl = (props: { label: string; value: unknown; onChange: (value: boolean) => void }) => {
  const checked = Boolean(props.value);
  return (
    <button
      type="button"
      role="switch"
      aria-label={props.label}
      aria-checked={checked}
      className={styles.switchButton}
      onClick={() => props.onChange(!checked)}
    >
      <span className={styles.switchTrack}>
        <span className={styles.switchThumb} />
      </span>
      {checked ? "On" : "Off"}
    </button>
  );
};
