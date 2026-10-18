import type { ComponentType, ElementType } from "react";
import type { PreviewConfig, PreviewControlType } from "vite-plugin-react-vitrine/preview";

export type ResolvedControl = Omit<GalleryPropControl, "type"> & { type: PreviewControlType };
export type ControlsMap = Record<string, ResolvedControl>;
export type Args = Record<string, unknown>;

export interface PreviewVariantOption {
  key: string;
  name: string;
}

/** 로드가 끝난 프리뷰 컴포넌트와 preview() 설정 */
export interface LoadedPreview {
  component: ComponentType;
  config: PreviewConfig<ElementType>;
}

/** 모듈 export가 렌더링 가능한 컴포넌트인지 판단 (memo, forwardRef 객체 포함) */
export function isPreviewComponent(value: unknown): value is ComponentType {
  if (typeof value === "function") return true;
  return typeof value === "object" && value !== null && "$$typeof" in value;
}

/** entry 모듈에서 프리뷰할 export를 골라 반환, 컴포넌트가 아니면 이유를 담은 Error throw */
export function pickPreviewComponent(
  mod: Record<string, unknown>,
  entry: Pick<GalleryPreviewEntry, "exportName" | "file">,
): ComponentType {
  const component = mod[entry.exportName];
  if (!isPreviewComponent(component)) {
    throw new Error(`"${entry.exportName}" in ${entry.file} is not a component (got ${typeof component}).`);
  }
  return component;
}

/** 추론된 control 위에 preview() controls override를 병합 */
export function mergeControls(
  inferred: Record<string, GalleryPropControl>,
  overrides: PreviewConfig<ElementType>["controls"] = {},
): ControlsMap {
  const result: ControlsMap = { ...inferred };
  for (const [name, override] of Object.entries(overrides)) {
    if (!override) continue;
    const normalized = typeof override === "string" ? { type: override } : override;
    const existing = result[name];
    result[name] = existing ? { ...existing, ...normalized } : { optional: true, ...normalized };
  }
  return result;
}

/** control 기본값, preview() args, variant args 순으로 덮어쓴 초기 args 계산 */
export function resolveInitialArgs(
  controls: Record<string, GalleryPropControl>,
  registeredArgs: Args | undefined,
  variantArgs?: Args,
): Args {
  const defaults = Object.fromEntries(
    Object.entries(controls)
      .filter(([, control]) => control.defaultValue !== undefined)
      .map(([name, control]) => [name, control.defaultValue]),
  );
  return { ...defaults, ...registeredArgs, ...variantArgs };
}

/** 선택한 variant 기준 args 계산, 사용자가 고친 값은 variant 프리셋으로 초기화 */
export function resolveVariantArgs(
  controls: Record<string, GalleryPropControl>,
  config: PreviewConfig<ElementType>,
  variantKey: string | undefined,
): Args {
  const variantArgs = variantKey ? config.variants?.[variantKey]?.args : undefined;
  return resolveInitialArgs(controls, config.args, variantArgs);
}

/** defaultVariant, 없으면 첫 variant 키 조회 */
export function getInitialVariantKey(config: PreviewConfig<ElementType>): string | undefined {
  return config.defaultVariant ?? Object.keys(config.variants ?? {})[0];
}

/** variant 선택 UI용 key와 표시 이름 목록 생성 */
export function toVariantOptions(config: PreviewConfig<ElementType>): PreviewVariantOption[] {
  return Object.entries(config.variants ?? {}).map(([key, variant]) => ({
    key,
    name: variant.name ?? key,
  }));
}
