import * as vscode from "vscode";
import path from "node:path";
import {
  GALLERY_ROUTE,
  MANIFEST_ROUTE,
  PREVIEW_SELECTED_MESSAGE_TYPE,
  SELECT_PREVIEW_MESSAGE_TYPE,
  SWITCH_PROJECT_MESSAGE_TYPE,
  isManifest,
  isWebviewToExtensionMessage,
  type ExtensionToGalleryMessage,
  type Manifest,
} from "@vitrine/protocol";
import {
  findPortFileUpward,
  findPortFilesInWorkspace,
  isProcessAlive,
  type PortFileMatch,
} from "./port-discovery.js";
import { resolveCursorPreviewId, toProjectRelativeFile } from "./preview-lookup.js";
import { renderIframeHtml, renderNotFoundHtml, renderUnreachableHtml } from "./webview-html.js";

const SELECTION_DEBOUNCE_MS = 200;

let currentPanel: vscode.WebviewPanel | undefined;
/** 패널이 보여주는 프로젝트, 커서 추적 범위를 이 프로젝트로 제한 */
let currentMatch: PortFileMatch | null = null;
let lastSelectedPreviewId: string | null = null;
let selectionDebounce: ReturnType<typeof setTimeout> | undefined;
/** 늦게 도착한 manifest 응답을 버리기 위한 요청 순번 */
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

    currentPanel.webview.onDidReceiveMessage((message: unknown) => {
      if (!isWebviewToExtensionMessage(message)) return;
      if (message.type === SWITCH_PROJECT_MESSAGE_TYPE) void switchProject();
      // 갤러리에서 직접 고른 프리뷰도 기록해야 커서가 돌아왔을 때 다시 동기화됨
      if (message.type === PREVIEW_SELECTED_MESSAGE_TYPE) lastSelectedPreviewId = message.id;
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

  const galleryUrl = `http://localhost:${match.port}${GALLERY_ROUTE}`;
  const reachable = await isDevServerReachable(galleryUrl);
  currentPanel.webview.html = reachable
    ? renderIframeHtml(galleryUrl, path.basename(match.root))
    : renderUnreachableHtml(galleryUrl);
}

/** 커서 이동 시, 패널이 보여주는 프로젝트 안의 @preview 위라면 그 프리뷰로 전환 신호 전송 */
async function onSelectionChanged(event: vscode.TextEditorSelectionChangeEvent): Promise<void> {
  if (!currentPanel || !currentMatch) return;

  const relFile = toProjectRelativeFile(currentMatch.root, event.textEditor.document.uri.fsPath);
  if (!relFile) return;

  const cursorLine = event.selections[0]?.active.line;
  if (cursorLine == null) return;

  const seq = ++selectionRequestSeq;
  const manifest = await fetchManifest(currentMatch.port);
  if (!manifest) return;
  if (!currentPanel || seq !== selectionRequestSeq) return;

  const previewId = resolveCursorPreviewId({
    manifest,
    relFile,
    cursorLine,
    lastSelectedId: lastSelectedPreviewId,
  });
  if (!previewId) return;

  lastSelectedPreviewId = previewId;
  const message: ExtensionToGalleryMessage = {
    type: SELECT_PREVIEW_MESSAGE_TYPE,
    id: previewId,
  };
  currentPanel.webview.postMessage(message);
}

async function fetchManifest(port: number): Promise<Manifest | null> {
  try {
    const res = await fetch(`http://localhost:${port}${MANIFEST_ROUTE}`);
    if (!res.ok) return null;
    const data: unknown = await res.json();
    return isManifest(data) ? data : null;
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
