import * as vscode from "vscode";
import crypto from "node:crypto";
import path from "node:path";
import {
  findPortFileUpward,
  findPortFilesInWorkspace,
  isProcessAlive,
  type PortFileMatch,
} from "./port-discovery.js";
import { findEntryAtLine, toProjectRelativeFile, type ManifestEntry } from "./preview-lookup.js";

const GALLERY_ROUTE = "/__vitrine";
const MANIFEST_ROUTE = "/__vitrine/manifest";
const SELECTION_DEBOUNCE_MS = 200;

/** 웹뷰 인라인 스크립트(renderShell)가 익스텐션으로 보내는 메시지 */
type WebviewToExtensionMessage =
  | { type: "switchProject" }
  | { type: "previewSelected"; id: string };

/** 익스텐션이 웹뷰로 보내는 메시지, renderShell의 인라인 스크립트가 받아 iframe까지 중계 */
type ExtensionToWebviewMessage = { type: "selectPreview"; id: string };

let currentPanel: vscode.WebviewPanel | undefined;
/** 패널이 지금 보여주는 프로젝트, 커서 추적이 프로젝트를 넘나들지 않도록 범위를 제한하는 데 사용 */
let currentMatch: PortFileMatch | null = null;
let lastSelectedPreviewId: string | null = null;
let selectionDebounce: ReturnType<typeof setTimeout> | undefined;
/** manifest fetch 도중 더 최신 커서 이벤트가 겹치는 경우 낡은 응답을 버리는 용도 */
let selectionRequestSeq = 0;

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("vitrine.open", () => openPreviewPanel(context)),
    vscode.window.onDidChangeTextEditorSelection((event) => {
      clearTimeout(selectionDebounce);
      selectionDebounce = setTimeout(() => void onSelectionChanged(event), SELECTION_DEBOUNCE_MS);
    }),
  );
}

export function deactivate() {}

async function openPreviewPanel(context: vscode.ExtensionContext) {
  if (currentPanel) {
    currentPanel.reveal(vscode.ViewColumn.Beside);
  } else {
    currentPanel = vscode.window.createWebviewPanel(
      "vitrine.preview",
      "Vitrine Preview",
      vscode.ViewColumn.Beside,
      { enableScripts: true, retainContextWhenHidden: true },
    );
    currentPanel.onDidDispose(() => {
      currentPanel = undefined;
    }, null, context.subscriptions);

    currentPanel.webview.onDidReceiveMessage((message: WebviewToExtensionMessage) => {
      if (message.type === "switchProject") void switchProject();
      // 갤러리 안에서 수동 클릭으로 프리뷰가 바뀐 경우, 커서 추적 상태를 실제 표시 중인
      // 프리뷰와 맞춰서 커서가 그 자리로 돌아왔을 때 재동기화가 스킵되지 않도록 함
      if (message.type === "previewSelected") lastSelectedPreviewId = message.id;
    }, null, context.subscriptions);
  }

  await renderPanel(await resolveDevServer());
}

/** 패널의 Switch Project 버튼 클릭 시, 활성 파일 무시하고 워크스페이스 전체에서 재선택 */
async function switchProject() {
  const match = await pickFromWorkspace();
  if (!match) {
    vscode.window.showInformationMessage("다른 실행 중인 dev 서버를 찾지 못함");
    return;
  }
  await renderPanel(match);
}

/** 활성 에디터 우선, 없거나 못 찾으면 워크스페이스 전체 스캔으로 폴백 */
async function resolveDevServer(): Promise<PortFileMatch | null> {
  const activeFile = vscode.window.activeTextEditor?.document.uri.fsPath;
  if (activeFile) {
    const match = findPortFileUpward(activeFile);
    if (match && isProcessAlive(match.pid)) return match;
  }
  return pickFromWorkspace();
}

/** 워크스페이스 전체 스캔, 다중 매칭 시 QuickPick으로 사용자 선택 */
async function pickFromWorkspace(): Promise<PortFileMatch | null> {
  const workspaceRoots = (vscode.workspace.workspaceFolders ?? []).map(
    (folder) => folder.uri.fsPath,
  );
  const candidates = findPortFilesInWorkspace(workspaceRoots).filter((candidate) =>
    isProcessAlive(candidate.pid),
  );

  if (candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0];

  const picked = await vscode.window.showQuickPick(
    candidates.map((candidate) => ({
      label: path.basename(candidate.root),
      description: `localhost:${candidate.port}`,
      candidate,
    })),
    { placeHolder: "미리볼 프로젝트 선택" },
  );
  return picked?.candidate ?? null;
}

