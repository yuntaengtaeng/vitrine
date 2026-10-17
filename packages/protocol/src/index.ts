import {
  isControlOption,
  isDefaultValue,
  isNonEmptyString,
  isPort,
  isPositiveSafeInteger,
  isRecord,
} from "./guards.js";
import {
  CAPABILITIES_REQUEST_MESSAGE_TYPE,
  CAPABILITIES_RESPONSE_MESSAGE_TYPE,
  THEME_CHANGED_MESSAGE_TYPE,
  isCapabilitiesRequestMessage,
  isCapabilitiesResponseMessage,
  isThemeChangedMessage,
  type CapabilitiesRequestMessage,
  type CapabilitiesResponseMessage,
  type ThemeChangedMessage,
} from "./capabilities.js";

/** Standalone Gallery HTTP 경로 */
export const GALLERY_ROUTE = "/__vitrine";

/** 프리뷰 manifest HTTP 경로 */
export const MANIFEST_ROUTE = "/__vitrine/manifest";

/** 프리뷰 id의 소스 위치를 에디터로 여는 HTTP 경로 (`?id=` query) */
export const OPEN_IN_EDITOR_ROUTE = "/__vitrine/open-in-editor";

/** 프리뷰 목록 virtual module 식별자 */
export const PREVIEWS_MODULE_ID = "virtual:vitrine-previews";

/** Plugin 옵션을 반영한 Gallery 설정 virtual module 식별자 */
export const GALLERY_CONFIG_MODULE_ID = "virtual:vitrine-gallery-config";

/** 무대 iframe 너비 프리셋 */
export interface GalleryViewport {
  name: string;
  /** px */
  width: number;
}

/** Gallery 설정 virtual module의 default export */
export interface GalleryConfig {
  /** Responsive(무대 전체 너비) 외에 고를 수 있는 viewport */
  viewports: GalleryViewport[];
  /** 스캔에 실제로 쓰는 glob 패턴, Vite root 기준 */
  include: string[];
}

/** Gallery client virtual module 식별자 */
export const GALLERY_MODULE_ID = "virtual:vitrine-preview-gallery";

/** 실패한 setup module 복구를 Gallery에만 알리는 Vite HMR custom event 이름 */
export const PREVIEW_SETUP_RECOVER_EVENT = "vitrine:setup-recover";

/** Vitrine runtime 파일 디렉터리 이름 */
export const PORT_FILE_DIRECTORY = ".vitrine";

/** Vite dev server 포트 파일 이름 */
export const PORT_FILE_NAME = "port.json";

/** Gallery에서 선택 가능한 control option */
export type ControlOption = string | number;

/** Manifest로 전달되는 단일 prop control 계약 */
export interface PropControl {
  type: "text" | "number" | "boolean" | "select";
  options?: ControlOption[];
  optional: boolean;
  defaultValue?: string | number | boolean;
}

/** Manifest로 전달되는 prop별 control 계약 */
export type PropControls = Record<string, PropControl>;

/** Runtime 사이에 전송되는 프리뷰 manifest entry */
export interface ManifestEntry {
  id: string;
  name: string;
  group?: string;
  file: string;
  exportName: string;
  startLine: number;
  endLine: number;
  controls: PropControls;
}

/**
 * Plugin이 프리뷰 목록 virtual module로 Gallery에 넘기는 entry 필드
 * 줄 번호를 빼야 export 위 코드가 밀려도 module 내용이 그대로라 Gallery 전체 reload가 생기지 않음
 */
export type GalleryEntryData = Pick<ManifestEntry, "id" | "name" | "group" | "file" | "exportName" | "controls">;

/** Runtime 사이에 전송되는 프리뷰 manifest */
export type Manifest = ManifestEntry[];

/** Vite dev server port file wire data */
export interface PortFileData {
  port: number;
  pid: number;
}

/** 프로젝트 재선택 요청 message type */
export const SWITCH_PROJECT_MESSAGE_TYPE = "switchProject";

/** Gallery 선택 변경 알림 message type */
export const PREVIEW_SELECTED_MESSAGE_TYPE = "previewSelected";

/** Gallery 선택 변경 요청 message type */
export const SELECT_PREVIEW_MESSAGE_TYPE = "selectPreview";

const CONTROL_TYPES = new Set<string>(["text", "number", "boolean", "select"]);

/** Webview에서 Extension으로 보내는 프로젝트 재선택 요청 */
export interface SwitchProjectMessage {
  type: typeof SWITCH_PROJECT_MESSAGE_TYPE;
}

