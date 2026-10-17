import { useState } from "react";
import type { FrameRenderState } from "./frameLink";
import { displayedArgs, toOverrideValue } from "./frameStatus";
import { usePreviewFrame } from "./usePreviewFrame";

export const usePreviewSession = () => {
  const [selection, setSelection] = useState<FrameRenderState | null>(null);
  const { iframeRef, status } = usePreviewFrame(selection);
  const { ready } = status;

  // 첫 frameReady로 frame이 고른 초기 variant를 알게 되면 그때부터 Gallery가 상태를 소유
  if (ready && !selection) setSelection({ variantKey: ready.initialVariantKey, args: {} });

  const selectVariant = (variantKey: string) => setSelection({ variantKey, args: {} });
  const changeArg = (name: string, value: unknown) => {
    const next = toOverrideValue(value);
    if (next === undefined) return;
    setSelection((current) => current && { ...current, args: { ...current.args, [name]: next } });
  };

  return {
    iframeRef,
    status,
    activeVariantKey: selection?.variantKey ?? undefined,
    args: ready && selection ? displayedArgs(ready, selection.variantKey, selection.args) : null,
    selectVariant,
    changeArg,
  };
};
