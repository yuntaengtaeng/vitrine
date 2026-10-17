import * as styles from "./controls.css";

export const TextControl = (props: { label: string; value: unknown; onChange: (value: string) => void }) => (
  <input
    aria-label={props.label}
    className={styles.textInput}
    type="text"
    value={String(props.value ?? "")}
    onChange={(event) => props.onChange(event.currentTarget.value)}
  />
);
