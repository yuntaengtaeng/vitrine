import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { PREVIEW_SETUP_RECOVER_EVENT, PREVIEWS_MODULE_ID } from "@vitrine/protocol";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createServer, type Plugin, type ViteDevServer } from "vite";
import vitrine from "./index.js";

const PREVIEWS_URL = `/@id/__x00__${PREVIEWS_MODULE_ID}`;
const SETUP_IMPORT = /loadPreviewSetup = \(\) => import\("([^"]+)"\)/;

const delay = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

const waitFor = async (condition: () => boolean, label: string) => {
  for (let attempt = 0; attempt < 250; attempt += 1) {
    if (condition()) return;
    await delay(20);
  }
  throw new Error(`timed out waiting for ${label}`);
};

/** 실제 dev server에서 setupFile 누락, 생성, 삭제, 오류 복구 흐름 검증 */
describe("preview setup Vite integration", () => {
  let root: string | undefined;
  let server: ViteDevServer | undefined;

  afterEach(async () => {
    await server?.close();
    server = undefined;
    if (root) fs.rmSync(root, { recursive: true, force: true });
    root = undefined;
  });

  const startServer = async (setupFile: string, files: Record<string, string> = {}) => {
    const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), "vitrine-setup-test-"));
    root = projectRoot;
    fs.mkdirSync(path.join(projectRoot, "src"));
    for (const [file, source] of Object.entries(files)) {
      fs.writeFileSync(path.join(projectRoot, file), source);
    }

    // vitrine 다음 순서의 handleHotUpdate 호출을 HMR 처리 완료 시점으로 사용
    const hotUpdatedFiles: string[] = [];
    const hotUpdateRecorder: Plugin = {
      name: "hot-update-recorder",
      handleHotUpdate({ file }) {
        hotUpdatedFiles.push(path.resolve(file));
      },
    };
    const devServer = await createServer({
      root: projectRoot,
      configFile: false,
      logLevel: "silent",
      plugins: [vitrine({ include: [], setupFile }), hotUpdateRecorder],
      server: { host: "127.0.0.1", port: 0, strictPort: true },
    });
    server = devServer;
    const send = vi.spyOn(devServer.ws, "send");
    await devServer.listen();
    const sourceDir = path.join(projectRoot, "src");
    await waitFor(
      () => Object.keys(devServer.watcher.getWatched()).some((dir) => path.resolve(dir) === sourceDir),
      "watcher to track src",
    );

    const address = devServer.httpServer?.address();
    if (!address || typeof address === "string") throw new Error("Vite server did not bind a port");
    const request = async (url: string) => {
      const response = await fetch(`http://127.0.0.1:${address.port}${url}`, {
        headers: { accept: "*/*" },
      });
      return { status: response.status, body: await response.text() };
    };
    const countSent = (matches: (payload: { type?: string; event?: string }) => boolean) =>
      send.mock.calls.filter(([payload]) => matches(payload as { type?: string; event?: string })).length;
    const fullReloadCount = () => countSent((payload) => payload.type === "full-reload");
    const recoverEventCount = () => countSent((payload) => payload.event === PREVIEW_SETUP_RECOVER_EVENT);
    const waitForFullReload = async (previousCount: number) =>
      waitFor(() => fullReloadCount() > previousCount, "full-reload");
    const waitForRecoverEvent = async (previousCount: number) =>
      waitFor(() => recoverEventCount() > previousCount, "setup recover event");
    const waitForHotUpdate = async (file: string) =>
      waitFor(() => hotUpdatedFiles.includes(path.join(projectRoot, file)), `hot update of ${file}`);
    const writeFile = (file: string, source: string) =>
      fs.writeFileSync(path.join(projectRoot, file), source);

    return {
      request,
      fullReloadCount,
      recoverEventCount,
      waitForFullReload,
      waitForRecoverEvent,
      waitForHotUpdate,
      writeFile,
      projectRoot,
    };
  };

  const requestSetupModule = async (request: Awaited<ReturnType<typeof startServer>>["request"]) => {
    const previews = await request(PREVIEWS_URL);
    expect(previews.status, previews.body).toBe(200);
    const importUrl = previews.body.match(SETUP_IMPORT)?.[1];
    expect(importUrl, previews.body).toBeDefined();
    return request(importUrl!);
  };

  it("누락 중에도 previews module을 제공하고 생성 후 실제 파일을 Vite pipeline으로 로드", async () => {
    const { request, fullReloadCount, waitForFullReload, writeFile } = await startServer(
      "./src/설정 파일.tsx",
    );

    const missing = await request(PREVIEWS_URL);
    expect(missing.status, missing.body).toBe(200);
    expect(missing.body).toContain("setupFile not found");

    const before = fullReloadCount();
    writeFile("src/theme.ts", 'export const theme = "dark";\n');
    writeFile(
      "src/설정 파일.tsx",
      'import { theme } from "./theme";\n' +
        "export default function PreviewSetup(props: { children: unknown }) {\n" +
        "  return [theme, props.children];\n}\n",
    );
    await waitForFullReload(before);

    const setup = await requestSetupModule(request);
    expect(setup.status, setup.body).toBe(200);
    expect(setup.body).toContain("function PreviewSetup(props)");
    expect(setup.body).toContain('from "/src/theme.ts"');
  });

  it("setup file 삭제 시 reload 후 안내 loader로 전환", async () => {
    const { request, fullReloadCount, waitForFullReload, projectRoot } = await startServer(
      "./src/setup.tsx",
      { "src/setup.tsx": "export default function PreviewSetup(props) { return props.children; }\n" },
    );
    expect((await request(PREVIEWS_URL)).body).toMatch(SETUP_IMPORT);

    const before = fullReloadCount();
    fs.rmSync(path.join(projectRoot, "src", "setup.tsx"));
    await waitForFullReload(before);

    expect((await request(PREVIEWS_URL)).body).toContain("setupFile not found");
  });

  it.each([
    ["setup module", "src/setup.tsx"],
    ["setup 의존 module", "src/theme.ts"],
  ])("처음부터 변환에 실패한 %s 수정 시 앱 page 대신 갤러리에만 복구 신호", async (_label, brokenFile) => {
    const sources: Record<string, string> = {
      "src/setup.tsx":
        'import { theme } from "./theme";\n' +
        "export default function PreviewSetup(props) { return [theme, props.children]; }\n",
      "src/theme.ts": 'export const theme = "dark";\n',
    };
    const { request, fullReloadCount, recoverEventCount, waitForRecoverEvent, writeFile } = await startServer(
      "./src/setup.tsx",
      { ...sources, [brokenFile]: `${sources[brokenFile]}export const broken = ;\n` },
    );

    const setup = await requestSetupModule(request);
    if (brokenFile === "src/theme.ts") {
      expect(setup.status, setup.body).toBe(200);
      expect((await request("/src/theme.ts")).status).toBe(500);
    } else {
      expect(setup.status).toBe(500);
    }

    const reloadsBefore = fullReloadCount();
    const recoversBefore = recoverEventCount();
    writeFile(brokenFile, sources[brokenFile]);
    await waitForRecoverEvent(recoversBefore);
    expect(fullReloadCount()).toBe(reloadsBefore);
  });

  it("setup이 lazy import하는 미요청 module 수정은 앱 page를 reload하지 않음", async () => {
    const { request, fullReloadCount, waitForHotUpdate, writeFile } = await startServer(
      "./src/setup.tsx",
      {
        "src/setup.tsx":
          'export const loadHeavy = () => import("./heavy");\n' +
          "export default function PreviewSetup(props) { return props.children; }\n",
        "src/heavy.ts": "export const heavy = 1;\n",
      },
    );
    expect((await requestSetupModule(request)).status).toBe(200);

    const before = fullReloadCount();
    writeFile("src/heavy.ts", "export const heavy = 2;\n");
    await waitForHotUpdate("src/heavy.ts");
    expect(fullReloadCount()).toBe(before);
  });

  it.each([
    ["root 밖 경로", "../outside/setup.tsx", "inside the Vite root"],
    ["Vite가 제공할 수 없는 문자", "./src/setup #1.tsx", "rename the file"],
  ])("%s는 dev server를 막지 않고 갤러리 안내로 표시", async (_label, setupFile, guidance) => {
    const { request } = await startServer(setupFile);

    const previews = await request(PREVIEWS_URL);
    expect(previews.status, previews.body).toBe(200);
    expect(previews.body).toContain(guidance);
    expect(previews.body).not.toMatch(SETUP_IMPORT);
  });
});
