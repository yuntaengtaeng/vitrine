import { isNonEmptyString, isRecord } from "./guards.js";

/** Gallery에서 지금 값을 variant로 저장, VS Code 확장이 편집을 적용 */
export const VARIANT_SAVE_CAPABILITY = "variant.save";

/** Gallery -> plugin: 저장할 variant의 편집 계산 요청 (POST, JSON) */
export const VARIANT_EDIT_ROUTE = "/__vitrine/variant-edit";

export const SAVE_VARIANT_MESSAGE_TYPE = "saveVariant";
export const SAVE_VARIANT_RESULT_MESSAGE_TYPE = "saveVariantResult";

/** 원본 문자열의 [start, end) 범위를 text로 바꿈, offset은 JS 문자열 index */
export interface TextEdit {
  start: number;
  end: number;
  text: string;
}

export interface VariantEditRequest {
  previewId: string;
  /** variant 표시 이름 */
  name: string;
  args: Record<string, string | number | boolean>;
}

export type VariantEditResponse =
  | {
      ok: true;
      /** 절대 경로 */
      file: string;
      /** 편집을 계산한 파일 내용의 SHA-256 hex, 확장은 버퍼가 같을 때만 적용 */
      contentHash: string;
      edits: TextEdit[];
      /** 새 variant의 key */
      key: string;
    }
  | { ok: false; reason: string };

/** Gallery -> Extension: plugin이 계산한 편집을 에디터 버퍼에 적용 요청 */
export interface SaveVariantMessage {
  type: typeof SAVE_VARIANT_MESSAGE_TYPE;
  file: string;
  contentHash: string;
  edits: TextEdit[];
  key: string;
}

/** Extension -> Gallery: 적용 결과, 실패하면 이유 */
export type SaveVariantResultMessage =
  | { type: typeof SAVE_VARIANT_RESULT_MESSAGE_TYPE; ok: true; key: string }
  | { type: typeof SAVE_VARIANT_RESULT_MESSAGE_TYPE; ok: false; reason: string };

function isTextEdit(value: unknown): value is TextEdit {
  return (
    isRecord(value) &&
    Number.isSafeInteger(value.start) &&
    Number.isSafeInteger(value.end) &&
    (value.start as number) >= 0 &&
    (value.end as number) >= (value.start as number) &&
    typeof value.text === "string"
  );
}

export function isVariantEditResponse(value: unknown): value is VariantEditResponse {
  if (!isRecord(value)) return false;
  if (value.ok === false) return typeof value.reason === "string";
  return (
    value.ok === true &&
    isNonEmptyString(value.file) &&
    isNonEmptyString(value.contentHash) &&
    Array.isArray(value.edits) &&
    value.edits.every(isTextEdit) &&
    isNonEmptyString(value.key)
  );
}

export function isSaveVariantMessage(value: unknown): value is SaveVariantMessage {
  return (
    isRecord(value) &&
    value.type === SAVE_VARIANT_MESSAGE_TYPE &&
    isNonEmptyString(value.file) &&
    isNonEmptyString(value.contentHash) &&
    Array.isArray(value.edits) &&
    value.edits.every(isTextEdit) &&
    isNonEmptyString(value.key)
  );
}

export function isSaveVariantResultMessage(value: unknown): value is SaveVariantResultMessage {
  if (!isRecord(value) || value.type !== SAVE_VARIANT_RESULT_MESSAGE_TYPE) return false;
  return value.ok === true ? isNonEmptyString(value.key) : value.ok === false && typeof value.reason === "string";
}
