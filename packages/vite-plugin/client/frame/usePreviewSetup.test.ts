import { PREVIEW_SETUP_RECOVER_EVENT } from "@vitrine/protocol";
import { createElement } from "react";
import { act, create } from "react-test-renderer";
import { describe, expect, it } from "vitest";
import { reloadOnNextHotUpdate, usePreviewSetup } from "./usePreviewSetup";

describe("usePreviewSetup", () => {
  it("React component가 아닌 default export를 오류로 반환", async () => {
    let message: string | undefined;
    const loadSetup = async () => ({ default: "not a component" });
    const Probe = () => {
      const state = usePreviewSetup(loadSetup);
      message = state.error?.message;
      return null;
    };

    await act(async () => {
      create(createElement(Probe));
    });

    expect(message).toContain("must default export a React wrapper component");
  });

  it("setup module 평가 실패를 오류로 반환", async () => {
    let message: string | undefined;
    const loadSetup = async () => {
      throw new Error("setup failed");
    };
    const Probe = () => {
      const state = usePreviewSetup(loadSetup);
      message = state.error?.message;
      return null;
    };

    await act(async () => {
      create(createElement(Probe));
    });

    expect(message).toBe("setup failed");
  });
});

describe("reloadOnNextHotUpdate", () => {
  const createHot = () => {
    const listeners = new Map<string, Set<() => void>>();
    const listenersOf = (event: string) => {
      if (!listeners.has(event)) listeners.set(event, new Set());
      return listeners.get(event)!;
    };
    return {
      on: (event: string, listener: () => void) => listenersOf(event).add(listener),
      off: (event: string, listener: () => void) => listenersOf(event).delete(listener),
      emit: (event: string) => listenersOf(event).forEach((listener) => listener()),
      emitUpdate: () => listenersOf("vite:beforeUpdate").forEach((listener) => listener()),
    };
  };

  it("구독 중 HMR 갱신이 오면 reload", () => {
    const hot = createHot();
    let reloads = 0;
    reloadOnNextHotUpdate(hot, () => (reloads += 1));

    hot.emitUpdate();
    expect(reloads).toBe(1);
  });

  it("plugin의 setup 복구 신호가 오면 reload", () => {
    const hot = createHot();
    let reloads = 0;
    reloadOnNextHotUpdate(hot, () => (reloads += 1));

    hot.emit(PREVIEW_SETUP_RECOVER_EVENT);
    expect(reloads).toBe(1);
  });

  it("구독 해제 후 갱신은 무시", () => {
    const hot = createHot();
    let reloads = 0;
    const unsubscribe = reloadOnNextHotUpdate(hot, () => (reloads += 1));

    unsubscribe();
    hot.emitUpdate();
    hot.emit(PREVIEW_SETUP_RECOVER_EVENT);
    expect(reloads).toBe(0);
  });

  it("HMR client가 없으면 아무 동작 없음", () => {
    expect(() => reloadOnNextHotUpdate(undefined, () => {})()).not.toThrow();
  });
});
