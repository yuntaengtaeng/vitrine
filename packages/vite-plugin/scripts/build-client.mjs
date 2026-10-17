import { vanillaExtractPlugin } from "@vanilla-extract/esbuild-plugin";
import esbuild from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GALLERY_CONFIG_MODULE_ID, PREVIEWS_MODULE_ID } from "@vitrine/protocol";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const outdir = path.join(packageRoot, "dist", "gallery");

// vanilla-extract가 class마다 source를 담은 주석을 남겨 CSS 크기가 몇 배가 되므로 CSS만 압축
const minifyGalleryStyles = {
  name: "minify-gallery-styles",
  setup(build) {
    build.onEnd(async () => {
      const file = path.join(outdir, "gallery-client.css");
      if (!fs.existsSync(file)) return;
      const { code } = await esbuild.transform(fs.readFileSync(file, "utf8"), { loader: "css", minify: true });
      fs.writeFileSync(file, code);
    });
  },
};

// Gallery UI와 iframe 안 frame renderer는 package files에 포함되는 dist 아래 각각 단일 bundle로 생성
// React와 virtual module은 사용자의 Vite runtime이 해석하므로 external로 유지
const options = {
  entryPoints: {
    "gallery-client": path.join(packageRoot, "client", "gallery-client.tsx"),
    "frame-client": path.join(packageRoot, "client", "frame-client.tsx"),
  },
  outdir,
  bundle: true,
  external: [
    "react",
    "react-dom",
    "react-dom/client",
    "react/jsx-runtime",
    PREVIEWS_MODULE_ID,
    GALLERY_CONFIG_MODULE_ID,
    "vite-plugin-react-vitrine/preview",
  ],
  plugins: [vanillaExtractPlugin({ identifiers: "short" }), minifyGalleryStyles],
  jsx: "automatic",
  format: "esm",
  target: "es2022",
  logLevel: "info",
};

if (process.argv.includes("--watch")) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
} else {
  await esbuild.build(options);
}
