import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PreviewErrorBoundary } from "./PreviewErrorBoundary";

const Crash = ({ crash }: { crash: boolean }) => {
  if (crash) throw new Error("boom");
  return createElement("span", null, "ok");
};

const boundary = (crash: boolean, resetKey: string, onError = vi.fn(), onRendered = vi.fn()) =>
  createElement(PreviewErrorBoundary, { resetKey, onError, onRendered }, createElement(Crash, { crash }));

describe("PreviewErrorBoundary", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("처음부터 실패하면 성공으로 알리지 않음", () => {
    const onError = vi.fn();
    const onRendered = vi.fn();
    act(() => {
      create(boundary(true, "a", onError, onRendered));
    });
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: "boom" }));
    expect(onRendered).not.toHaveBeenCalled();
  });

  it("resetKey가 바뀌면 다시 렌더링하고 복구를 알림", () => {
    const onError = vi.fn();
    const onRendered = vi.fn();
    let renderer!: ReactTestRenderer;
    act(() => {
      renderer = create(boundary(true, "a", onError, onRendered));
    });
    act(() => {
      renderer.update(boundary(false, "b", onError, onRendered));
    });
    expect(renderer.toJSON()).toEqual(expect.objectContaining({ type: "span", children: ["ok"] }));
    expect(onRendered).toHaveBeenCalledTimes(1);
  });

  it("resetKey가 같으면 에러를 유지", () => {
    let renderer!: ReactTestRenderer;
    act(() => {
      renderer = create(boundary(true, "a"));
    });
    act(() => {
      renderer.update(boundary(false, "a"));
    });
    expect(renderer.toJSON()).toEqual(expect.objectContaining({ type: "pre" }));
  });
});
