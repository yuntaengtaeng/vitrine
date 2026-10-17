import type { FrameGlobalValues } from "@vitrine/protocol";
import { useState } from "react";
import type { FrameSelection, LayoutFor } from "./frameLink";
import { displayedArgs, startingSelection, toOverrideValue } from "./frameStatus";
import { usePreviewFrame } from "./usePreviewFrame";

/** `requested`는 상태 링크로 연 경우 시작할 variant와 값 */
export const usePreviewSession = (layoutFor: LayoutFor, globals: FrameGlobalValues, requested?: FrameSelection) => {
  const [selection, setSelection] = useState<FrameSelection | null>(null);
  const { iframeRef, status } = usePreviewFrame(selection, layoutFor, globals);
  const { ready } = status;

  // 첫 frameReady로 frame이 고른 초기 variant를 알게 되면 그때부터 Gallery가 상태를 소유
  if (ready && !selection) setSelection(startingSelection(ready, requested));

  const selectVariant = (variantKey: string) => setSelection({ variantKey, args: {} });
  const changeArg = (name: string, value: unknown) => {
    const next = toOverrideValue(value);
    if (next === undefined) return;
    setSelection((current) => current && { ...current, args: { ...current.args, [name]: next } });
  };
  const resetArg = (name: string) =>
    setSelection((current) => {
      if (!current) return current;
      const { [name]: _removed, ...args } = current.args;
      return { ...current, args };
    });
  const resetAllArgs = () => setSelection((current) => current && { ...current, args: {} });

  return {
    iframeRef,
    status,
    activeVariantKey: selection?.variantKey ?? undefined,
    args: ready && selection ? displayedArgs(ready, selection.variantKey, selection.args) : null,
    changedArgs: new Set(Object.keys(selection?.args ?? {})),
    overrides: selection?.args ?? {},
    selectVariant,
    changeArg,
    resetArg,
    resetAllArgs,
  };
};
