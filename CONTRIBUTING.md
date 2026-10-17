# Contributing to Vitrine

[한국어](CONTRIBUTING.ko.md)

Thanks for your interest in Vitrine. This guide covers the product scope, the runtime
principles a change must not break, and what a pull request needs. For setup and commands,
see the [Development section of the README](README.md#development).

## Product scope

Vitrine shows previews of React component exports marked with `/** @preview */` in a VS Code
panel next to the file you are editing, rendered by your own Vite dev server. The editor is the
main interface, and previews are declared next to the export instead of in separate stories
files.

It supports controls based on TypeScript prop analysis, and args, control overrides and variants
through `preview()`. It does not aim to replace Storybook as a documentation platform, visual
regression tool or addon ecosystem.

Out of scope for now:

- Starting the Vite dev server automatically
- Frameworks other than React, such as Vue or Svelte
- Discovering components that have no `@preview`
- Storybook-level documentation, visual regression or addons

Changing this scope is a product decision before it is an implementation. Please open an issue
to discuss it before sending a pull request.

## Runtime principles

- Component module loading, transforms, HMR and rendering run in the user's Vite runtime.
- `vite-plugin-react-vitrine` and the gallery work in a browser without the VS Code extension.
  The extension is an optional editor adapter that adds project switching and cursor sync.
- The extension never parses, bundles or renders React source. It shows the gallery served by
  the Vite dev server in a webview iframe.
- Values that cross a runtime boundary, such as HTTP, the filesystem or `postMessage`, are
  explicit contracts in `packages/protocol`, and external input is validated at runtime.
- `@preview` discovery is based on export annotations identified by the parser, not on text
  search.

Package count, directory layout and generated asset paths are current implementation choices,
separate from these principles. The current structure is in
[`docs/architecture.md`](docs/architecture.md), and the reasons and revisit conditions for
decisions are in [`docs/adr/`](docs/adr/).

## Making a change

- Before placing new code, check which runtime runs it, who consumes it, which wire or
  filesystem boundary it crosses, and the dependency direction.
- A value that two runtimes must change together is a protocol candidate. A detail only one
  implementation uses stays inside that module.
- Do not promote an internal module to a package before it has a second consumer or an
  independent release need.
- Do not edit generated artifacts. Change the source and the build pipeline instead.
- Shape code by [`docs/code-philosophy.md`](docs/code-philosophy.md): single responsibility,
  readability and behavior-level testability come before any particular pattern.
- Follow the [comment style rules](.agents/skills/comment-style/SKILL.md) for comments and JSDoc.
- Known failures and pitfalls are recorded in [`docs/troubleshooting.md`](docs/troubleshooting.md).

The documents under `docs/` are currently written in Korean.

## Pull requests

- Run the smallest checks that prove your change does not regress anything. The checks for each
  kind of change are listed in the [development procedure](.agents/skills/vitrine-dev/SKILL.md).
- If user-facing behavior of a released package changes, add a changeset with `pnpm changeset`.
  See [`.changeset/README.md`](.changeset/README.md).
- Verify structural changes through build, tests and the package consumer boundary, not only in
  documentation.

This guide and [`CONTRIBUTING.ko.md`](CONTRIBUTING.ko.md) carry the same content and are updated
together.
