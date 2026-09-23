import crypto from "node:crypto";
import {
  PREVIEW_SELECTED_MESSAGE_TYPE,
  SELECT_PREVIEW_MESSAGE_TYPE,
  SWITCH_PROJECT_MESSAGE_TYPE,
} from "@vitrine/protocol";

/** HTML 텍스트와 속성 값에 넣을 문자열 escape */
export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/** dev server gallery를 iframe으로 보여주는 webview HTML 생성 */
export function renderIframeHtml(galleryUrl: string, projectLabel: string): string {
  // CSP frame-src는 origin 단위로만 매칭
  const origin = new URL(galleryUrl).origin;
  return renderShell({
    projectLabel,
    extraCsp: `frame-src ${origin};`,
    body: `<iframe src="${escapeHtml(galleryUrl)}"></iframe>`,
    galleryOrigin: origin,
  });
}

/** dev server에 연결하지 못했을 때의 webview HTML 생성 */
export function renderUnreachableHtml(galleryUrl: string): string {
  return renderShell({
    projectLabel: null,
    body: `
      <div class="vitrine-message">
        <h2>Vite dev server not reachable</h2>
        <p>Vitrine expected a dev server at <code>${escapeHtml(galleryUrl)}</code> but couldn't reach it.</p>
        <p>Start your project's Vite dev server, then click <b>Switch Project</b> above.</p>
      </div>`,
  });
}

/** 실행 중인 dev server를 찾지 못했을 때의 webview HTML 생성 */
export function renderNotFoundHtml(): string {
  return renderShell({
    projectLabel: null,
    body: `
      <div class="vitrine-message">
        <h2>No Vitrine dev server detected</h2>
        <p>Start your project's Vite dev server (with <code>@vitrine/vite-plugin</code> configured),
        then click <b>Switch Project</b> above.</p>
      </div>`,
  });
}

function renderShell(options: {
  projectLabel: string | null;
  body: string;
  extraCsp?: string;
  /** 커서 동기화 메시지를 iframe에 중계할 대상 origin */
  galleryOrigin?: string;
}): string {
  const nonce = crypto.randomBytes(16).toString("hex");
  return `<!doctype html>
<html>
  <head>
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; ${options.extraCsp ?? ""} style-src 'unsafe-inline'; script-src 'nonce-${nonce}';">
    <style>
      html, body { height: 100%; margin: 0; padding: 0; }
      body {
        display: flex;
        flex-direction: column;
        font-family: system-ui, sans-serif;
        color: var(--vscode-foreground);
      }
      .vitrine-bar {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 4px 10px;
        background: var(--vscode-editorWidget-background);
        border-bottom: 1px solid var(--vscode-widget-border);
        font-size: 0.8rem;
        color: var(--vscode-descriptionForeground);
      }
      .vitrine-bar button {
        background: var(--vscode-button-background);
        color: var(--vscode-button-foreground);
        border: none;
        border-radius: 2px;
        padding: 3px 10px;
        cursor: pointer;
        font-size: 0.8rem;
      }
      .vitrine-bar button:hover { background: var(--vscode-button-hoverBackground); }
      .vitrine-content { flex: 1 1 auto; min-height: 0; }
      .vitrine-content iframe { width: 100%; height: 100%; border: 0; }
      .vitrine-message { padding: 2rem; color: var(--vscode-descriptionForeground); }
      code {
        background: var(--vscode-textCodeBlock-background);
        padding: 2px 6px;
        border-radius: 4px;
      }
    </style>
  </head>
  <body>
    <div class="vitrine-bar">
      <span>${escapeHtml(options.projectLabel ?? "No project detected")}</span>
      <button id="vitrine-switch-project">Switch Project</button>
    </div>
    <div class="vitrine-content">${options.body}</div>
    <script nonce="${nonce}">
      // 인라인 relay는 TS 검사 대상이 아니므로 protocol message type을 build 시 주입
      const vscodeApi = acquireVsCodeApi();
      const switchProjectMessageType = ${JSON.stringify(SWITCH_PROJECT_MESSAGE_TYPE)};
      const previewSelectedMessageType = ${JSON.stringify(PREVIEW_SELECTED_MESSAGE_TYPE)};
      const selectPreviewMessageType = ${JSON.stringify(SELECT_PREVIEW_MESSAGE_TYPE)};
      document.getElementById("vitrine-switch-project").addEventListener("click", () => {
        vscodeApi.postMessage({ type: switchProjectMessageType });
      });

      const galleryFrame = document.querySelector("iframe");
      const galleryOrigin = ${JSON.stringify(options.galleryOrigin ?? null)};
      window.addEventListener("message", (event) => {
        if (galleryFrame && event.source === galleryFrame.contentWindow) {
          if (event.data?.type === previewSelectedMessageType) vscodeApi.postMessage(event.data);
          return;
        }
        if (!galleryFrame || !galleryOrigin) return;
        if (event.data?.type !== selectPreviewMessageType) return;
        galleryFrame.contentWindow.postMessage(event.data, galleryOrigin);
      });
    </script>
  </body>
</html>`;
}
