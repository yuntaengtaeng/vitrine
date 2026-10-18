import type { FrameArgs, FrameLayout, FrameVariant } from "@vitrine/protocol";

export interface ViewState {
  variants: readonly FrameVariant[];
  /** 사용자가 바꾼 값만 */
  overrides: FrameArgs;
}

export const singleLayout = (): FrameLayout => ({ kind: "single" });

export function variantsLayout(state: ViewState): FrameLayout {
  return {
    kind: "grid",
    cells: state.variants.map((variant) => ({
      key: variant.key,
      label: variant.name,
      variantKey: variant.key,
      args: state.overrides,
    })),
  };
}
