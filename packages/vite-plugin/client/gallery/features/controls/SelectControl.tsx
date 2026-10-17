import * as styles from "./controls.css";

type Option = string | number;

export const SelectControl = (props: {
  label: string;
  value: unknown;
  options: Option[];
  optional: boolean;
  onChange: (value: Option | undefined) => void;
}) => (
  <select
    aria-label={props.label}
    className={styles.select}
    value={String(props.value ?? "")}
    onChange={(event) => {
      if (event.currentTarget.value === "" && props.optional) return props.onChange(undefined);
      props.onChange(props.options.find((option) => String(option) === event.currentTarget.value));
    }}
  >
    {props.optional && <option value="">Unset</option>}
    {props.options.map((option) => <option key={String(option)} value={String(option)}>{String(option)}</option>)}
  </select>
);
