import * as vscode from "vscode";

let currentPanel: vscode.WebviewPanel | undefined;

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("vitrine.open", () => openPreviewPanel(context)),
  );
}

export function deactivate() {}

async function openPreviewPanel(context: vscode.ExtensionContext) {
  const devServerUrl = vscode.workspace
    .getConfiguration("vitrine")
    .get<string>("devServerUrl", "http://localhost:5173/__vitrine");

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
  }

  const reachable = await isDevServerReachable(devServerUrl);
  currentPanel.webview.html = reachable
    ? renderIframeHtml(devServerUrl)
    : renderUnreachableHtml(devServerUrl);
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

function renderIframeHtml(devServerUrl: string): string {
  // CSP frame-src는 origin 단위로만 매칭, path/query 포함 전체 URL은 iframe src에만 필요
  const origin = new URL(devServerUrl).origin;
  return `<!doctype html>
<html>
  <head>
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; frame-src ${origin}; style-src 'unsafe-inline';">
    <style>html, body, iframe { height: 100%; width: 100%; margin: 0; border: 0; padding: 0; }</style>
  </head>
  <body>
    <iframe src="${devServerUrl}"></iframe>
  </body>
</html>`;
}

function renderUnreachableHtml(devServerUrl: string): string {
  return `<!doctype html>
<html>
  <head>
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline';">
    <style>
      body { font-family: system-ui, sans-serif; padding: 2rem; color: #888; }
      code { background: #eee; padding: 2px 6px; border-radius: 4px; }
    </style>
  </head>
  <body>
    <h2>Vite dev server not reachable</h2>
    <p>Vitrine expected a dev server at <code>${devServerUrl}</code> but couldn't reach it.</p>
    <p>Start your project's Vite dev server, then run <b>Vitrine: Open Preview</b> again.</p>
  </body>
</html>`;
}