/** Gallery에서 Extension으로 보내는 선택 변경 알림 */
export interface PreviewSelectedMessage {
  type: typeof PREVIEW_SELECTED_MESSAGE_TYPE;
  id: string;
}

/** Extension에서 Gallery로 보내는 선택 변경 요청 */
export interface SelectPreviewMessage {
  type: typeof SELECT_PREVIEW_MESSAGE_TYPE;
  id: string;
}

/** Webview에서 Extension으로 전달 가능한 message */
export type WebviewToExtensionMessage = SwitchProjectMessage | GalleryToExtensionMessage;

/** Extension에서 Gallery로 전달 가능한 message */
export type ExtensionToGalleryMessage = SelectPreviewMessage | CapabilitiesResponseMessage | ThemeChangedMessage;

/** Gallery에서 Extension으로 전달 가능한 message */
export type GalleryToExtensionMessage = PreviewSelectedMessage | CapabilitiesRequestMessage;

/** webview relay가 Gallery에서 Extension으로 넘기는 type, 목록에 없으면 버림 */
export const GALLERY_TO_EXTENSION_RELAY_TYPES = [PREVIEW_SELECTED_MESSAGE_TYPE, CAPABILITIES_REQUEST_MESSAGE_TYPE];

/** webview relay가 Extension에서 Gallery로 넘기는 type, 목록에 없으면 버림 */
export const EXTENSION_TO_GALLERY_RELAY_TYPES = [
  SELECT_PREVIEW_MESSAGE_TYPE,
  CAPABILITIES_RESPONSE_MESSAGE_TYPE,
  THEME_CHANGED_MESSAGE_TYPE,
];

/**
 * 외부 값의 프리뷰 manifest 계약 일치 판단
 * @param value 검사 대상 외부 값
 */
export function isManifest(value: unknown): value is Manifest {
  return Array.isArray(value) && value.every(isManifestEntry);
}

/**
 * 외부 값의 Vite dev server port file 계약 일치 판단
 * @param value 검사 대상 외부 값
 */
export function isPortFileData(value: unknown): value is PortFileData {
  if (!isRecord(value)) return false;
  return isPort(value.port) && isPositiveSafeInteger(value.pid);
}

/**
 * 외부 값의 Webview -> Extension message 계약 일치 판단
 * @param value 검사 대상 외부 값
 */
export function isWebviewToExtensionMessage(
  value: unknown,
): value is WebviewToExtensionMessage {
  if (!isRecord(value)) return false;
  if (value.type === SWITCH_PROJECT_MESSAGE_TYPE) return true;
  if (isCapabilitiesRequestMessage(value)) return true;
  return value.type === PREVIEW_SELECTED_MESSAGE_TYPE && isNonEmptyString(value.id);
}

/**
 * 외부 값의 Extension -> Gallery message 계약 일치 판단
 * @param value 검사 대상 외부 값
 */
export function isExtensionToGalleryMessage(
  value: unknown,
): value is ExtensionToGalleryMessage {
  if (isCapabilitiesResponseMessage(value) || isThemeChangedMessage(value)) return true;
  return (
    isRecord(value) &&
    value.type === SELECT_PREVIEW_MESSAGE_TYPE &&
    isNonEmptyString(value.id)
  );
}

function isManifestEntry(value: unknown): value is ManifestEntry {
  if (!isRecord(value)) return false;
  if (
    !isNonEmptyString(value.id) ||
    !isNonEmptyString(value.name) ||
    (value.group !== undefined && typeof value.group !== "string") ||
    !isNonEmptyString(value.file) ||
    !isNonEmptyString(value.exportName) ||
    !isPositiveSafeInteger(value.startLine) ||
    !isPositiveSafeInteger(value.endLine) ||
    value.startLine > value.endLine ||
    !isRecord(value.controls)
  ) {
    return false;
  }
  return Object.values(value.controls).every(isPropControl);
}

function isPropControl(value: unknown): value is PropControl {
  if (!isRecord(value) || typeof value.optional !== "boolean") return false;
  if (typeof value.type !== "string" || !CONTROL_TYPES.has(value.type)) return false;
  if (
    value.options !== undefined &&
    (!Array.isArray(value.options) || !value.options.every(isControlOption))
  ) {
    return false;
  }
  return value.defaultValue === undefined || isDefaultValue(value.defaultValue);
}

export * from "./frame.js";
export * from "./capabilities.js";
