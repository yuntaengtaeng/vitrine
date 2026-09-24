import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  GALLERY_MODULE_ID,
  GALLERY_ROUTE as PROTOCOL_GALLERY_ROUTE,
  MANIFEST_ROUTE as PROTOCOL_MANIFEST_ROUTE,
  PREVIEWS_MODULE_ID,
} from "@vitrine/protocol";
import type { Plugin } from "vite";
import { scanPreviews, renderPreviewsModule } from "./scan.js";
import { createPreviewTracker } from "./preview-tracker.js";
import { removePortFile, writePortFile } from "./port-file.js";
import { invalidateTypeContext } from "./props-controls.js";

export interface VitrinePluginOptions {
  /** 프로젝트 루트 기준 @preview export 스캔 글롭 패턴 */
  include?: string[];
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

  return {
    name: "vitrine",
    apply: "serve",

    configResolved(config) {
      root = config.root;
    },

    resolveId(id) {
      if (id === PREVIEWS_MODULE_ID) return RESOLVED_PREVIEWS_MODULE_ID;
      if (id === GALLERY_MODULE_ID) return GALLERY_MODULE_ID;
      return null;
    },

    async load(id) {
      if (id === RESOLVED_PREVIEWS_MODULE_ID) {
        const entries = await scanPreviews({ root, include: options.include });
        return renderPreviewsModule(entries);
      }
      if (id === GALLERY_MODULE_ID) {
        return fs.readFileSync(galleryClientPath, "utf-8");
      }
      return null;
    },

    configureServer(server) {
      const tracker = createPreviewTracker(() => scanPreviews({ root, include: options.include }));
      const logScanError = (error: unknown) => {
        server.config.logger.error(`[vitrine] preview scan failed: ${String(error)}`);
      };
      tracker.refresh().catch(logScanError);

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
            if (!changed) return;
            const mod = server.moduleGraph.getModuleById(RESOLVED_PREVIEWS_MODULE_ID);
            if (mod) server.moduleGraph.invalidateModule(mod);
            server.ws.send({ type: "full-reload" });
          })
          .catch(logScanError);
      };
      server.watcher.on("add", onSourceChange);
      server.watcher.on("unlink", onSourceChange);
      server.watcher.on("change", onSourceChange);

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
