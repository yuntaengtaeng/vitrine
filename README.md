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
pnpm run test                # runs the Vitest suite
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

The dev server's port is detected automatically — no setting to configure.
The Vite plugin writes the resolved port to `<project-root>/.vitrine/port.json`
on startup (and self-`.gitignore`s that folder); the extension resolves which
project to target by walking up from the active editor's file, falling back
to a workspace-wide scan (prompting with a picker if more than one dev server
is running at once). A **Switch Project** button inside the panel lets you
jump to a different running project at any time, regardless of which file you
currently have open.

## Cursor-aware preview

Moving your cursor onto a `@preview`-annotated export automatically switches
the panel to that preview — no click needed. This only reacts within the
project the panel is currently showing; moving the cursor into a different
project's file does nothing (use **Switch Project** first). See Known issues
below.

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

Port auto-detection has been checked live end-to-end on the Vite plugin side
(the port/PID file is written on server start, removed on graceful
`server.close()`, and a killed process's PID is correctly detected as dead),
plus a Vitest suite covering both the plugin's file-writing logic and the
extension's discovery logic (walk-up, workspace scan, `node_modules`
exclusion, PID liveness). The extension-side picker UI for multiple
simultaneous dev servers, and the Switch Project button, have both been
exercised live in an Extension Development Host session with two dev servers
running at once.

Cursor-aware preview has been verified live end-to-end within a single
project: moving the cursor between `@preview` exports in the same file
switches the panel automatically. The line-range scanning (`scan.ts`) and
cursor-to-entry matching (`preview-lookup.ts`) are also covered by Vitest,
and the `/__vitrine/manifest` endpoint was checked directly against a live
dev server.

## Known issues

- **Cursor tracking doesn't cross projects.** If the panel is showing project
  A and you move your cursor into a file belonging to project B, nothing
  happens — cursor-aware preview is deliberately scoped to the
  currently-displayed project only, so it can't fight with a manual
  **Switch Project** choice. Switch projects explicitly first, then cursor
  tracking resumes within the new project. This is a scope decision, not a
  bug — worth revisiting if it turns out to be inconvenient in practice.

## Future direction (not implemented)

These were considered and deliberately deferred, not forgotten:

- Automatic component discovery (no `@preview` annotation needed)
- Manifest HMR (new/removed `@preview` reflected without a full reload)
- Props controls generated from TypeScript prop types
- Theme / responsive / zoom toggles
- Provider auto-detection (Router / QueryClient / ThemeProvider) and mocks
- Per-preview iframe isolation
- Split usage/guide docs out of this README into a dedicated docs site (e.g.
  VitePress) once there's enough content and real users to justify the
  build/deploy overhead
