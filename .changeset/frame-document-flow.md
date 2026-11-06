---
"vite-plugin-react-vitrine": minor
---

Previews now render in normal document flow with padding, instead of being centered in a flex container. Block-level components, and wrappers that render an element, fill the frame width as they do in your app, so layout fixes show up in the preview. Smaller components sit at the top left; see "Layout" in the README to center them with a wrapper. Components that return several siblings in a fragment no longer line up in a row, and an absolutely positioned element without inset values moves to the top left.
