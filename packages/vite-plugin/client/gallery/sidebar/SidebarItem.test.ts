import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SidebarItem } from "./SidebarItem";

const entry: GalleryPreviewEntry = {
  id: "Button",
  name: "Button",
  file: "Button.tsx",
  exportName: "default",
  controls: {},
  load: async () => ({}),
};

describe("SidebarItem", () => {
  it("선택된 항목만 aria-current로 표시", () => {
    const active = renderToStaticMarkup(createElement(SidebarItem, { entry, isActive: true, onSelect: () => {} }));
    const inactive = renderToStaticMarkup(createElement(SidebarItem, { entry, isActive: false, onSelect: () => {} }));
    expect(active).toContain('aria-current="true"');
    expect(inactive).not.toContain("aria-current");
  });
});
