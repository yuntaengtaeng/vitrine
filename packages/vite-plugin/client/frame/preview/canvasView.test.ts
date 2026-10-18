import { describe, expect, it } from "vitest";
import { resolveCanvasView } from "./canvasView";
import type { LoadedPreview } from "../previewConfig";

const preview: LoadedPreview = { component: () => null, config: {} };
const idle = { setupError: null, setupLoading: false, loadError: null, preview: null };

describe("resolveCanvasView", () => {
  it("setup 에러를 프리뷰 모듈 에러보다 먼저 표시", () => {
    const setupError = new Error("setup");
    expect(resolveCanvasView({ ...idle, setupError, loadError: new Error("module") })).toEqual({
      kind: "error",
      error: setupError,
    });
  });

  it("프리뷰 모듈 로드 에러 표시", () => {
    const loadError = new Error("module");
    expect(resolveCanvasView({ ...idle, loadError, preview })).toEqual({ kind: "error", error: loadError });
  });

  it("setup file을 읽는 중이면 프리뷰가 준비돼도 대기", () => {
    expect(resolveCanvasView({ ...idle, setupLoading: true, preview })).toEqual({ kind: "loading" });
  });

  it("모듈 로드 전에는 대기", () => {
    expect(resolveCanvasView(idle)).toEqual({ kind: "loading" });
  });

  it("에러 없이 로드가 끝나면 프리뷰 표시", () => {
    expect(resolveCanvasView({ ...idle, preview })).toEqual({ kind: "ready", preview });
  });
});
