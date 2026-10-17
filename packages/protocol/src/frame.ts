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

/** Frame과 주고받을 수 있는 prop 값 (control로 편집 가능한 값만), null은 선택 prop을 비운 상태 */
export type FrameArgValue = string | number | boolean | null;

/** Prop 이름별 frame 전송 값 */
export type FrameArgs = Record<string, FrameArgValue>;

/** preview() override를 반영해 frame이 Gallery에 알리는 control */
export interface FrameControl {
  type: PropControl["type"] | "radio";
  options?: ControlOption[];
  optional: boolean;
  defaultValue?: string | number | boolean;
}

/** Gallery에서 고를 수 있는 variant */
export interface FrameVariant {
  key: string;
  name: string;
}

/** setup file이 선언한 global 하나 (ADR 009) */
export interface FrameGlobal {
  label: string;
  options: string[];
  defaultValue: string;
}

/** global 이름별 값 */
export type FrameGlobalValues = Record<string, string>;

/** 격자 보기의 칸 하나, 칸마다 variant와 바꾼 값을 따로 가짐 */
export interface FrameGridCell {
  key: string;
  label: string;
  variantKey: string | null;
  args: FrameArgs;
}

/** Frame 안 렌더링 배치, single은 메시지의 variantKey와 args로 하나만 그림 */
export type FrameLayout = { kind: "single" } | { kind: "grid"; cells: FrameGridCell[] };

/** Gallery -> Frame: 지금 그릴 상태 전체, 마지막 메시지가 이김 */
export interface FrameRenderMessage {
  type: typeof FRAME_RENDER_MESSAGE_TYPE;
  protocol: number;
  /** 선택한 variant, 없으면 variant 없이 preview() args만 사용 */
  variantKey: string | null;
  /** 사용자가 Gallery에서 바꾼 값만 */
  args: FrameArgs;
  layout: FrameLayout;
  /** Gallery toolbar에서 고른 globals, preview()와 variant 고정값이 이김 */
  globals: FrameGlobalValues;
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
  /** 프리뷰 컴포넌트의 이름, displayName이 있으면 그 값 */
  componentName: string;
  /** variant를 고르지 않았을 때 함수나 JSX라 Gallery로 보내지 못한 prop 이름 */
  defaultFrameOnlyArgs: string[];
  /** variant별로 함수나 JSX라 Gallery로 보내지 못한 prop 이름 */
  variantFrameOnlyArgs: Record<string, string[]>;
  /** setup file이 선언한 globals */
  globals: Record<string, FrameGlobal>;
  /** variant를 고르지 않았을 때 preview()가 고정한 globals */
  defaultFixedGlobals: FrameGlobalValues;
  /** variant별로 preview()와 variant가 고정한 globals */
  variantFixedGlobals: Record<string, FrameGlobalValues>;
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
    isFrameLayout(value.layout) &&
    isGlobalValues(value.globals)
  );
}

function isFrameLayout(value: unknown): value is FrameLayout {
  if (!isRecord(value)) return false;
  if (value.kind === "single") return true;
  return value.kind === "grid" && Array.isArray(value.cells) && value.cells.every(isFrameGridCell);
}

function isFrameGridCell(value: unknown): value is FrameGridCell {
  return (
    isRecord(value) &&
    isNonEmptyString(value.key) &&
    typeof value.label === "string" &&
    (value.variantKey === null || isNonEmptyString(value.variantKey)) &&
    isFrameArgs(value.args)
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
    Object.values(value.variantArgs).every(isFrameArgs) &&
    isNonEmptyString(value.componentName) &&
    isNameList(value.defaultFrameOnlyArgs) &&
    isRecord(value.variantFrameOnlyArgs) &&
    Object.values(value.variantFrameOnlyArgs).every(isNameList) &&
    isRecord(value.globals) &&
    Object.values(value.globals).every(isFrameGlobal) &&
    isGlobalValues(value.defaultFixedGlobals) &&
    isRecord(value.variantFixedGlobals) &&
    Object.values(value.variantFixedGlobals).every(isGlobalValues)
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
  return isRecord(value) && Object.values(value).every((arg) => arg === null || isDefaultValue(arg));
}

function isNameList(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((name) => typeof name === "string");
}

function isFrameGlobal(value: unknown): value is FrameGlobal {
  return (
    isRecord(value) &&
    typeof value.label === "string" &&
    isNameList(value.options) &&
    value.options.length > 0 &&
    typeof value.defaultValue === "string" &&
    value.options.includes(value.defaultValue)
  );
}

function isGlobalValues(value: unknown): value is FrameGlobalValues {
  return isRecord(value) && Object.values(value).every((item) => typeof item === "string");
}

/**
 * frame이 wrapper에 넘길 globals 계산, 선언 기본값, 고른 값, 고정값 순으로 덮어씀 (ADR 009)
 * 선언에 없는 이름과 선택지 밖의 값은 버림
 * @param declared setup file이 선언한 globals
 * @param chosen Gallery toolbar에서 고른 값
 * @param fixed preview()와 variant가 고정한 값
 */
export function resolveGlobals(
  declared: Record<string, FrameGlobal>,
  chosen: FrameGlobalValues,
  fixed: FrameGlobalValues,
): FrameGlobalValues {
  return Object.fromEntries(
    Object.entries(declared).map(([name, global]) => {
      const pick = [fixed[name], chosen[name]].find((value) => value !== undefined && global.options.includes(value));
      return [name, pick ?? global.defaultValue];
    }),
  );
}
