# vite-plugin-react-vitrine

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
from other files. Supported types are `string`, `number`, `boolean` and string or
number literal unions.

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

`preview()` only registers metadata. It does not wrap or change your component.

## Plugin options

```ts
vitrine({
  // Glob patterns scanned for @preview, relative to the Vite root
  include: ["src/**/*.{tsx,jsx}"],
});
```

## VS Code

A companion VS Code extension that opens the gallery beside your editor and follows
your cursor is in development. The gallery works in any browser without it.

To let the extension find your dev server, the plugin writes its port to
`.vitrine/port.json` in the project root. The folder ignores itself with its own
`.gitignore`, so it never shows up in your commits.

## Compatibility

| Package | Supported versions |
| --- | --- |
| React | 18, 19 |
| Vite | 6.4+, 7, 8 |

## License

[MIT](./LICENSE)
