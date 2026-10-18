# vitrine-plugin-static

Build your [Vitrine](https://vitrine-4kr.pages.dev/) Gallery into static files and deploy it anywhere, so reviewers can browse your components without running a dev server. See the [live demo](https://vitrine-4kr.pages.dev/demo/), built with this plugin.

[한국어](https://github.com/yuntaengtaeng/vitrine/blob/main/packages/plugin-static/README.ko.md)

## Install

```sh
npm install -D vitrine-plugin-static
```

Register it in `vitrine({ plugins })` in your Vite config.

```ts
// vite.config.ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import vitrine from "vite-plugin-react-vitrine";
import vitrineStatic from "vitrine-plugin-static";

export default defineConfig({
  plugins: [react(), vitrine({ plugins: [vitrineStatic()] })],
});
```

## Build

```sh
npx vitrine-static build
```

The Gallery is written to `vitrine-static/` (`index.html`, `frame.html` and `assets/`). Upload the folder to any static host. Your regular `vite build` is not affected.

The build uses your Vite config, so aliases, CSS, the setup file, globals and other Vite plugins behave as they do in the dev server.

| Option | Default | Description |
| --- | --- | --- |
| `outDir` | `"vitrine-static"` | Output folder, relative to the Vite root |
| `base` | `"./"` | Vite `base` for the deployed Gallery. The default works under any sub path |

`vitrine-static build [root] [--config <file>]` accepts the same root and config file arguments as `vite build`.

## What is included

Previews, Props, Variants, Matrix, Actions, Code, globals, viewports, backgrounds and state links (Copy link) work in the static Gallery.

Features that need the dev server are left out: hot updates, snapshot history, Open in editor, and the VS Code cursor sync and Save as variant.

## Plugins that only make sense for your app build

While `vitrine-static build` runs, `process.env.VITRINE_STATIC_BUILD` is `"1"`. Use it to skip plugins that should not run for the Gallery, such as type declaration or bundle report plugins.

```ts
const isGalleryBuild = process.env.VITRINE_STATIC_BUILD === "1";

export default defineConfig({
  plugins: [react(), vitrine({ plugins: [vitrineStatic()] }), !isGalleryBuild && dts()],
});
```

## Compatibility

Requires `vite-plugin-react-vitrine` 0.2 or later and Vite 6.4, 7 or 8. The Vitrine plugin API is experimental during `0.x`.

## License

MIT
