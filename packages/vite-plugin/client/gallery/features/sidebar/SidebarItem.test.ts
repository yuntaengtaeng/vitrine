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

const renderItem = (overrides: { isActive?: boolean; failed?: boolean }) =>
  renderToStaticMarkup(
    createElement(SidebarItem, { entry, isActive: false, failed: false, onSelect: () => {}, ...overrides }),
  );

describe("SidebarItem", () => {
  it("선택된 항목만 aria-current로 표시", () => {
    const active = renderItem({ isActive: true });
    const inactive = renderItem({ isActive: false });
    expect(active).toContain('aria-current="true"');
    expect(inactive).not.toContain("aria-current");
  });

  it("렌더에 실패한 프리뷰만 오류 점 표시", () => {
    expect(renderItem({ failed: true })).toContain("failed to render");
    expect(renderItem({ failed: false })).not.toContain("failed to render");
  });
});
