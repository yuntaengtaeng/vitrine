import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  GALLERY_MODULE_ID,
  GALLERY_ROUTE,
  MANIFEST_ROUTE,
  PREVIEWS_MODULE_ID,
} from "@vitrine/protocol";
import type { Plugin } from "vite";
import { scanPreviews, renderPreviewsModule, type PreviewEntry } from "./scan.js";
import { removePortFile, writePortFile } from "./port-file.js";
import { invalidateTypeContext } from "./props-controls.js";

export interface VitrinePluginOptions {
  /** 프로젝트 루트 기준 @preview export 스캔 글롭 패턴 */
  include?: string[];
}

const RESOLVED_PREVIEWS_MODULE_ID = "\0" + PREVIEWS_MODULE_ID;
export { GALLERY_ROUTE, MANIFEST_ROUTE } from "@vitrine/protocol";

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
      // virtual:vitrine-previews는 addWatchFile 연결이 없어 소스 변경으로 자동
      // 무효화되지 않으므로, 렌더링 결과(@preview 목록)가 실제로 달라졌을 때만
      // 직접 무효화하고 전체 리로드, 라인 범위 등 목록에 안 드러나는 변경까지
      // 리로드하면 편집할 때마다 리로드가 일어나 오히려 방해되므로 렌더링
      // 결과 문자열 비교로 게이팅. 베이스라인은 watcher 이벤트를 기다리지 않고
      // 서버 시작 시점에 미리 잡아둠, 그렇지 않으면 사용자의 첫 실제 편집이
      // "베이스라인 확립"으로 오인돼 무효화 없이 조용히 넘어감
      let lastEntries: PreviewEntry[] = [];
      let lastRenderedPreviews: string | null = null;
      scanPreviews({ root, include: options.include }).then((entries) => {
        lastEntries = entries;
        lastRenderedPreviews = renderPreviewsModule(entries);
      });

      // connect는 prefix 매칭이라 "/__vitrine" 라우트가 이 경로까지 삼키므로,
      // 더 구체적인 경로를 먼저 등록해야 함
      //
      // manifest는 커서 이동마다(200ms 디바운스) 호출되므로 매 요청마다
      // scanPreviews를 다시 돌리지 않고, watcher가 마지막으로 계산해 둔
      // lastEntries를 그대로 서빙, 파일 변경과 무관한 커서 이동에 스캔
      // 비용을 지불할 이유가 없음
      server.middlewares.use(MANIFEST_ROUTE, (_req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(lastEntries));
      });

      server.middlewares.use(GALLERY_ROUTE, async (_req, res) => {
        const html = await server.transformIndexHtml(GALLERY_ROUTE, GALLERY_HTML);
        res.setHeader("Content-Type", "text/html");
        res.end(html);
      });

      const checkPreviewsChanged = async (file: string) => {
        if (![".ts", ".tsx", ".js", ".jsx"].includes(path.extname(file))) return;

        // 타입 체크 대상 파일이 바뀌면 캐시된 ts.Program도 낡은 상태이므로,
        // 다음 scanPreviews 호출 전에 무효화, 아직은 어떤 파일이 바뀌든
        // 프로젝트 전체를 다시 빌드(범위를 import 그래프로 좁히는 최적화는
        // 나중에 실측 후 결정)
        invalidateTypeContext(root);

        const entries = await scanPreviews({ root, include: options.include });
        lastEntries = entries;
        const rendered = renderPreviewsModule(entries);
        if (rendered === lastRenderedPreviews) return;
        lastRenderedPreviews = rendered;

        const mod = server.moduleGraph.getModuleById(RESOLVED_PREVIEWS_MODULE_ID);
        if (mod) server.moduleGraph.invalidateModule(mod);
        server.ws.send({ type: "full-reload" });
      };
      server.watcher.on("add", checkPreviewsChanged);
      server.watcher.on("unlink", checkPreviewsChanged);
      server.watcher.on("change", checkPreviewsChanged);

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
