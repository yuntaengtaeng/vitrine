import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Plugin } from "vite";
import { scanPreviews, type PreviewEntry } from "./scan.js";

export interface VitrinePluginOptions {
  /** Glob patterns (relative to project root) to scan for @preview exports. */
  include?: string[];
}

const PREVIEWS_MODULE_ID = "virtual:vitrine-previews";
const RESOLVED_PREVIEWS_MODULE_ID = "\0" + PREVIEWS_MODULE_ID;
const GALLERY_MODULE_ID = "virtual:vitrine-preview-gallery";
export const GALLERY_ROUTE = "/__vitrine";

// packages/vite-plugin/src/index.ts (dev) and packages/vite-plugin/dist/index.js (built)
// both sit exactly one directory below the package root, so this resolves correctly
// in either case without a separate copy step for the client asset.
const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const galleryClientPath = path.join(packageRoot, "client", "gallery-client.js");

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
      server.middlewares.use(GALLERY_ROUTE, async (_req, res) => {
        const html = await server.transformIndexHtml(GALLERY_ROUTE, GALLERY_HTML);
        res.setHeader("Content-Type", "text/html");
        res.end(html);
      });
    },
  };
}

function renderPreviewsModule(entries: PreviewEntry[]): string {
  const items = entries.map(
    (entry) =>
      `  { id: ${JSON.stringify(entry.id)}, name: ${JSON.stringify(entry.name)}, ` +
      `file: ${JSON.stringify(entry.file)}, exportName: ${JSON.stringify(entry.exportName)}, ` +
      `load: () => import(${JSON.stringify("/" + entry.file)}) }`,
  );
  return `export default [\n${items.join(",\n")}\n];\n`;
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
