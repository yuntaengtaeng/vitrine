import type { CSSProperties } from "react";
import { COLOR } from "../tokens/color";
import { FONT_SIZE } from "../tokens/fontSize";
import type { PreviewVariantOption } from "../preview/previewConfig";

const Styled = {
  Root: { display: "flex", gap: "0.4rem", padding: "0.7rem 2.5rem 0", flexWrap: "wrap" } satisfies CSSProperties,
  Tab: {
    base: {
      border: "none",
      borderBottom: "2px solid transparent",
      padding: "0.3rem 0.1rem",
      fontSize: FONT_SIZE.label,
      fontFamily: "inherit",
      cursor: "pointer",
      background: "transparent",
      color: COLOR.label,
    } satisfies CSSProperties,
    active: {
      borderBottom: `2px solid ${COLOR.activeText}`,
      color: COLOR.activeText,
    } satisfies CSSProperties,
  },
};

export const VariantPicker = (props: {
  variants: PreviewVariantOption[];
  activeKey: string | undefined;
  onSelect: (key: string) => void;
}) => {
  if (props.variants.length === 0) return null;

  return (
    <div style={Styled.Root} role="group" aria-label="Variants">
      {props.variants.map((variant) => {
        const active = variant.key === props.activeKey;
        return (
          <button
            key={variant.key}
            type="button"
            aria-pressed={active}
            style={{ ...Styled.Tab.base, ...(active ? Styled.Tab.active : {}) }}
            onClick={() => props.onSelect(variant.key)}
          >
            {variant.name}
          </button>
        );
      })}
    </div>
  );
};
