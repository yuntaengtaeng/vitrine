import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Plugin } from "vite";
import { scanPreviews, renderPreviewsModule } from "./scan.js";
import { removePortFile, writePortFile } from "./port-file.js";

export interface VitrinePluginOptions {
  /** 프로젝트 루트 기준 @preview export 스캔 글롭 패턴 */
  include?: string[];
}

const PREVIEWS_MODULE_ID = "virtual:vitrine-previews";
const RESOLVED_PREVIEWS_MODULE_ID = "\0" + PREVIEWS_MODULE_ID;
const GALLERY_MODULE_ID = "virtual:vitrine-preview-gallery";
export const GALLERY_ROUTE = "/__vitrine";
export const MANIFEST_ROUTE = "/__vitrine/manifest";

// dev의 src/index.ts와 빌드된 dist/index.js 모두 패키지 루트 한 단계 아래 위치,
// 별도 복사 스텝 없이 client 에셋 경로 동일 계산
const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const galleryClientPath = path.join(packageRoot, "client", "gallery-client.js");

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
      // connect는 prefix 매칭이라 "/__vitrine" 라우트가 이 경로까지 삼키므로,
      // 더 구체적인 경로를 먼저 등록해야 함
      server.middlewares.use(MANIFEST_ROUTE, async (_req, res) => {
        const entries = await scanPreviews({ root, include: options.include });
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(entries));
      });

      server.middlewares.use(GALLERY_ROUTE, async (_req, res) => {
        const html = await server.transformIndexHtml(GALLERY_ROUTE, GALLERY_HTML);
        res.setHeader("Content-Type", "text/html");
        res.end(html);
      });

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
