# Vitrine for VS Code

[Website](https://vitrine-4kr.pages.dev/) · [Live demo](https://vitrine-4kr.pages.dev/demo/) · [Documentation](https://vitrine-4kr.pages.dev/docs) · [Vite plugin](https://www.npmjs.com/package/vite-plugin-react-vitrine)

See your React component previews beside the file you are editing.

Vitrine shows the gallery served by
[vite-plugin-react-vitrine](https://www.npmjs.com/package/vite-plugin-react-vitrine) in a
VS Code panel. Your Vite dev server does all the rendering, so previews look exactly like
your app.

![The Vitrine Gallery in dark mode with a profile card preview](https://raw.githubusercontent.com/yuntaengtaeng/vitrine/main/apps/website/public/screenshots/gallery-dark.png)

## Features

- **Preview panel.** Run **Vitrine: Open Preview** to open the gallery next to your editor.
- **Follows your cursor.** Move the cursor onto a `/** @preview */` export and the panel
  switches to that preview.
- **Save as variant.** Turn the props you set in the gallery into a named variant. The
  extension adds it to `preview()` in your file through the editor, so undo works, and only
  when the file matches what the gallery read.
- **Matches your theme.** The gallery follows the VS Code light or dark theme.
- **Finds your dev server.** The panel connects to the project of the active file. If
  several dev servers are running, you pick one. **Switch Project** changes it at any time.
- **Stays out of your way.** The preview's editor group is locked, so files you open land in
  your code editor instead of covering the preview. To turn this off, set
  `"mainThreadWebview-vitrine.preview": false` in `workbench.editor.autoLockGroups`.

## Requirements

1. Add `vite-plugin-react-vitrine` to your Vite config. See the
   [plugin README](https://github.com/yuntaengtaeng/vitrine/tree/main/packages/vite-plugin#readme).
2. Start your Vite dev server. The extension does not start it for you.

Save as variant and theme sync need `vite-plugin-react-vitrine` 0.2 or later. With an older
plugin the panel keeps working without them.

## Usage

1. Open a component file with a `/** @preview */` export.
2. Run **Vitrine: Open Preview** from the command palette.
3. Move your cursor between previews, or pick one from the gallery sidebar.

## Known limitations

- Cursor tracking only works inside the project the panel is showing. Use
  **Switch Project** to follow a file from another project.

## License

[MIT](./LICENSE)
