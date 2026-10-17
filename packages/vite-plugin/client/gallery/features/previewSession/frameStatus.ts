import {
  FRAME_ACTION_MESSAGE_TYPE,
  FRAME_ERROR_MESSAGE_TYPE,
  FRAME_READY_MESSAGE_TYPE,
  FRAME_SIZE_MESSAGE_TYPE,
  type FrameActionMessage,
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
  /** 오래된 것부터 최근 MAX_ACTIONS개 */
  actions: Omit<FrameActionMessage, "type">[];
}

// 오래 켜 둔 프리뷰에서 기록이 끝없이 쌓이지 않도록 최근 것만 보관
export const MAX_ACTIONS = 100;

export const CLEAR_ACTIONS = { type: "clearActions" } as const;

export const INITIAL_FRAME_STATUS: FrameStatus = { phase: "loading", ready: null, error: null, height: null, actions: [] };

/** frame 메시지와 Actions 지우기로 Gallery가 아는 frame 상태 갱신 */
export function reduceFrameStatus(status: FrameStatus, message: FrameToGalleryMessage | typeof CLEAR_ACTIONS): FrameStatus {
  switch (message.type) {
    case FRAME_READY_MESSAGE_TYPE:
      return { ...status, phase: "ready", ready: message, error: null };
    case FRAME_ERROR_MESSAGE_TYPE:
      return { ...status, phase: "error", error: { message: message.message, stack: message.stack } };
    case FRAME_SIZE_MESSAGE_TYPE:
      return { ...status, height: message.height };
    case FRAME_ACTION_MESSAGE_TYPE: {
      const call = { name: message.name, args: message.args, at: message.at };
      return { ...status, actions: [...status.actions, call].slice(-MAX_ACTIONS) };
    }
    case CLEAR_ACTIONS.type:
      return { ...status, actions: [] };
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

/** 링크로 요청한 variant가 이 프리뷰에 없으면 frame이 고른 초기 variant로 시작 */
export function startingSelection(
  ready: FrameReadyMessage,
  requested: { variantKey: string | null; args: FrameArgs } | undefined,
): { variantKey: string | null; args: FrameArgs } {
  if (!requested) return { variantKey: ready.initialVariantKey, args: {} };
  const known = requested.variantKey !== null && ready.variants.some((variant) => variant.key === requested.variantKey);
  return { variantKey: known ? requested.variantKey : ready.initialVariantKey, args: requested.args };
}
