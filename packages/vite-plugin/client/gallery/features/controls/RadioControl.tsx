import { useRef, type CSSProperties, type KeyboardEvent } from "react";
import { COLOR } from "../../../tokens/color";
import { FONT_SIZE } from "../../../tokens/fontSize";
import { FIELD_BORDER_RADIUS } from "../../shared/ui/fieldStyle";
import { focusableRadioIndex, nextRadioIndex } from "./radioKeyboard";

type Option = string | number;

const Styled = {
  Radios: { display: "flex", flexWrap: "wrap", gap: 4 } satisfies CSSProperties,
  Radio: {
    minHeight: 30,
    padding: "0.25rem 0.6rem",
    border: `1px solid ${COLOR.border}`,
    borderRadius: FIELD_BORDER_RADIUS,
    fontFamily: "inherit",
    fontSize: FONT_SIZE.secondary,
    cursor: "pointer",
  } satisfies CSSProperties,
};

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
    <div style={Styled.Radios} role="radiogroup" aria-label={props.label}>
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
            style={{
              ...Styled.Radio,
              borderColor: selected ? COLOR.activeText : COLOR.border,
              background: selected ? COLOR.activeBg : COLOR.surface,
              color: selected ? COLOR.activeText : COLOR.body,
            }}
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
