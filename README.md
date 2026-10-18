# Vitrine

[한국어](./README.ko.md)

<p align="center">
  <img src="./apps/website/public/favicon.svg" width="72" height="72" alt="Vitrine" />
</p>

[Website](https://vitrine-4kr.pages.dev/) · [Live demo](https://vitrine-4kr.pages.dev/demo/) · [Documentation](https://vitrine-4kr.pages.dev/docs) · [npm](https://www.npmjs.com/package/vite-plugin-react-vitrine) · [VS Code](https://marketplace.visualstudio.com/items?itemName=yuntaengtaeng.vitrine)

Jetpack Compose style previews for React, right next to the file you are editing.

Annotate a component export with `/** @preview */`. Your Vite dev server renders it in a
live gallery, and the VS Code extension shows that gallery beside your editor.

```tsx
/** @preview name="Inputs/Primary button" */
export const PrimaryButton = () => <Button variant="primary">Save</Button>;
```

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./apps/website/public/screenshots/gallery-dark.png" />
  <img src="./apps/website/public/screenshots/gallery.png" alt="The Vitrine Gallery with a Button preview and its props panel" />
</picture>

Try it without installing anything in the [live demo](https://vitrine-4kr.pages.dev/demo/).

## Why Vitrine

- **Previews live next to the code.** A preview is a comment above the export, not a
  separate stories file to keep in sync.
- **Your Vite setup renders everything.** Aliases, plugins, CSS and HMR work exactly as
  they do in your app.
- **Providers run inside previews.** An optional setup file mounts stateful context providers
  around the gallery's preview tree.
- **The editor is the main interface.** Moving the cursor onto a preview switches the
  panel to it. The browser gallery works on its own too.
- **Deploy it when you need to.** `vitrine-plugin-static` builds the gallery into static files
  for reviewers, without touching your app build.

## What's in the gallery

| | |
| --- | --- |
| ![Variants view](./apps/website/public/screenshots/variants-crop.png) | **Variants.** Name sets of props with `preview()` and lay them out side by side. |
| ![Matrix view](./apps/website/public/screenshots/matrix-crop.png) | **Matrix.** Render every combination of two props at once. |
| ![Actions tab](./apps/website/public/screenshots/actions-crop.png) | **Actions.** Calls to `on*` props are recorded with their arguments. |
| ![Globals in the toolbar](./apps/website/public/screenshots/globals-crop.png) | **Globals.** Theme, locale or any provider value, chosen from the toolbar. |
| ![History view](./apps/website/public/screenshots/history-crop.png) | **History.** Compare the current version with an earlier save. |

Props are generated from your types, links reopen the same state, and in VS Code the panel
follows your cursor and can save the current props as a variant.

## Getting started

See the [vite-plugin-react-vitrine README](./packages/vite-plugin/README.md) for
installation, preview declarations, controls, variants and provider setup. To deploy the
gallery, see [vitrine-plugin-static](./packages/plugin-static/README.md).

To see previews beside your editor, install [Vitrine for VS Code](https://marketplace.visualstudio.com/items?itemName=yuntaengtaeng.vitrine) from the
Visual Studio Marketplace.

## Repository

| Path | Description |
| --- | --- |
| `packages/vite-plugin` | `vite-plugin-react-vitrine`, the published Vite plugin and gallery |
| `packages/plugin-static` | `vitrine-plugin-static`, the official plugin that builds a static gallery |
| `packages/protocol` | Private runtime contracts shared by the plugin, gallery and extension |
| `apps/vscode-extension` | [Vitrine for VS Code](https://marketplace.visualstudio.com/items?itemName=yuntaengtaeng.vitrine), shows the gallery in a panel |
| `examples/react-basic` | Example app used during development and e2e tests |
| `examples/showcase` | Styled components for screenshots and the live demo |
| `apps/website` | The website, with the live demo at `/demo/` |
| `fixtures/multi-project` | Two apps for testing project switching |
| `tests/compat` | Pinned React and Vite version lanes |

```text
VS Code panel -> <iframe src="http://localhost:<port>/__vitrine">
                   |
                 Vite dev server + vite-plugin-react-vitrine
                   scans @preview exports and serves the gallery
```

The extension never bundles or renders components. It finds the running dev server
through `.vitrine/port.json`, written by the plugin, and embeds the gallery page.

## Development

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening an issue or a pull request.

```bash
pnpm install
pnpm run build            # build the plugin and gallery
pnpm run dev:example      # start the example app
pnpm run test             # run unit tests
pnpm run lint
pnpm run test:e2e         # build, then run the Playwright suite
pnpm run screenshots      # recapture the screenshots used by the READMEs and website
```

Open `http://localhost:5173/__vitrine` to see the example gallery.

To run the extension, keep the example dev server running and in a second terminal:

```bash
pnpm run build:extension
pnpm run dev:host         # opens an Extension Development Host (requires `code` on PATH)
```

You can also open this folder in VS Code and press **F5**. Then run
**Vitrine: Open Preview** from the command palette.

### Release checks

```bash
pnpm run test:package             # install the packed plugin into a clean consumer
pnpm run test:extension-package   # verify the extension bundle
pnpm run test:compat              # run every React and Vite compatibility lane
```

## Compatibility

`vite-plugin-react-vitrine` supports React 18 and 19, and Vite 6.4+, 7 and 8. These
combinations are verified on every compatibility run:

| React | Vite | TypeScript |
| --- | --- | --- |
| 18.3.1 | 6.4.3 | 5.6.3 |
| 18.3.1 | 7.3.6 | 5.9.3 |
| 19.2.8 | 8.2.2 | 5.9.3 |

Each lane pins exact versions. Supporting a new major version adds a new lane instead of
changing an existing one.

## License

[MIT](./LICENSE)
