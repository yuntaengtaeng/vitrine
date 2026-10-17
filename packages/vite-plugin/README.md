# vite-plugin-react-vitrine

[한국어](https://github.com/yuntaengtaeng/vitrine/blob/main/packages/vite-plugin/README.ko.md)

[Website](https://vitrine-4kr.pages.dev/) · [Documentation](https://vitrine-4kr.pages.dev/docs) · [VS Code extension](https://marketplace.visualstudio.com/items?itemName=yuntaengtaeng.vitrine)

Inline previews for React components, rendered by your own Vite dev server.

Put `/** @preview */` above a component export and it appears in a live gallery at
`/__vitrine`. No stories files, no separate build, no extra server.

```tsx
/** @preview */
export const PrimaryButton = () => <Button variant="primary">Save</Button>;
```

## Install

```bash
npm install -D vite-plugin-react-vitrine
# or
pnpm add -D vite-plugin-react-vitrine
```

## Setup

Add the plugin next to your React plugin:

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import vitrine from "vite-plugin-react-vitrine";

export default defineConfig({
  plugins: [react(), vitrine()],
});
```

Start your dev server as usual and open `http://localhost:5173/__vitrine`.

The plugin only runs in dev mode (`vite serve`). It adds nothing to your production build.

## Declaring previews

```tsx
/** @preview */
export const PrimaryButton = () => <Button variant="primary" />;

/** @preview name="Inputs/Danger button" */
export function DangerButton() {
  return <Button variant="danger" />;
}

/** @preview */
export default () => <Button variant="primary" />;
```

- Place the comment directly above `export const`, `export function` or `export default`.
- The sidebar label is the export name. Override it with `name="..."` (quotes required).
- A `/` in the name creates sidebar groups: `name="Inputs/Danger button"` shows
  "Danger button" inside the "Inputs" group.
- An anonymous default export is labeled with its file name.

## Controls and variants

Controls are generated from your component's prop types, including types imported
from other files. Supported types are `string`, `number`, `boolean`, string or
number literal unions and string enums. Props of other types, such as objects, functions,
arrays or `ReactNode`, get no control; pass sample values for them through `args`.

Required props start with an empty string, `0`, `false` or the first literal of a union.
Optional props start unset. Prop types are read through your `tsconfig.json`, so a component
file outside its `include` gets no controls.

Use `preview()` when you need sample values, a different control or named variants:

```tsx
import { preview } from "vite-plugin-react-vitrine/preview";

/** @preview */
export const Button = (props: ButtonProps) => <button>{props.children}</button>;

preview(Button, {
  args: { variant: "primary", children: "Save" },
  controls: { variant: "radio" },
  variants: {
    primary: { name: "Primary", args: { variant: "primary" } },
    danger: { name: "Danger", args: { variant: "danger" } },
  },
  defaultVariant: "primary",
});
```

| Option | Description |
| --- | --- |
| `args` | Initial prop values |
| `controls` | Control per prop: `"text"`, `"number"`, `"boolean"`, `"select"`, `"radio"`, or `{ type, options }` |
| `variants` | Named sets of args, switchable from the gallery |
| `defaultVariant` | Variant selected first. Defaults to the first key of `variants` |
| `wrapper` | React wrapper for this component preview, such as a router or provider |
| `globals` | Globals fixed for this preview, see [Globals](#globals) |

The wrapper only affects the preview. It does not change the exported component.

Function props whose names start with `on` and a capital letter, such as `onClick`, are
recorded: each call shows up in the gallery's Actions tab with its arguments. A function you pass
in `args` still runs and its return value is kept. Other function props, such as render props or
component props, are left alone.

## Providers, context and global CSS

Each preview renders in its own frame, so it does not inherit providers or global CSS from your
application. Fonts, CSS resets and Tailwind styles imported in `main.tsx` do not reach previews,
and text falls back to the browser's default font. Add a setup file when every preview needs the
same providers or stylesheets:

```tsx
// src/vitrine.preview.tsx
import type { PreviewWrapperProps } from "vite-plugin-react-vitrine/preview";
import { DarkModeProvider } from "./DarkModeProvider";
import "./index.css";

export default function PreviewSetup({ children }: PreviewWrapperProps) {
  return <DarkModeProvider>{children}</DarkModeProvider>;
}
```

Register the file relative to the Vite root:

```ts
vitrine({ setupFile: "./src/vitrine.preview.tsx" });
```

Include the file extension. The file must live inside the Vite root, and its path cannot contain
`#`, `?` or `%`. If the path is invalid or the file does not exist yet, your app keeps running
while the gallery and the terminal show the resolved path and the Vite root. The gallery reloads
once you create the file or fix an error in it.

The wrapper remains mounted while controls update the selected preview's props, so stateful
providers keep their state. Selecting another preview mounts a fresh preview tree. Use
`preview(Component, { wrapper: ComponentWrapper })` when only one component needs a provider.

## Globals

Globals are values that a provider sets for the whole app, such as theme or locale. Declare them
in the setup file and pick a value from the gallery toolbar instead of editing the file:

```tsx
// src/vitrine.preview.tsx
import type { PreviewGlobals, PreviewWrapperProps } from "vite-plugin-react-vitrine/preview";

export const globals = {
  locale: { label: "Locale", options: ["en", "ko"], default: "en" },
} as const satisfies PreviewGlobals;

// Name the prop something other than globals, or typeof globals refers to itself
export default function PreviewSetup({ children, globals: selected }: PreviewWrapperProps<typeof globals>) {
  return <LocaleProvider locale={selected.locale}>{children}</LocaleProvider>;
}
```

Options are strings, and `default` falls back to the first option. The wrapper from
`preview(Component, { wrapper })` receives the same `globals` prop. Changing a global remounts the
wrappers, so providers that read their value only on mount pick up the new one. The gallery keeps
your choice when you switch previews or reload.

A preview or a variant can fix a global. The toolbar then shows that value and does not let you
change it:

```ts
preview(Greeting, {
  globals: { locale: "en" },
  variants: { korean: { globals: { locale: "ko" } } },
});
```

## Plugin options

```ts
vitrine({
  // Glob patterns scanned for @preview, relative to the Vite root
  include: ["src/**/*.{tsx,jsx}"],
  // Module whose default export wraps every preview
  setupFile: "./src/vitrine.preview.tsx",
  // Edit the gallery's viewport presets (experimental)
  viewports: (defaults) => [...defaults, { name: "Breakpoint", width: 800 }],
  // Snapshot history settings, or false to turn it off (experimental)
  snapshots: { limit: 20 },
});
```

`include` defaults to `["src/**/*.{tsx,jsx}"]`. If the gallery says no previews were found
while your components live outside `src/`, add their folders to `include`.

Each preview renders in an iframe, so media queries follow the selected viewport width.
The defaults are Mobile 375px, Tablet 768px and Desktop 1280px. `viewports` receives them and
returns the list to show, so you can add, remove or replace presets. Responsive, which fills
the stage, is always available. Names must be unique and widths must be positive integers;
otherwise the plugin warns and keeps the defaults.

### Snapshot history

While the dev server runs, every save of a file with `@preview` is kept in memory, so the
gallery's History view can show an older version next to the current one, side by side or
overlaid. Snapshot 1 is the file when the server started, or when it got `@preview`. Saves with
syntax errors or unchanged content are skipped. Each file keeps Snapshot 1 and its latest saves,
20 in total by default. History ends when the server stops, the file is deleted or it loses
`@preview`, and renamed files start a new history.

An older version is rendered with the current version of the files it imports. If it no longer
exports the preview, its cell says so.

Editors that save on every keystroke can fill the history quickly. `shouldRecord` decides
whether a save is kept:

```ts
vitrine({
  snapshots: {
    limit: 30,
    // Keep at most one save every 3 seconds
    shouldRecord: ({ lastRecordedAt, now }) => lastRecordedAt === null || now - lastRecordedAt > 3000,
  },
});
```

## VS Code

Install [Vitrine for VS Code](https://marketplace.visualstudio.com/items?itemName=yuntaengtaeng.vitrine) to open the gallery beside your editor. The panel
follows your cursor and switches to the preview you are working on. The gallery also works
in any browser without it.

```bash
code --install-extension yuntaengtaeng.vitrine
```

To let the extension find your dev server, the plugin writes its port to
`.vitrine/port.json` in the project root. The folder ignores itself with its own
`.gitignore`, so it never shows up in your commits.

Inside VS Code, the Props tab can save the current props as a new variant: name it, and the
extension adds it to `preview()` in your file, creating the `preview()` call and its import if
needed. The edit goes through the editor, so undo works. It only applies when the file matches
what the gallery read, so it never overwrites unsaved changes. Anonymous default exports cannot
get variants, and functions or elements in props are not written. The gallery and the extension
agree on this and other features when the panel opens, and an outdated side shows a one-line
update notice.

## Compatibility

| Package | Supported versions |
| --- | --- |
| React | 18, 19 |
| Vite | 6.4+, 7, 8 |

## License

[MIT](./LICENSE)
