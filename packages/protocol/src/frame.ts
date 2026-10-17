import { isControlOption, isDefaultValue, isNonEmptyString, isRecord } from "./guards.js";
import type { ControlOption, PropControl } from "./index.js";

/** Gallery가 iframe으로 띄우는 프리뷰 렌더링 페이지 HTTP 경로 (`?id=` query) */
export const FRAME_ROUTE = "/__vitrine/frame";

/** Frame renderer virtual module 식별자 */
export const FRAME_MODULE_ID = "virtual:vitrine-preview-frame";

/** Gallery와 frame 사이 메시지 형식 버전, 형식이 깨지는 변경에만 올림 */
export const FRAME_PROTOCOL = 1;

/** Gallery가 frame에 그릴 상태를 보내는 message type */
export const FRAME_RENDER_MESSAGE_TYPE = "frameRender";

/** Frame이 렌더링 준비와 프리뷰 정보를 알리는 message type */
export const FRAME_READY_MESSAGE_TYPE = "frameReady";

/** Frame이 렌더링된 내용 높이를 알리는 message type */
export const FRAME_SIZE_MESSAGE_TYPE = "frameSize";

/** Frame이 로드나 렌더 실패를 알리는 message type */
export const FRAME_ERROR_MESSAGE_TYPE = "frameError";

/** Frame과 주고받을 수 있는 prop 값 (control로 편집 가능한 값만) */
export type FrameArgValue = string | number | boolean;

/** Prop 이름별 frame 전송 값 */
export type FrameArgs = Record<string, FrameArgValue>;

/** preview() override를 반영해 frame이 Gallery에 알리는 control */
export interface FrameControl {
  type: PropControl["type"] | "radio";
  options?: ControlOption[];
  optional: boolean;
  defaultValue?: FrameArgValue;
}

/** Gallery에서 고를 수 있는 variant */
export interface FrameVariant {
  key: string;
  name: string;
}

/** Frame 안 렌더링 배치 */
export type FrameLayout = { kind: "single" };

/** Gallery -> Frame: 지금 그릴 상태 전체, 마지막 메시지가 이김 */
export interface FrameRenderMessage {
  type: typeof FRAME_RENDER_MESSAGE_TYPE;
  protocol: number;
  /** 선택한 variant, 없으면 variant 없이 preview() args만 사용 */
  variantKey: string | null;
  /** 사용자가 Gallery에서 바꾼 값만 */
  args: FrameArgs;
  layout: FrameLayout;
}

/** Frame -> Gallery: 프리뷰를 그릴 준비가 되었고 Gallery가 보여줄 정보 */
export interface FrameReadyMessage {
  type: typeof FRAME_READY_MESSAGE_TYPE;
  protocol: number;
  controls: Record<string, FrameControl>;
  variants: FrameVariant[];
  initialVariantKey: string | null;
  /** variant를 고르지 않았을 때의 직렬화 가능한 args */
  defaultArgs: FrameArgs;
  /** variant별 직렬화 가능한 args, 함수와 JSX 값은 frame에만 남음 */
  variantArgs: Record<string, FrameArgs>;
}

/** Frame -> Gallery: 렌더링된 내용 높이(px) */
export interface FrameSizeMessage {
  type: typeof FRAME_SIZE_MESSAGE_TYPE;
  height: number;
}

/** Frame -> Gallery: 프리뷰 로드나 렌더 실패 */
export interface FrameErrorMessage {
  type: typeof FRAME_ERROR_MESSAGE_TYPE;
  message: string;
  stack?: string;
}

/** Gallery에서 frame으로 보내는 message */
export type GalleryToFrameMessage = FrameRenderMessage;

/** Frame에서 Gallery로 보내는 message */
export type FrameToGalleryMessage = FrameReadyMessage | FrameSizeMessage | FrameErrorMessage;

const FRAME_CONTROL_TYPES = new Set<string>(["text", "number", "boolean", "select", "radio"]);

/**
 * 외부 값의 Gallery -> Frame message 계약 일치 판단
 * @param value 검사 대상 외부 값
 */
export function isGalleryToFrameMessage(value: unknown): value is GalleryToFrameMessage {
  if (!isRecord(value) || value.type !== FRAME_RENDER_MESSAGE_TYPE) return false;
  return (
    value.protocol === FRAME_PROTOCOL &&
    (value.variantKey === null || isNonEmptyString(value.variantKey)) &&
    isFrameArgs(value.args) &&
    isRecord(value.layout) &&
    value.layout.kind === "single"
  );
}

/**
 * 외부 값의 Frame -> Gallery message 계약 일치 판단
 * @param value 검사 대상 외부 값
 */
export function isFrameToGalleryMessage(value: unknown): value is FrameToGalleryMessage {
  if (!isRecord(value)) return false;
  switch (value.type) {
    case FRAME_READY_MESSAGE_TYPE:
      return isFrameReady(value);
    case FRAME_SIZE_MESSAGE_TYPE:
      return typeof value.height === "number" && Number.isFinite(value.height) && value.height >= 0;
    case FRAME_ERROR_MESSAGE_TYPE:
      return typeof value.message === "string" && (value.stack === undefined || typeof value.stack === "string");
    default:
      return false;
  }
}

function isFrameReady(value: Record<string, unknown>): boolean {
  return (
    value.protocol === FRAME_PROTOCOL &&
    isRecord(value.controls) &&
    Object.values(value.controls).every(isFrameControl) &&
    Array.isArray(value.variants) &&
    value.variants.every(isFrameVariant) &&
    (value.initialVariantKey === null || isNonEmptyString(value.initialVariantKey)) &&
    isFrameArgs(value.defaultArgs) &&
    isRecord(value.variantArgs) &&
    Object.values(value.variantArgs).every(isFrameArgs)
  );
}

function isFrameControl(value: unknown): value is FrameControl {
  if (!isRecord(value) || typeof value.optional !== "boolean") return false;
  if (typeof value.type !== "string" || !FRAME_CONTROL_TYPES.has(value.type)) return false;
  if (value.options !== undefined && (!Array.isArray(value.options) || !value.options.every(isControlOption))) {
    return false;
  }
  return value.defaultValue === undefined || isDefaultValue(value.defaultValue);
}

function isFrameVariant(value: unknown): value is FrameVariant {
  return isRecord(value) && isNonEmptyString(value.key) && typeof value.name === "string";
}

function isFrameArgs(value: unknown): value is FrameArgs {
  return isRecord(value) && Object.values(value).every(isDefaultValue);
}
