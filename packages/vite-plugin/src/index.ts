import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  FRAME_MODULE_ID,
  FRAME_ROUTE,
  GALLERY_CONFIG_MODULE_ID,
  GALLERY_MODULE_ID,
  GALLERY_ROUTE as PROTOCOL_GALLERY_ROUTE,
  MANIFEST_ROUTE as PROTOCOL_MANIFEST_ROUTE,
  OPEN_IN_EDITOR_ROUTE,
  PREVIEWS_MODULE_ID,
  PREVIEW_SETUP_RECOVER_EVENT,
  SNAPSHOTS_CHANGED_EVENT,
  SNAPSHOTS_ROUTE,
  SNAPSHOT_QUERY,
  VARIANT_EDIT_ROUTE,
  type VariantEditRequest,
  type VariantEditResponse,
} from "@vitrine/protocol";
import { normalizePath, type Logger, type Plugin } from "vite";
import { DEFAULT_INCLUDE, createPreviewScanner, type PreviewScanner } from "./scan.js";
import { renderPreviewsModule } from "./previews-module.js";
import { createPreviewTracker, type PreviewTracker } from "./preview-tracker.js";
import { removePortFile, writePortFile } from "./port-file.js";
import {
  getPreviewSetupModule,
  needsPreviewSetupRecovery,
  resolvePreviewSetupPath,
  type PreviewSetupPath,
} from "./preview-setup.js";
import { toViteOpenInEditorUrl } from "./open-in-editor.js";
import { renderGalleryConfigModule, resolveViewports } from "./gallery-config.js";
import { applySnapshotChange } from "./snapshot-recorder.js";
import { createSnapshotStore } from "./snapshot-store.js";
import { planVariantEdit } from "./variant-edit.js";

// 공개 옵션 타입은 공개 entry에 둬야 배포 declaration이 내부 module을 참조하지 않음
/** 무대 iframe 너비 프리셋 (Responsive는 항상 따로 제공) */
export interface ViewportOption {
  name: string;
  /** px */
  width: number;
}

/** 기본 viewport 목록을 받아 원하는 목록을 돌려주는 함수, 추가, 삭제, 교체 모두 가능 */
export type ViewportsOption = (defaults: ViewportOption[]) => ViewportOption[];

export interface SnapshotRecordContext {
  /** Vite root 기준 경로 */
  file: string;
  /** 마지막으로 기록한 시각(ms), 처음이면 null */
  lastRecordedAt: number | null;
  now: number;
}

/** 스냅샷 히스토리 설정 (ADR 010) */
export interface SnapshotOptions {
  /** 파일마다 보관할 수, Snapshot 1 포함 (기본 20) */
  limit?: number;
  /** false를 돌려주면 이번 저장은 기록하지 않음, 자동 저장 에디터용 */
  shouldRecord?: (context: SnapshotRecordContext) => boolean;
}

/** 정적 Gallery 빌드 설정 */
export interface StaticBuildOptions {
  /** 결과 폴더, Vite root 기준 */
  outDir: string;
  /** 배포 위치의 Vite base, "./"면 어느 하위 경로에 올려도 동작 */
  base: string;
}

/** Vitrine에 등록하는 plugin (실험 단계, ADR 011) */
export interface VitrinePlugin {
  /** 로그와 오류에 쓰는 이름 */
  name: string;
  /** 이번 `vite build`를 정적 Gallery 빌드로 바꿀 때 그 설정, 아니면 null */
  staticBuild?: () => StaticBuildOptions | null;
}

export interface VitrinePluginOptions {
  /** 프로젝트 루트 기준 @preview export 스캔 글롭 패턴 */
  include?: string[];
  /** Vite root 안의 전역 프리뷰 wrapper module 경로 (상대 경로는 Vite root 기준) */
  setupFile?: string;
  /** Gallery viewport 목록 변경, 기본 목록을 받아 추가, 삭제, 교체한 목록 반환 (Responsive는 항상 유지, 실험 단계) */
  viewports?: ViewportsOption;
  /** `@preview` 파일 저장본을 dev server 메모리에 보관해 옛 버전과 비교, false면 끔 (실험 단계) */
  snapshots?: false | SnapshotOptions;
  /** 선택 기능을 더하는 Vitrine plugin, 예) vitrine-plugin-static (실험 단계) */
  plugins?: VitrinePlugin[];
}

