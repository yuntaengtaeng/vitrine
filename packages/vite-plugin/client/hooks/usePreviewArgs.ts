import { useState, type ElementType } from "react";
import type { PreviewConfig } from "vite-plugin-react-vitrine/preview";
import {
  getInitialVariantKey,
  mergeControls,
  resolveVariantArgs,
  toVariantOptions,
  type Args,
  type ControlsMap,
  type PreviewVariantOption,
} from "../preview/previewConfig";

interface PreviewArgsState {
  controls: ControlsMap;
  args: Args;
  setArg: (name: string, value: unknown) => void;
  variants: PreviewVariantOption[];
  variantKey: string | undefined;
  setVariant: (key: string) => void;
}

/** 로드된 프리뷰의 control 목록, variant 선택, 현재 args 상태 관리 (초기값은 마운트 시점 기준) */
export const usePreviewArgs = (
  inferredControls: Record<string, GalleryPropControl>,
  config: PreviewConfig<ElementType>,
): PreviewArgsState => {
  const [variantKey, setVariantKey] = useState(() => getInitialVariantKey(config));
  const [args, setArgs] = useState(() => resolveVariantArgs(inferredControls, config, variantKey));

  return {
    controls: mergeControls(inferredControls, config.controls),
    args,
    setArg: (name, value) => setArgs((current) => ({ ...current, [name]: value })),
    variants: toVariantOptions(config),
    variantKey,
    setVariant: (key) => {
      setVariantKey(key);
      setArgs(resolveVariantArgs(inferredControls, config, key));
    },
  };
};
