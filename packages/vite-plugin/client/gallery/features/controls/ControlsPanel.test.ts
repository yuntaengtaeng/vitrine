import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { act, create } from "react-test-renderer";
import { describe, expect, it, vi } from "vitest";
import { ControlsPanel } from "./ControlsPanel";
import type { FrameControl } from "@vitrine/protocol";

const controls: Record<string, FrameControl> = {
  label: { type: "text", optional: false },
  size: { type: "select", options: ["sm", "md"], optional: false },
  count: { type: "number", optional: false },
  disabled: { type: "boolean", optional: false },
  tone: { type: "radio", options: ["info", "warning", "danger"], optional: false },
};

function renderControls(args: Record<string, unknown>, onChange = () => {}) {
  return createElement(ControlsPanel, { controls, args, onChange });
}

describe("ControlsPanel", () => {
  it("모든 입력에 prop 이름을 접근 가능한 이름으로 연결", () => {
    const markup = renderToStaticMarkup(renderControls({}));
    expect(markup).toContain('<input aria-label="label"');
    expect(markup).toContain('<select aria-label="size"');
    expect(markup).toContain('aria-label="count"');
    expect(markup).toContain('role="switch" aria-label="disabled"');
    expect(markup).toContain('role="radiogroup" aria-label="tone"');
  });

  it("radio는 선택된 항목만 Tab으로 진입 가능", () => {
    const markup = renderToStaticMarkup(renderControls({ tone: "warning" }));
    expect(markup).toMatch(/aria-checked="false" tabindex="-1"[^>]*>info</);
    expect(markup).toMatch(/aria-checked="true" tabindex="0"[^>]*>warning</);
  });

  it("radio에서 방향키를 누르면 다음 옵션을 선택", () => {
    const onChange = vi.fn();
    const renderer = create(renderControls({ tone: "danger" }, onChange));
    const danger = renderer.root.find((node) => node.props.role === "radio" && node.props.children === "danger");

    act(() => {
      danger.props.onKeyDown({ key: "ArrowRight", preventDefault: () => {} });
    });

    expect(onChange).toHaveBeenCalledWith("tone", "info");
  });
});
