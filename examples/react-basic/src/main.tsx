import { createRoot } from "react-dom/client";

createRoot(document.getElementById("root")!).render(
  <p style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
    This is the example app's normal entry point. Open{" "}
    <a href="/__vitrine">/__vitrine</a> to see the vitrine preview gallery.
  </p>,
);
