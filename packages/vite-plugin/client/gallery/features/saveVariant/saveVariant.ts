import {
  SAVE_VARIANT_MESSAGE_TYPE,
  VARIANT_EDIT_ROUTE,
  isSaveVariantResultMessage,
  isVariantEditResponse,
  type SaveVariantMessage,
  type VariantEditRequest,
} from "@vitrine/protocol";

// 확장은 파일을 열고 저장까지 하므로 넉넉히 기다리되, 옛 확장처럼 답이 없으면 끊음
const RESULT_TIMEOUT_MS = 10_000;

export type SaveVariantOutcome = { ok: true; key: string } | { ok: false; reason: string };

/** variant로 저장할 수 있는 값만, 함수와 JSX와 비운 값은 소스에 쓸 수 없음 */
export function savableArgs(args: Record<string, unknown>): VariantEditRequest["args"] {
  return Object.fromEntries(
    Object.entries(args).filter(
      ([, value]) =>
        typeof value === "string" || typeof value === "boolean" || (typeof value === "number" && Number.isFinite(value)),
    ),
  ) as VariantEditRequest["args"];
}

function waitForResult(): Promise<SaveVariantOutcome> {
  return new Promise((resolve) => {
    const finish = (outcome: SaveVariantOutcome) => {
      window.removeEventListener("message", handleMessage);
      clearTimeout(timer);
      resolve(outcome);
    };
    const handleMessage = (event: MessageEvent) => {
      if (event.source !== window.parent || !isSaveVariantResultMessage(event.data)) return;
      finish(event.data.ok ? { ok: true, key: event.data.key } : { ok: false, reason: event.data.reason });
    };
    const timer = setTimeout(() => finish({ ok: false, reason: "VS Code did not answer" }), RESULT_TIMEOUT_MS);
    window.addEventListener("message", handleMessage);
  });
}

/** plugin이 편집을 계산하고 VS Code 확장이 버퍼에 적용 (ADR 006, variant.save) */
export async function saveVariant(request: VariantEditRequest): Promise<SaveVariantOutcome> {
  let response: unknown;
  try {
    response = await (await fetch(VARIANT_EDIT_ROUTE, { method: "POST", body: JSON.stringify(request) })).json();
  } catch {
    return { ok: false, reason: "The dev server did not answer" };
  }
  if (!isVariantEditResponse(response)) return { ok: false, reason: "The dev server sent an unexpected answer" };
  if (!response.ok) return response;
  const result = waitForResult();
  const message: SaveVariantMessage = {
    type: SAVE_VARIANT_MESSAGE_TYPE,
    file: response.file,
    contentHash: response.contentHash,
    edits: response.edits,
    key: response.key,
  };
  window.parent.postMessage(message, "*");
  return result;
}
