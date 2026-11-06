---
"vite-plugin-react-vitrine": patch
---

Prop controls and action logging now work in projects whose root `tsconfig.json` only lists project references, the layout `create-vite` generates. Previously every preview in such a project showed no controls. Vitrine now follows the references, including references to a directory and nested references, and analyzes each component with the project that includes it.
