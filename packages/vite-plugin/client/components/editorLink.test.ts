import { describe, expect, it } from "vitest";
import { isEmbeddedInFrame, openInEditorUrl } from "./editorLink";

describe("isEmbeddedInFrame", () => {
  it("최상위 창이면 embedded 아님", () => {
    const win = {} as { self: unknown; top: unknown };
    win.self = win;
    win.top = win;
    expect(isEmbeddedInFrame(win)).toBe(false);
  });

  it("다른 창 안의 iframe이면 embedded", () => {
    expect(isEmbeddedInFrame({ self: {}, top: {} })).toBe(true);
  });

  it("top 접근이 막히면 embedded로 판단", () => {
    const win = {
      self: {},
      get top(): unknown {
        throw new Error("blocked");
      },
    };
    expect(isEmbeddedInFrame(win)).toBe(true);
  });
});

describe("openInEditorUrl", () => {
  it("preview id를 query로 encode", () => {
    expect(openInEditorUrl("src/Button.tsx#Button")).toBe("/__vitrine/open-in-editor?id=src%2FButton.tsx%23Button");
  });
});
