import {
  FRAME_PROTOCOL,
  FRAME_READY_MESSAGE_TYPE,
  type FrameArgs,
  type FrameReadyMessage,
  type FrameRenderMessage,
} from "@vitrine/protocol";
import type { ComponentType, ElementType } from "react";
import type { PreviewConfig } from "vite-plugin-react-vitrine/preview";
import {
  getInitialVariantKey,
  mergeControls,
  resolveVariantArgs,
  toVariantOptions,
  type Args,
} from "../preview/previewConfig";

type InferredControls = Record<string, GalleryPropControl>;

const isSendable = (value: unknown) =>
  typeof value === "string" || typeof value === "boolean" || (typeof value === "number" && Number.isFinite(value));

/** Gallery로 보낼 수 있는 값(문자열, 유한한 숫자, boolean)만 남김, 함수와 JSX는 frame에만 남음 */
export function toFrameArgs(args: Args): FrameArgs {
  return Object.fromEntries(Object.entries(args).filter(([, value]) => isSendable(value))) as FrameArgs;
}

/** 값은 있지만 Gallery로 보내지 못하는 prop 이름 */
export function frameOnlyArgNames(args: Args): string[] {
  return Object.entries(args)
    .filter(([, value]) => value !== undefined && value !== null && !isSendable(value))
    .map(([name]) => name);
}

type NamedComponent = ComponentType & { type?: NamedComponent; render?: { name?: string } };

/** memo와 forwardRef로 감싼 컴포넌트도 원래 이름으로 */
export function componentName(component: NamedComponent): string {
  return (
    component.displayName ||
    component.name ||
    (component.type && componentName(component.type)) ||
    component.render?.name ||
    "Component"
  );
}

/** 로드한 프리뷰의 control, variant, 직렬화 가능한 args로 frameReady 메시지 생성 */
export function buildFrameReady(
  inferred: InferredControls,
  config: PreviewConfig<ElementType>,
  component: ComponentType,
): FrameReadyMessage {
  const variants = toVariantOptions(config);
  const defaultArgs = resolveVariantArgs(inferred, config, undefined);
  const variantArgs = variants.map((variant) => [variant.key, resolveVariantArgs(inferred, config, variant.key)] as const);
  return {
    type: FRAME_READY_MESSAGE_TYPE,
    protocol: FRAME_PROTOCOL,
    controls: mergeControls(inferred, config.controls),
    variants,
    initialVariantKey: getInitialVariantKey(config) ?? null,
    defaultArgs: toFrameArgs(defaultArgs),
    variantArgs: Object.fromEntries(variantArgs.map(([key, args]) => [key, toFrameArgs(args)])),
    componentName: componentName(component),
    defaultFrameOnlyArgs: frameOnlyArgNames(defaultArgs),
    variantFrameOnlyArgs: Object.fromEntries(variantArgs.map(([key, args]) => [key, frameOnlyArgNames(args)])),
  };
}

/**
 * 컴포넌트에 넘길 args 계산, 원본 preview() args 위에 Gallery에서 바꾼 값을 덮어씀
 * Gallery 메시지가 오기 전(단독으로 연 frame 포함)에는 첫 variant 기준
 */
export function resolveFrameArgs(
  inferred: InferredControls,
  config: PreviewConfig<ElementType>,
  render: Pick<FrameRenderMessage, "variantKey" | "args"> | null,
): Args {
  if (!render) return resolveVariantArgs(inferred, config, getInitialVariantKey(config));
  // null은 Gallery에서 선택 prop을 비운 값이라 컴포넌트에는 undefined로 전달
  const overrides = Object.fromEntries(
    Object.entries(render.args).map(([name, value]) => [name, value === null ? undefined : value]),
  );
  return { ...resolveVariantArgs(inferred, config, render.variantKey ?? undefined), ...overrides };
}
