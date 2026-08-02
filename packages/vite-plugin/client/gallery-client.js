import { createElement, Component } from "react";
import { createRoot } from "react-dom/client";
import previews from "virtual:vitrine-previews";

const COLOR = {
  border: "#e5e7eb",
  label: "#9ca3af",
  body: "#333",
  muted: "#888",
  error: "#e11d48",
  activeBg: "#eef2ff",
  activeText: "#4338ca",
  hoverBg: "#f3f4f6",
};

const STYLE = {
  root: "display:flex; height:100vh; margin:0; font-family:system-ui,sans-serif; background:white;",
  sidebar: `width:240px; flex-shrink:0; overflow-y:auto; background:white; border-right:1px solid ${COLOR.border}; padding:0.75rem; box-sizing:border-box;`,
  sidebarLabel: `font-size:0.75rem; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; color:${COLOR.label}; padding:0.4rem 0.7rem 0.7rem;`,
  canvasWrapper: "flex:1; overflow:auto; padding:2.5rem; box-sizing:border-box; display:flex; align-items:flex-start; justify-content:center;",
  canvas: "padding:2rem; min-width:200px; min-height:80px; box-sizing:border-box;",
  emptyState: `color:${COLOR.muted}; font-size:0.85rem; padding:0 0.7rem;`,
  sidebarItem: {
    base:
      `display:block; width:100%; text-align:left; padding:0.55rem 0.7rem; margin-bottom:2px; ` +
      `border:none; background:transparent; color:${COLOR.body}; cursor:pointer; border-radius:6px; ` +
      `font-size:0.88rem; font-family:inherit;`,
    active: `background:${COLOR.activeBg}; color:${COLOR.activeText}; font-weight:600;`,
    hover: `background:${COLOR.hoverBg};`,
  },
  errorText: { color: COLOR.error, whiteSpace: "pre-wrap", fontSize: "0.85rem" },
};

class PreviewErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return createElement(
        "pre",
        { style: STYLE.errorText },
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

  root.style.cssText = STYLE.root;

  const sidebar = el("div", STYLE.sidebar);
  sidebar.append(el("div", STYLE.sidebarLabel, "Previews"));

  const canvasWrapper = el("div", STYLE.canvasWrapper);
  const canvas = el("div", STYLE.canvas);
  canvasWrapper.append(canvas);

  if (entries.length === 0) {
    sidebar.append(
      el("p", STYLE.emptyState, "No @preview exports found yet. Add a `/** @preview */` comment above an export."),
    );
  }

  const reactRoot = createRoot(canvas);
  let activeButton = null;
  const buttonsById = new Map();

  for (const entry of entries) {
    const item = el("button", STYLE.sidebarItem.base);
    item.textContent = entry.name;
    item.title = entry.file;

    item.addEventListener("mouseenter", () => {
      if (item !== activeButton) item.style.cssText = STYLE.sidebarItem.base + STYLE.sidebarItem.hover;
    });
    item.addEventListener("mouseleave", () => {
      if (item !== activeButton) item.style.cssText = STYLE.sidebarItem.base;
    });

    item.addEventListener("click", async () => {
      if (activeButton) activeButton.style.cssText = STYLE.sidebarItem.base;
      activeButton = item;
      item.style.cssText = STYLE.sidebarItem.base + STYLE.sidebarItem.active;

      try {
        const mod = await entry.load();
        const Comp = mod[entry.exportName];
        if (typeof Comp !== "function") {
          throw new Error(`"${entry.exportName}" in ${entry.file} is not a component (got ${typeof Comp}).`);
        }
        reactRoot.render(createElement(PreviewErrorBoundary, null, createElement(Comp)));
      } catch (error) {
        reactRoot.render(
          createElement("pre", { style: STYLE.errorText }, String(error?.stack ?? error?.message ?? error)),
        );
      }
    });

    buttonsById.set(entry.id, item);
    sidebar.append(item);
  }

  root.append(sidebar, canvasWrapper);

  const firstItem = sidebar.querySelector("button");
  if (firstItem) firstItem.click();

  // 부모(webview 래퍼)가 에디터 커서 위치에 맞는 프리뷰 id를 postMessage로 전달하면 클릭과 동일하게 처리
  window.addEventListener("message", (event) => {
    if (event.source !== window.parent) return;
    if (event.data?.type !== "selectPreview") return;
    buttonsById.get(event.data.id)?.click();
  });
}

renderApp(previews);
