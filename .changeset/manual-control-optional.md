---
"vite-plugin-react-vitrine": patch
---

Controls declared in `preview()` for a prop without an inferred type, such as `children`, are no longer labeled "optional", because Vitrine can't tell whether the prop is required. A select control without a starting value still offers "Unset".
