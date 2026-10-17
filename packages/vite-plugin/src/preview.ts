import type { ComponentProps, ComponentType, ElementType, ReactNode } from "react";

/** setup file이 선언하는 global 하나, Gallery toolbar에서 선택지 중 하나를 고름 */
export interface PreviewGlobal {
  label?: string;
  options: readonly string[];
  /** 없으면 첫 선택지 */
  default?: string;
}

/** setup file의 `globals` export */
export type PreviewGlobals = Record<string, PreviewGlobal>;

/** 선언에서 이름별로 고른 값 */
export type PreviewGlobalValues<Globals extends PreviewGlobals = PreviewGlobals> = {
  [Name in keyof Globals]: Globals[Name]["options"][number];
};

/** 프리뷰 wrapper가 받는 children과 지금 globals */
export interface PreviewWrapperProps<Globals extends PreviewGlobals = PreviewGlobals> {
  children: ReactNode;
  globals: PreviewGlobalValues<Globals>;
}

/** 프리뷰 렌더링 영역을 감싸는 React 컴포넌트 */
export type PreviewWrapper = ComponentType<PreviewWrapperProps>;

export type PreviewControlType = "text" | "number" | "boolean" | "select" | "radio";

export interface PreviewControl {
  type: PreviewControlType;
  options?: Array<string | number>;
}

export type PreviewControls<Props> = Partial<{
  [Key in keyof Props]: PreviewControlType | PreviewControl;
}>;

export interface PreviewVariant<Component extends ElementType> {
  name?: string;
  args?: Partial<ComponentProps<Component>>;
  /** 이 variant에서 고정할 globals, Gallery에서 바꿀 수 없음 */
  globals?: Record<string, string>;
}

export interface PreviewConfig<Component extends ElementType> {
  args?: Partial<ComponentProps<Component>>;
  controls?: PreviewControls<ComponentProps<Component>>;
  /** 이 컴포넌트 프리뷰에만 적용할 wrapper */
  wrapper?: PreviewWrapper;
  /** 이 컴포넌트에서 고정할 globals, Gallery에서 바꿀 수 없음 */
  globals?: Record<string, string>;
  /** 컴포넌트의 이름 붙은 상태/설정 모음, 갤러리에서 전환하며 확인 */
  variants?: Record<string, PreviewVariant<Component>>;
  /** 지정 없으면 variants의 첫 키를 기본으로 사용 */
  defaultVariant?: string;
}

const configs = new WeakMap<object, PreviewConfig<ElementType>>();
type PreviewTarget = object & ElementType;

/** 컴포넌트별 args, controls, wrapper, variants 등록 */
export function preview<Component extends PreviewTarget>(
  component: Component,
  config: PreviewConfig<Component>,
): void {
  configs.set(component, config as PreviewConfig<ElementType>);
}

/** 컴포넌트 모듈 평가 후 등록된 프리뷰 설정 조회 */
export function getPreviewConfig(component: object): PreviewConfig<ElementType> | undefined {
  return configs.get(component);
}
