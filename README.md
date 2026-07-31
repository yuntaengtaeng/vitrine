# vitrine

[한국어](./README.ko.md)

> Bring the Jetpack Compose Preview experience to React — without leaving the editor.

Vitrine lets you annotate a component export with `/** @preview */` and see it
rendered live in a VS Code panel, right next to the file you're editing. No
`.stories.tsx` files, no separate browser tab, no manual registration.

## Philosophy

- **The editor is the primary interface.** The browser tab is a fallback, not
  the target experience.
- **Inline over separate files.** The differentiator versus Storybook / Ladle
  / Histoire is that a preview is a comment above the export it previews —
  not a parallel file to maintain.
- **Vite does the rendering, always.** The VS Code extension never bundles or
  renders anything itself; it opens a webview and points an `<iframe>` at a
  gallery page that Vite's dev server serves.

### Non-goals

- Not a Storybook replacement (no docs, controls, visual regression, addons).
- No automatic dev-server startup — start your project's `vite dev` yourself.
- No multi-framework support (Vue/Svelte previews are out of scope).
- No automatic component discovery — previews are explicit, via `@preview`.

## How it works

```
VS Code command  →  Webview panel  →  <iframe src="…/​__vitrine">
                                              │
                                     Vite dev server
                                    (@vitrine/vite-plugin)
                                              │
                                  scans @preview exports,
                                  serves a gallery page
```

Two packages, two responsibilities:

- **`packages/vite-plugin`** (`@vitrine/vite-plugin`) — the actual engine.
  Scans your source for `@preview`-annotated exports (via `@babel/parser`,
  not string search), and serves a gallery page at `/__vitrine` in dev mode.
- **`packages/vscode-extension`** (`vitrine`) — intentionally thin. One
  command (`Vitrine: Open Preview`) that opens a webview panel with an
  `<iframe>` pointing at your dev server's `/__vitrine` route.

## Declaring a preview

```tsx
export function Button({ variant }: { variant: "primary" | "danger" }) {
  /* ... */
}

/** @preview */
export const PrimaryButton = () => <Button variant="primary" />;

/** @preview name=Danger button */
export const DangerButton = () => <Button variant="danger" />;
```

- The comment must be a leading block comment directly above an
  `export const` or `export function`.
- `name=...` is optional; without it, the export's identifier is used as the
  label. The value runs to the end of the comment, so it may contain spaces
  (`name=Danger button` → label "Danger button").

## Usage

```bash
pnpm install
pnpm run build              # builds @vitrine/vite-plugin
pnpm run dev:example        # starts the example app's Vite dev server
```

Then open `http://localhost:5173/__vitrine` in a browser to see the gallery
directly, or run the VS Code extension:

```bash
pnpm run build:extension    # builds packages/vscode-extension
```

Open this folder in VS Code, press **F5** (uses `.vscode/launch.json`) to
launch an Extension Development Host, then run **Vitrine: Open Preview** from
the command palette. The dev server must already be running — if it isn't,
the panel shows a message instead of a blank screen.

`vitrine.devServerUrl` (VS Code setting) controls the target URL, default
`http://localhost:5173/__vitrine`.

## Verified so far

The Vite plugin side has been checked end-to-end against a live dev server:
the `/__vitrine` route, the `\0`-prefixed data virtual module
(`virtual:vitrine-previews`), the unprefixed gallery entry module
(`virtual:vitrine-preview-gallery`), and the AST scan (including the
`name=...` option with spaces) all resolve and serve correctly.

The VS Code extension side (webview CSP, iframe rendering, F5 debugging) has
also been verified live in an Extension Development Host session: the
`Vitrine: Open Preview` command opens a webview panel that correctly renders
the example app's previews from the dev server.

## Future direction (not implemented)

These were considered and deliberately deferred, not forgotten:

- Automatic component discovery (no `@preview` annotation needed)
- Cursor-aware preview (follow the active editor selection)
- Manifest HMR (new/removed `@preview` reflected without a full reload)
- Props controls generated from TypeScript prop types
- Theme / responsive / zoom toggles
- Provider auto-detection (Router / QueryClient / ThemeProvider) and mocks
- Per-preview iframe isolation
- Auto-detect the dev server's actual port (Vite picks a different port than
  `vitrine.devServerUrl`'s default when 5173 is taken). Likely approach: the
  vite-plugin writes the resolved URL to a file on server start; the
  extension reads it first and falls back to the configured setting.
