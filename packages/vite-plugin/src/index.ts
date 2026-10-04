import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  GALLERY_MODULE_ID,
  GALLERY_ROUTE as PROTOCOL_GALLERY_ROUTE,
  MANIFEST_ROUTE as PROTOCOL_MANIFEST_ROUTE,
  PREVIEWS_MODULE_ID,
  PREVIEW_SETUP_RECOVER_EVENT,
} from "@vitrine/protocol";
import type { Logger, Plugin } from "vite";
import { scanPreviews, renderPreviewsModule } from "./scan.js";
import { createPreviewTracker } from "./preview-tracker.js";
import { removePortFile, writePortFile } from "./port-file.js";
import {
  getPreviewSetupModule,
  needsPreviewSetupRecovery,
  resolvePreviewSetupPath,
  type PreviewSetupPath,
} from "./preview-setup.js";
import { invalidateTypeContext } from "./props-controls.js";

export interface VitrinePluginOptions {
  /** 프로젝트 루트 기준 @preview export 스캔 글롭 패턴 */
  include?: string[];
  /** Vite root 안의 전역 프리뷰 wrapper module 경로 (상대 경로는 Vite root 기준) */
  setupFile?: string;
}

const RESOLVED_PREVIEWS_MODULE_ID = "\0" + PREVIEWS_MODULE_ID;
const SCRIPT_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx"]);
// re-export 대신 값으로 선언해야 공개 declaration에 private protocol 참조가 남지 않음
export const GALLERY_ROUTE = PROTOCOL_GALLERY_ROUTE;
export const MANIFEST_ROUTE = PROTOCOL_MANIFEST_ROUTE;

// Source와 build output에서 동일한 package root 계산
const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const galleryClientPath = path.join(packageRoot, "dist", "gallery", "gallery-client.js");

/** @preview export를 스캔해 갤러리 라우트로 제공하는 Vite 플러그인 */
export default function vitrine(options: VitrinePluginOptions = {}): Plugin {
  let root = process.cwd();
  let previewSetup: PreviewSetupPath | undefined;
  let logger: Logger | undefined;
  const isPreviewSetupFile = (file: string) =>
    previewSetup?.status === "valid" && path.resolve(file) === previewSetup.filePath;

  return {
    name: "vitrine",
    apply: "serve",

    configResolved(config) {
      root = config.root;
      logger = config.logger;
      // 잘못된 setupFile은 앱 dev server를 막지 않고 갤러리와 터미널에만 안내
      previewSetup = options.setupFile
        ? resolvePreviewSetupPath(root, options.setupFile)
        : undefined;
    },

    resolveId(id) {
      if (id === PREVIEWS_MODULE_ID) return RESOLVED_PREVIEWS_MODULE_ID;
      if (id === GALLERY_MODULE_ID) return GALLERY_MODULE_ID;
      return null;
    },

    async load(id) {
      if (id === RESOLVED_PREVIEWS_MODULE_ID) {
        const entries = await scanPreviews({ root, include: options.include });
        const setupModule = previewSetup
          ? getPreviewSetupModule(previewSetup, root, isRegularFile(previewSetup))
          : undefined;
        if (setupModule?.status === "unavailable") logger?.warn(setupModule.message);
        return renderPreviewsModule(entries, setupModule);
      }
      if (id === GALLERY_MODULE_ID) {
        return fs.readFileSync(galleryClientPath, "utf-8");
      }
      return null;
    },

    handleHotUpdate({ modules, server }) {
      if (previewSetup?.status !== "valid") return;
      if (!needsPreviewSetupRecovery(modules, getSetupFileIdentities(previewSetup.filePath))) return;
      // full-reload는 앱 page까지 reload하므로 setup 실패 상태의 Gallery에만 알림
      server.ws.send({ type: "custom", event: PREVIEW_SETUP_RECOVER_EVENT });
    },

    configureServer(server) {
      const tracker = createPreviewTracker(() => scanPreviews({ root, include: options.include }));
      const logScanError = (error: unknown) => {
        server.config.logger.error(`[vitrine] preview scan failed: ${String(error)}`);
      };
      tracker.refresh().catch(logScanError);

      const reloadPreviewsModule = () => {
        const mod = server.moduleGraph.getModuleById(RESOLVED_PREVIEWS_MODULE_ID);
        if (mod) server.moduleGraph.invalidateModule(mod);
        server.ws.send({ type: "full-reload" });
      };

      // connect는 prefix 매칭이라 더 구체적인 manifest 경로를 gallery보다 먼저 등록
      server.middlewares.use(MANIFEST_ROUTE, (_req, res) => {
        // 커서 이동마다 호출되므로 재스캔 없이 마지막 결과 제공
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(tracker.getEntries()));
      });

      server.middlewares.use(GALLERY_ROUTE, async (_req, res) => {
        const html = await server.transformIndexHtml(GALLERY_ROUTE, GALLERY_HTML);
        res.setHeader("Content-Type", "text/html");
        res.end(html);
      });

      const onSourceChange = (file: string) => {
        if (!SCRIPT_EXTENSIONS.has(path.extname(file))) return;

        // 캐시된 ts.Program이 바뀐 파일을 반영하지 못하므로 재스캔 전에 무효화
        invalidateTypeContext(root);
        tracker
          .refresh()
          .then((changed) => {
            // 가상 모듈은 watch 대상이 아니라서 목록이 바뀔 때만 직접 무효화
            if (changed) reloadPreviewsModule();
          })
          .catch(logScanError);
      };
      // setup 내용 변경은 Vite HMR이 처리하고, 생성과 삭제만 previews module의 loader를 바꿈
      const onSetupFileToggle = (file: string) => {
        if (isPreviewSetupFile(file)) reloadPreviewsModule();
      };
      server.watcher.on("add", onSourceChange);
      server.watcher.on("unlink", onSourceChange);
      server.watcher.on("change", onSourceChange);
      server.watcher.on("add", onSetupFileToggle);
      server.watcher.on("unlink", onSetupFileToggle);

      // middleware 모드는 실제로 바인딩되는 포트가 없어 발행 대상이 아님
      const httpServer = server.httpServer;
      if (!httpServer) return;

      const publishPort = () => {
        const address = httpServer.address();
        if (address && typeof address === "object") {
          writePortFile(root, { port: address.port, pid: process.pid });
        }
      };

      if (httpServer.listening) publishPort();
      else httpServer.once("listening", publishPort);

      httpServer.once("close", () => removePortFile(root));
    },
  };
}

// Vite module graph는 symlink를 푼 실제 경로를 file로 기록하므로 두 경로를 모두 비교
function getSetupFileIdentities(filePath: string): string[] {
  try {
    return [filePath, fs.realpathSync.native(filePath)];
  } catch {
    return [filePath];
  }
}

// 디렉터리를 가리키는 setupFile도 import할 수 없으므로 일반 파일만 존재로 판정
function isRegularFile(setup: PreviewSetupPath): boolean {
  if (setup.status !== "valid") return false;
  return fs.statSync(setup.filePath, { throwIfNoEntry: false })?.isFile() ?? false;
}

const GALLERY_HTML = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>vitrine</title>
  </head>
  <body>
    <div id="vitrine-root"></div>
    <script type="module" src="/@id/${GALLERY_MODULE_ID}"></script>
  </body>
</html>
`;
