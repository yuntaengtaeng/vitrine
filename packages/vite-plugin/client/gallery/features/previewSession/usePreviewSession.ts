import { useState } from "react";
import type { FrameRenderState } from "./frameLink";
import { displayedArgs, toOverrideValue } from "./frameStatus";
import { usePreviewFrame } from "./usePreviewFrame";

/** 한 프리뷰를 보는 동안 Gallery가 소유하는 variant와 바꾼 값, 바뀔 때마다 frame에 전송 */
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
    // frameReady 전에는 보여줄 control 값이 없음
    args: ready && selection ? displayedArgs(ready, selection.variantKey, selection.args) : null,
    selectVariant,
    changeArg,
  };
};
