import { createElement, Component } from "react";
import { createRoot } from "react-dom/client";
import previews from "virtual:vitrine-previews";

class PreviewErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return createElement(
        "pre",
        { style: { color: "#e11d48", whiteSpace: "pre-wrap", fontSize: "0.85rem" } },
        String(this.state.error.stack ?? this.state.error.message),
      );
    }
    return this.props.children;
  }
}

function el(tag, style, text) {
  const node = document.createElement(tag);
  if (style) node.style.cssText = style;
  if (text != null) node.textContent = text;
  return node;
}

function renderApp(entries) {
  const root = document.getElementById("vitrine-root");
  if (!root) return;

  root.style.cssText = "display:flex; height:100vh; margin:0; font-family:system-ui,sans-serif;";

  const sidebar = el(
    "div",
    "width:240px; flex-shrink:0; overflow-y:auto; border-right:1px solid #ddd; padding:0.5rem; box-sizing:border-box;",
  );
  const canvasWrapper = el("div", "flex:1; overflow:auto; padding:1.5rem; box-sizing:border-box;");
  const canvas = el("div", "");
  canvasWrapper.append(canvas);

  if (entries.length === 0) {
    sidebar.append(
      el("p", "color:#888; font-size:0.85rem;", "No @preview exports found yet. Add a `/** @preview */` comment above an export."),
    );
  }

  const reactRoot = createRoot(canvas);
  let activeButton = null;

  for (const entry of entries) {
    const item = el("button", "display:block; width:100%; text-align:left; padding:0.5rem; margin-bottom:2px; border:none; background:transparent; cursor:pointer; border-radius:4px; font-size:0.9rem;");
    item.textContent = entry.name;
    item.title = entry.file;

    item.addEventListener("click", async () => {
      if (activeButton) activeButton.style.background = "transparent";
      activeButton = item;
      item.style.background = "#e0e7ff";

      try {
        const mod = await entry.load();
        const Comp = mod[entry.exportName];
        if (typeof Comp !== "function") {
          throw new Error(`"${entry.exportName}" in ${entry.file} is not a component (got ${typeof Comp}).`);
        }
        reactRoot.render(createElement(PreviewErrorBoundary, null, createElement(Comp)));
      } catch (error) {
        reactRoot.render(
          createElement(
            "pre",
            { style: { color: "#e11d48", whiteSpace: "pre-wrap", fontSize: "0.85rem" } },
            String(error?.stack ?? error?.message ?? error),
          ),
        );
      }
    });

    sidebar.append(item);
  }

  root.append(sidebar, canvasWrapper);

  if (sidebar.firstElementChild instanceof HTMLButtonElement) {
    sidebar.firstElementChild.click();
  }
}

renderApp(previews);
