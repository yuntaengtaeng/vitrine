import { OPEN_IN_EDITOR_ROUTE } from "@vitrine/protocol";

type FrameWindow = { self: unknown; top: unknown };

/** 다른 페이지(VS Code webview 등)에 iframe으로 들어가 있는지 판단, top 접근이 막혀도 embedded로 봄 */
export function isEmbeddedInFrame(win: FrameWindow): boolean {
  try {
    return win.self !== win.top;
  } catch {
    return true;
  }
}

/** preview id의 소스를 에디터로 여는 dev server 요청 URL 생성 */
export function openInEditorUrl(previewId: string): string {
  return `${OPEN_IN_EDITOR_ROUTE}?id=${encodeURIComponent(previewId)}`;
}

/** preview id의 소스를 에디터로 열도록 dev server에 요청, 서버가 꺼져 있어도 Gallery에 오류를 남기지 않음 */
export function openInEditor(previewId: string): void {
  fetch(openInEditorUrl(previewId)).catch(() => undefined);
}
