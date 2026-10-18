# vitrine

## 0.2.0

### Minor Changes

- 7be1358: Renewed gallery. Previews render in an isolated iframe, so media queries follow the selected viewport (Responsive, Mobile, Tablet, Desktop, or your own through the `viewports` option) and the stage background can be light, dark or transparent. New views: Variants side by side, Matrix for every combination of two props, and History to compare an earlier save (`snapshots` option). The panel adds an Actions tab that records `on*` prop calls, a Code tab, per-prop Reset, and keeps its height while you resize or collapse it. The setup file can export `globals` for toolbar values such as theme or locale. The address holds the current preview, variant, props and globals, and Copy link shares it. The gallery has a dark mode and a narrow layout for side panels.
  
  In VS Code the gallery follows the editor theme and can save the current props as a variant in your source file. Gallery and extension agree on these features when the panel opens, and an outdated side shows an update notice.
  
  Vitrine plugins (experimental): `vitrine({ plugins })` registers optional features. The first official plugin, `vitrine-plugin-static`, builds the gallery into static files with `vitrine-static build`.

### Patch Changes

- 0487c09: Show the detected project name instead of "No project detected" when its dev server is not reachable.

## 0.1.1

### Patch Changes

- d0f08ca: Ignore stale panel requests when switching projects or previews quickly.
