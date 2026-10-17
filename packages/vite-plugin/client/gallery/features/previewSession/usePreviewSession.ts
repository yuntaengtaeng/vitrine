import type { FrameGlobalValues } from "@vitrine/protocol";
import { useState } from "react";
import type { FrameSelection, LayoutFor } from "./frameLink";
import { displayedArgs, toOverrideValue } from "./frameStatus";
import { usePreviewFrame } from "./usePreviewFrame";

export const usePreviewSession = (layoutFor: LayoutFor, globals: FrameGlobalValues) => {
  const [selection, setSelection] = useState<FrameSelection | null>(null);
  const { iframeRef, status } = usePreviewFrame(selection, layoutFor, globals);
  const { ready } = status;

  // 첫 frameReady로 frame이 고른 초기 variant를 알게 되면 그때부터 Gallery가 상태를 소유
  if (ready && !selection) setSelection({ variantKey: ready.initialVariantKey, args: {} });

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
    selectVariant,
    changeArg,
    resetArg,
    resetAllArgs,
  };
};
