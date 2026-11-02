---
"vite-plugin-react-vitrine": patch
---

`preview()` now does nothing in production builds, so bundlers remove the call and its config from your app. Previously the config object stayed in the bundle whenever the app imported a component that called `preview()`. The static Gallery build keeps the configs.