const RESOLVED_PREVIEWS_MODULE_ID = "\0" + PREVIEWS_MODULE_ID;
const RESOLVED_GALLERY_CONFIG_MODULE_ID = "\0" + GALLERY_CONFIG_MODULE_ID;
const SCRIPT_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx"]);
// re-export 대신 값으로 선언해야 공개 declaration에 private protocol 참조가 남지 않음
export const GALLERY_ROUTE = PROTOCOL_GALLERY_ROUTE;
export const MANIFEST_ROUTE = PROTOCOL_MANIFEST_ROUTE;

// Source와 build output에서 동일한 package root 계산
const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const galleryClientPath = path.join(packageRoot, "dist", "gallery", "gallery-client.js");
const frameClientPath = path.join(packageRoot, "dist", "gallery", "frame-client.js");
const galleryStylePath = path.join(packageRoot, "dist", "gallery", "gallery-client.css");
// fs.allow 밖(pnpm store 등)에 있을 수 있는 package 파일을 /@fs로 import하지 않고 직접 서빙
const GALLERY_STYLE_ROUTE = `${GALLERY_ROUTE}/gallery.css`;

/** @preview export를 스캔해 갤러리 라우트로 제공하는 Vite 플러그인 */
export default function vitrine(options: VitrinePluginOptions = {}): Plugin {
  let root = process.cwd();
  let previewSetup: PreviewSetupPath | undefined;
  let logger: Logger | undefined;
  // root가 정해지는 configResolved에서 만들고, Gallery 가상 모듈과 manifest가 같은 스캔 결과를 공유
  let scanner!: PreviewScanner;
  let tracker!: PreviewTracker;
  let galleryConfigModule = "";
  const snapshotStore = options.snapshots === false ? null : createSnapshotStore(options.snapshots);
  // 등록한 plugin이 요청하지 않은 `vite build`에는 관여하지 않아 앱 배포 결과가 바뀌지 않음
  const staticBuild = findStaticBuild(options.plugins);
  let staticHtml = new Map<string, string>();
  const isPreviewSetupFile = (file: string) =>
    previewSetup?.status === "valid" && path.resolve(file) === previewSetup.filePath;

  return {
    name: "vitrine",
    apply: (_config, env) => env.command === "serve" || staticBuild !== null,

    config(config, env) {
      if (env.command !== "build" || !staticBuild) return;
      const projectRoot = normalizePath(path.resolve(config.root ?? process.cwd()));
      staticHtml = new Map([
        [`${projectRoot}/index.html`, STATIC_GALLERY_HTML],
        [`${projectRoot}/${STATIC_FRAME_FILE}`, STATIC_FRAME_HTML],
      ]);
      config.base = staticBuild.base;
      // 앱 build 설정(lib 모드, 입력, external)은 Gallery에 맞지 않아 병합하지 않고 바꿈
      config.build = {
        ...config.build,
        outDir: staticBuild.outDir,
        emptyOutDir: true,
        lib: false,
        ssr: false,
        rollupOptions: { input: [...staticHtml.keys()] },
      };
    },

    configResolved(config) {
      root = config.root;
      logger = config.logger;
      // 잘못된 setupFile은 앱 dev server를 막지 않고 갤러리와 터미널에만 안내
      previewSetup = options.setupFile
        ? resolvePreviewSetupPath(root, options.setupFile)
        : undefined;
      const include = options.include ?? DEFAULT_INCLUDE;
      scanner = createPreviewScanner({ root, include });
      tracker = createPreviewTracker(scanner.scan);
      // 사용자 함수는 Node에서 한 번 실행하고 Gallery에는 결과만 데이터로 전달 (ADR 007)
      const { viewports, warning } = resolveViewports(options.viewports);
      if (warning) logger.warn(warning);
      const isStatic = config.command === "build";
      galleryConfigModule = renderGalleryConfigModule({
        viewports,
        include,
        snapshots: !isStatic && snapshotStore !== null,
        frameUrl: isStatic ? STATIC_FRAME_FILE : FRAME_ROUTE,
        openInEditor: !isStatic,
      });
    },

    async buildStart() {
      // dev server는 configureServer에서 스캔을 시작하지만 정적 빌드는 그 단계가 없음
      if (staticHtml.size > 0) await tracker.refresh();
    },

    resolveId(id) {
      if (staticHtml.has(id)) return id;
      if (id === PREVIEWS_MODULE_ID) return RESOLVED_PREVIEWS_MODULE_ID;
      if (id === GALLERY_CONFIG_MODULE_ID) return RESOLVED_GALLERY_CONFIG_MODULE_ID;
      if (id === GALLERY_MODULE_ID) return GALLERY_MODULE_ID;
      if (id === FRAME_MODULE_ID) return FRAME_MODULE_ID;
      return null;
    },

    async load(id) {
      if (id === RESOLVED_PREVIEWS_MODULE_ID) {
        const entries = await tracker.getLatestEntries();
        const setupModule = previewSetup
          ? getPreviewSetupModule(previewSetup, root, isRegularFile(previewSetup))
          : undefined;
        if (setupModule?.status === "unavailable") logger?.warn(setupModule.message);
        return renderPreviewsModule(entries, setupModule);
      }
      if (id === RESOLVED_GALLERY_CONFIG_MODULE_ID) return galleryConfigModule;
      const html = staticHtml.get(id);
      if (html) return html;
      if (id === GALLERY_MODULE_ID) {
        const client = fs.readFileSync(galleryClientPath, "utf-8");
        // 정적 빌드에는 CSS를 서빙할 dev server가 없어 bundle에 넣음
        return staticHtml.size > 0 ? `import ${JSON.stringify(normalizePath(galleryStylePath))};
${client}` : client;
      }
      if (id === FRAME_MODULE_ID) {
        return fs.readFileSync(frameClientPath, "utf-8");
      }
      const [file, query] = id.split("?");
      const snapshot = query && new URLSearchParams(query).get(SNAPSHOT_QUERY);
      if (snapshot) {
        const code = snapshotStore?.content(toRootRelative(root, file), Number(snapshot));
        if (code === undefined) throw new Error(`[vitrine] Snapshot ${snapshot} of ${file} is no longer kept`);
        return code;
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
      const logScanError = (error: unknown) => {
        server.config.logger.error(`[vitrine] preview scan failed: ${String(error)}`);
      };
      // 서버를 켤 때의 @preview 파일 내용이 Snapshot 1
      tracker
        .refresh()
        .then(() => {
          for (const file of new Set(tracker.getEntries().map((entry) => entry.file))) {
            const code = fs.readFileSync(path.join(root, file), "utf-8");
            if (snapshotStore) applySnapshotChange(snapshotStore, file, code, Date.now());
          }
        })
        .catch(logScanError);

      // 파일은 쓰지 않고 편집만 계산, 적용은 저장하지 않은 버퍼를 아는 VS Code 확장이 함
      server.middlewares.use(VARIANT_EDIT_ROUTE, (req, res) => {
        const reply = (response: VariantEditResponse) => {
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(response));
        };
        let body = "";
        req.on("data", (chunk: Buffer) => (body += chunk.toString("utf-8")));
        req.on("end", () => {
          const request = parseVariantEditRequest(body);
          const entry = request && tracker.getEntries().find((candidate) => candidate.id === request.previewId);
          if (!request || !entry) return reply({ ok: false, reason: "This preview is no longer in the project" });
          const file = path.join(root, entry.file);
          const source = fs.readFileSync(file, "utf-8");
          const plan = planVariantEdit(source, entry.exportName, request.name, request.args);
          if (!plan.ok) return reply(plan);
          const contentHash = crypto.createHash("sha256").update(source).digest("hex");
          reply({ ok: true, file, contentHash, edits: plan.edits, key: plan.key });
        });
      });

      server.middlewares.use(SNAPSHOTS_ROUTE, (req, res) => {
        const file = new URL(req.url ?? "", "http://localhost").searchParams.get("file") ?? "";
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(snapshotStore?.history(file) ?? { snapshots: [], pruned: 0 }));
      });

      const recordSnapshot = (absolute: string) => {
        if (!snapshotStore) return;
        const file = toRootRelative(root, absolute);
        const code = fs.existsSync(absolute) ? fs.readFileSync(absolute, "utf-8") : null;
        const tracked = tracker.getEntries().some((entry) => entry.file === file);
        // include 밖이거나 @preview가 없던 파일은 기록을 시작하지 않음, 이미 기록 중이면 유지나 폐기를 판단
        if (code !== null && !tracked && !snapshotStore.has(file)) return;
        if (applySnapshotChange(snapshotStore, file, code, Date.now())) {
          server.ws.send({ type: "custom", event: SNAPSHOTS_CHANGED_EVENT, data: { file } });
        }
      };

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

      // 경로를 붙여 등록하면 connect가 next() 때 prefix를 되붙여 바꾼 URL이 깨지므로 직접 비교
      server.middlewares.use((req, res, next) => {
        if (!req.url || req.url.split("?")[0] !== OPEN_IN_EDITOR_ROUTE) return next();
        const viteUrl = toViteOpenInEditorUrl(req.url, tracker.getEntries(), root);
        if (!viteUrl) {
          res.statusCode = 404;
          res.end();
          return;
        }
        req.url = viteUrl;
        next();
      });

      server.middlewares.use(GALLERY_STYLE_ROUTE, (_req, res) => {
        res.setHeader("Content-Type", "text/css");
        res.end(fs.readFileSync(galleryStylePath, "utf-8"));
      });

      // Gallery 경로가 prefix로 가로채지 않도록 먼저 등록, 프리뷰 id query는 frame client가 읽음
      server.middlewares.use(FRAME_ROUTE, async (_req, res) => {
        const html = await server.transformIndexHtml(FRAME_ROUTE, FRAME_HTML);
        res.setHeader("Content-Type", "text/html");
        res.end(html);
      });

      server.middlewares.use(GALLERY_ROUTE, async (_req, res) => {
        const html = await server.transformIndexHtml(GALLERY_ROUTE, GALLERY_HTML);
        res.setHeader("Content-Type", "text/html");
        res.end(html);
      });

      const onSourceChange = (file: string) => {
        if (!SCRIPT_EXTENSIONS.has(path.extname(file))) return;

        // 캐시된 ts.Program이 바뀐 파일을 반영하지 못하므로 재스캔 전에 무효화
        scanner.invalidateTypes();
        tracker
          .refresh()
          .then((changed) => {
            // 가상 모듈은 watch 대상이 아니라서 목록이 바뀔 때만 직접 무효화
            if (changed) reloadPreviewsModule();
            recordSnapshot(file);
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
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>vitrine</title>
    <link rel="stylesheet" href="${GALLERY_STYLE_ROUTE}" />
  </head>
  <body>
    <div id="vitrine-root"></div>
    <script type="module" src="/@id/${GALLERY_MODULE_ID}"></script>
  </body>
</html>
`;

function findStaticBuild(plugins: VitrinePlugin[] = []): StaticBuildOptions | null {
  for (const plugin of plugins) {
    const options = plugin.staticBuild?.();
    if (options) return options;
  }
  return null;
}

const STATIC_FRAME_FILE = "frame.html";

const STATIC_GALLERY_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>vitrine</title>
  </head>
  <body>
    <div id="vitrine-root"></div>
    <script type="module">import "${GALLERY_MODULE_ID}";</script>
  </body>
</html>
`;

const STATIC_FRAME_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>vitrine preview</title>
    <style>html, body { margin: 0; background: transparent; }</style>
  </head>
  <body>
    <div id="vitrine-frame-root"></div>
    <script type="module">import "${FRAME_MODULE_ID}";</script>
  </body>
</html>
`;

// 배경은 Gallery가 iframe 바깥에서 칠하므로 frame 문서는 투명하게 둠
const FRAME_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>vitrine preview</title>
    <style>html, body { margin: 0; background: transparent; }</style>
  </head>
  <body>
    <div id="vitrine-frame-root"></div>
    <script type="module" src="/@id/${FRAME_MODULE_ID}"></script>
  </body>
</html>
`;

function toRootRelative(root: string, file: string): string {
  return path.relative(root, file).split(path.sep).join("/");
}

function parseVariantEditRequest(body: string): VariantEditRequest | null {
  try {
    const value: unknown = JSON.parse(body);
    if (typeof value !== "object" || value === null) return null;
    const { previewId, name, args } = value as Record<string, unknown>;
    if (typeof previewId !== "string" || typeof name !== "string" || !name.trim()) return null;
    if (typeof args !== "object" || args === null) return null;
    const values = Object.entries(args).filter(
      (entry): entry is [string, string | number | boolean] =>
        typeof entry[1] === "string" || typeof entry[1] === "boolean" || (typeof entry[1] === "number" && Number.isFinite(entry[1])),
    );
    return { previewId, name: name.trim(), args: Object.fromEntries(values) };
  } catch {
    return null;
  }
}
