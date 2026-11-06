---
"vite-plugin-react-vitrine": patch
---

Editing the setup file, or a file it imports, no longer reloads every page on the dev server, including your app. The open previews pick up the new wrapper and `globals` in place. The README shows how to allow the `globals` export in ESLint and oxlint.
