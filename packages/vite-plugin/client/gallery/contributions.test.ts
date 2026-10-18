import { describe, expect, it } from "vitest";
import { VIEWS, resolveView } from "./contributions";

const variants = [
  { key: "primary", name: "Primary" },
  { key: "danger", name: "Danger" },
];
const boolControl = { disabled: { type: "boolean" as const, optional: false } };
const none = { variants: [], controls: {}, snapshotCount: 0 };

describe("resolveView", () => {
  it("고른 보기를 쓸 수 있으면 그 보기", () => {
    expect(resolveView(VIEWS, "variants", { ...none, variants }).id).toBe("variants");
    expect(resolveView(VIEWS, "matrix", { ...none, controls: boolControl }).id).toBe("matrix");
    expect(resolveView(VIEWS, "history", { ...none, snapshotCount: 2 }).id).toBe("history");
  });

  it("쓸 조건이 안 되거나 모르는 id면 Single", () => {
    expect(resolveView(VIEWS, "variants", { ...none, variants: variants.slice(0, 1) }).id).toBe("single");
    expect(resolveView(VIEWS, "matrix", { ...none, controls: { label: { type: "text", optional: false } } }).id).toBe(
      "single",
    );
    expect(resolveView(VIEWS, "history", { ...none, snapshotCount: 1 }).id).toBe("single");
    expect(resolveView(VIEWS, "grid", { ...none, variants }).id).toBe("single");
  });
});
