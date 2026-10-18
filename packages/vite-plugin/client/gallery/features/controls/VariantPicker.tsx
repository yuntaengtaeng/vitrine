import type { FrameVariant } from "@vitrine/protocol";
import * as styles from "./VariantPicker.css";

export const VariantPicker = (props: {
  variants: FrameVariant[];
  activeKey: string | undefined;
  onSelect: (key: string) => void;
}) => {
  if (props.variants.length === 0) return null;

  return (
    <div className={styles.root} role="group" aria-label="Variants">
      {props.variants.map((variant) => (
        <button
          key={variant.key}
          type="button"
          aria-pressed={variant.key === props.activeKey}
          className={styles.tab}
          onClick={() => props.onSelect(variant.key)}
        >
          {variant.name}
        </button>
      ))}
    </div>
  );
};