async function renderPanel(match: PortFileMatch | null): Promise<void> {
  if (!currentPanel) return;

  currentMatch = match;
  lastSelectedPreviewId = null;

  if (!match) {
    currentPanel.webview.html = renderNotFoundHtml();
    return;
  }

  const devServerUrl = `http://localhost:${match.port}${GALLERY_ROUTE}`;
  const reachable = await isDevServerReachable(devServerUrl);
  currentPanel.webview.html = reachable
    ? renderIframeHtml(devServerUrl, match)
    : renderUnreachableHtml(devServerUrl);
}

/** 커서 이동 시, 패널이 보여주는 프로젝트 안의 @preview 위라면 그 프리뷰로 전환 신호 전송 */
async function onSelectionChanged(event: vscode.TextEditorSelectionChangeEvent): Promise<void> {
  if (!currentPanel || !currentMatch) return;

  const relFile = toProjectRelativeFile(
    currentMatch.root,
    event.textEditor.document.uri.fsPath,
  );
  if (!relFile) return; // 지금 패널이 보여주는 프로젝트 밖 파일, 무시

  const cursorLine = event.selections[0]?.active.line;
  if (cursorLine == null) return;

  const seq = ++selectionRequestSeq;
  const manifest = await fetchManifest(currentMatch.port);
  if (!manifest) return;
  // fetch 도중 패널이 닫히거나 더 최신 커서 이벤트가 먼저 반영된 경우 낡은 응답 폐기
  if (!currentPanel || seq !== selectionRequestSeq) return;

  const entry = findEntryAtLine(manifest, relFile, cursorLine + 1); // VS Code는 0-indexed, Babel loc은 1-indexed
  if (!entry || entry.id === lastSelectedPreviewId) return;

  lastSelectedPreviewId = entry.id;
  const message: ExtensionToWebviewMessage = { type: "selectPreview", id: entry.id };
  currentPanel.webview.postMessage(message);
}

async function fetchManifest(port: number): Promise<ManifestEntry[] | null> {
  try {
    const res = await fetch(`http://localhost:${port}${MANIFEST_ROUTE}`);
    if (!res.ok) return null;
    return (await res.json()) as ManifestEntry[];
  } catch {
    return null;
  }
}

async function isDevServerReachable(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

function renderIframeHtml(devServerUrl: string, match: PortFileMatch): string {
  // CSP frame-src는 origin 단위로만 매칭, path/query 포함 전체 URL은 iframe src에만 필요
  const origin = new URL(devServerUrl).origin;
  return renderShell({
    projectLabel: path.basename(match.root),
    extraCsp: `frame-src ${origin};`,
    body: `<iframe src="${devServerUrl}"></iframe>`,
    galleryOrigin: origin,
  });
}

function renderUnreachableHtml(devServerUrl: string): string {
  return renderShell({
    projectLabel: null,
    body: `
      <div class="vitrine-message">
        <h2>Vite dev server not reachable</h2>
        <p>Vitrine expected a dev server at <code>${devServerUrl}</code> but couldn't reach it.</p>
        <p>Start your project's Vite dev server, then click <b>Switch Project</b> above.</p>
      </div>`,
  });
}

function renderNotFoundHtml(): string {
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

/** 웹뷰 공통 셸: 상단 프로젝트 표시줄 + Switch Project 버튼, 본문은 각 렌더 함수가 채움 */
function renderShell(options: {
  projectLabel: string | null;
  body: string;
  extraCsp?: string;
  /** iframe이 있는 렌더(현재는 renderIframeHtml)에서만 전달, 커서 추적 메시지를 iframe에 중계할 때 씀 */
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
      <span>${options.projectLabel ?? "No project detected"}</span>
      <button id="vitrine-switch-project">Switch Project</button>
    </div>
    <div class="vitrine-content">${options.body}</div>
    <script nonce="${nonce}">
      // 이 인라인 스크립트는 문자열 템플릿이라 TS 타입 체크 대상이 아님, 위 파일의
      // WebviewToExtensionMessage/ExtensionToWebviewMessage가 여기서 다루는 메시지의 실제 계약
      const vscodeApi = acquireVsCodeApi();
      document.getElementById("vitrine-switch-project").addEventListener("click", () => {
        vscodeApi.postMessage({ type: "switchProject" });
      });

      const galleryFrame = document.querySelector("iframe");
      const galleryOrigin = ${JSON.stringify(options.galleryOrigin ?? null)};
      window.addEventListener("message", (event) => {
        if (galleryFrame && event.source === galleryFrame.contentWindow) {
          if (event.data?.type === "previewSelected") vscodeApi.postMessage(event.data);
          return;
        }
        if (!galleryFrame || !galleryOrigin) return;
        if (event.data?.type !== "selectPreview") return;
        galleryFrame.contentWindow.postMessage(event.data, galleryOrigin);
      });
    </script>
  </body>
</html>`;
}
