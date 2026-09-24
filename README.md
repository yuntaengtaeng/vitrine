# Vitrine

[한국어](./README.ko.md)

Jetpack Compose style previews for React, right next to the file you are editing.

Annotate a component export with `/** @preview */`. Your Vite dev server renders it in a
live gallery, and the VS Code extension shows that gallery beside your editor.

```tsx
/** @preview name="Inputs/Primary button" */
export const PrimaryButton = () => <Button variant="primary">Save</Button>;
```

## Why Vitrine

- **Previews live next to the code.** A preview is a comment above the export, not a
  separate stories file to keep in sync.
- **Your Vite setup renders everything.** Aliases, plugins, CSS and HMR work exactly as
  they do in your app.
- **The editor is the main interface.** Moving the cursor onto a preview switches the
  panel to it. The browser gallery works on its own too.

Vitrine is not a Storybook replacement. It has no documentation site builder, visual
regression testing or addon ecosystem.

## Getting started

See the [vite-plugin-react-vitrine README](./packages/vite-plugin/README.md) for
installation, preview declarations, controls and variants.

To see previews beside your editor, install [Vitrine for VS Code](https://marketplace.visualstudio.com/items?itemName=yuntaengtaeng.vitrine) from the
Visual Studio Marketplace.

## Repository

| Path | Description |
| --- | --- |
| `packages/vite-plugin` | `vite-plugin-react-vitrine`, the published Vite plugin and gallery |
| `packages/protocol` | Private runtime contracts shared by the plugin, gallery and extension |
| `apps/vscode-extension` | [Vitrine for VS Code](https://marketplace.visualstudio.com/items?itemName=yuntaengtaeng.vitrine), shows the gallery in a panel |
| `examples/react-basic` | Example app used during development |
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

```bash
pnpm install
pnpm run build            # build the plugin and gallery
pnpm run dev:example      # start the example app
pnpm run test             # run unit tests
pnpm run lint
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
