import {
  FRAME_PROTOCOL,
  FRAME_READY_MESSAGE_TYPE,
  type FrameArgs,
  type FrameReadyMessage,
  type FrameRenderMessage,
} from "@vitrine/protocol";
import type { ElementType } from "react";
import type { PreviewConfig } from "vite-plugin-react-vitrine/preview";
import {
  getInitialVariantKey,
  mergeControls,
  resolveVariantArgs,
  toVariantOptions,
  type Args,
} from "../preview/previewConfig";

type InferredControls = Record<string, GalleryPropControl>;

/** Gallery로 보낼 수 있는 값(문자열, 유한한 숫자, boolean)만 남김, 함수와 JSX는 frame에만 남음 */
export function toFrameArgs(args: Args): FrameArgs {
  const entries = Object.entries(args).filter(
    ([, value]) =>
      typeof value === "string" || typeof value === "boolean" || (typeof value === "number" && Number.isFinite(value)),
  );
  return Object.fromEntries(entries) as FrameArgs;
}

/** 로드한 프리뷰의 control, variant, 직렬화 가능한 args로 frameReady 메시지 생성 */
export function buildFrameReady(inferred: InferredControls, config: PreviewConfig<ElementType>): FrameReadyMessage {
  const variants = toVariantOptions(config);
  return {
    type: FRAME_READY_MESSAGE_TYPE,
    protocol: FRAME_PROTOCOL,
    controls: mergeControls(inferred, config.controls),
    variants,
    initialVariantKey: getInitialVariantKey(config) ?? null,
    defaultArgs: toFrameArgs(resolveVariantArgs(inferred, config, undefined)),
    variantArgs: Object.fromEntries(
      variants.map((variant) => [variant.key, toFrameArgs(resolveVariantArgs(inferred, config, variant.key))]),
    ),
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
  return { ...resolveVariantArgs(inferred, config, render.variantKey ?? undefined), ...render.args };
}
