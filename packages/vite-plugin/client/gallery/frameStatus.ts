import {
  FRAME_ERROR_MESSAGE_TYPE,
  FRAME_READY_MESSAGE_TYPE,
  type FrameArgValue,
  type FrameArgs,
  type FrameReadyMessage,
  type FrameToGalleryMessage,
} from "@vitrine/protocol";

/** Gallery가 아는 frame 상태 */
export interface FrameStatus {
  phase: "loading" | "ready" | "error";
  /** 마지막 frameReady, frame이 다시 떠도 다음 ready 전까지 유지 */
  ready: FrameReadyMessage | null;
  error: { message: string; stack?: string } | null;
  /** frame이 보고한 내용 높이(px), 보고 전에는 null */
  height: number | null;
}

export const INITIAL_FRAME_STATUS: FrameStatus = { phase: "loading", ready: null, error: null, height: null };

/** frame 메시지로 Gallery가 아는 frame 상태 갱신 */
export function reduceFrameStatus(status: FrameStatus, message: FrameToGalleryMessage): FrameStatus {
  switch (message.type) {
    case FRAME_READY_MESSAGE_TYPE:
      return { ...status, phase: "ready", ready: message, error: null };
    case FRAME_ERROR_MESSAGE_TYPE:
      return { ...status, phase: "error", error: { message: message.message, stack: message.stack } };
    default:
      return { ...status, height: message.height };
  }
}

/** Props 패널에서 바꾼 값을 frame으로 보낼 값으로 변환, 비운 값은 null, 보낼 수 없는 값은 undefined */
export function toOverrideValue(value: unknown): FrameArgValue | undefined {
  if (value === undefined) return null;
  if (typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return undefined;
}

/** 선택한 variant의 값 위에 사용자가 바꾼 값을 덮어 Props 패널에 보여줄 값 계산, 비운 값(null)은 undefined */
export function displayedArgs(
  ready: FrameReadyMessage,
  variantKey: string | null,
  overrides: FrameArgs,
): Record<string, unknown> {
  const base = variantKey ? (ready.variantArgs[variantKey] ?? {}) : ready.defaultArgs;
  const merged: Record<string, unknown> = { ...base, ...overrides };
  for (const [name, value] of Object.entries(merged)) {
    if (value === null) merged[name] = undefined;
  }
  return merged;
}
