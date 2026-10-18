import { useRef, type KeyboardEvent } from "react";
import * as styles from "./controls.css";
import { focusableRadioIndex, nextRadioIndex } from "./radioKeyboard";

type Option = string | number;

export const RadioControl = (props: {
  label: string;
  value: unknown;
  options: Option[];
  onChange: (value: Option) => void;
}) => {
  const radioRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedIndex = props.options.findIndex((option) => option === props.value);
  const tabStopIndex = focusableRadioIndex(selectedIndex);

  const moveSelection = (event: KeyboardEvent, currentIndex: number) => {
    const nextIndex = nextRadioIndex(currentIndex, event.key, props.options.length);
    if (nextIndex === null) return;
    event.preventDefault();
    props.onChange(props.options[nextIndex]);
    radioRefs.current[nextIndex]?.focus();
  };

  return (
    <div className={styles.radios} role="radiogroup" aria-label={props.label}>
      {props.options.map((option, index) => {
        const selected = index === selectedIndex;
        return (
          <button
            key={String(option)}
            ref={(element) => {
              radioRefs.current[index] = element;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={index === tabStopIndex ? 0 : -1}
            className={styles.radio}
            onClick={() => props.onChange(option)}
            onKeyDown={(event) => moveSelection(event, index)}
          >
            {String(option)}
          </button>
        );
      })}
    </div>
  );
};
