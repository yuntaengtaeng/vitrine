import type { ElementType } from "react";
import type { PreviewConfig } from "./preview.js";

const configs = new WeakMap<object, PreviewConfig<ElementType>>();

/** 컴포넌트별 프리뷰 설정 등록 */
export function preview(component: object, config: PreviewConfig<ElementType>): void {
  configs.set(component, config);
}

/** 컴포넌트 모듈 평가 후 등록된 프리뷰 설정 조회 */
export function getPreviewConfig(component: object): PreviewConfig<ElementType> | undefined {
  return configs.get(component);
}
