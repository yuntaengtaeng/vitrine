import type { LoadedPreview } from "../preview/previewConfig";

export type CanvasView =
  | { kind: "error"; error: Error }
  | { kind: "loading" }
  | { kind: "ready"; preview: LoadedPreview };

/** setup file과 프리뷰 모듈의 상태로 무대에 보여줄 화면 판단, setup 에러가 모듈 에러보다 우선 */
export function resolveCanvasView(input: {
  setupError: Error | null;
  setupLoading: boolean;
  loadError: Error | null;
  preview: LoadedPreview | null;
}): CanvasView {
  const error = input.setupError ?? input.loadError;
  if (error) return { kind: "error", error };
  if (input.setupLoading || !input.preview) return { kind: "loading" };
  return { kind: "ready", preview: input.preview };
}
