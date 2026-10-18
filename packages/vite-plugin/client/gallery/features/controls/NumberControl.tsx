import * as styles from "./controls.css";

export const NumberControl = (props: { label: string; value: unknown; onChange: (value: number) => void }) => {
  const value = typeof props.value === "number" && Number.isFinite(props.value) ? props.value : 0;
  return (
    <div className={styles.number}>
      <button type="button" aria-label={`Decrease ${props.label}`} className={styles.numberStep} onClick={() => props.onChange(value - 1)}>−</button>
      <input
        aria-label={props.label}
        type="number"
        className={styles.numberInput}
        value={value}
        onChange={(event) => {
          const nextValue = event.currentTarget.valueAsNumber;
          if (Number.isFinite(nextValue)) props.onChange(nextValue);
        }}
      />
      <button type="button" aria-label={`Increase ${props.label}`} className={styles.numberStep} onClick={() => props.onChange(value + 1)}>+</button>
    </div>
  );
};
