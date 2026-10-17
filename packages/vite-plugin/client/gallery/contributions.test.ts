import { describe, expect, it } from "vitest";
import { VIEWS, resolveView } from "./contributions";

const variants = [
  { key: "primary", name: "Primary" },
  { key: "danger", name: "Danger" },
];
const boolControl = { disabled: { type: "boolean" as const, optional: false } };

describe("resolveView", () => {
  it("고른 보기를 쓸 수 있으면 그 보기", () => {
    expect(resolveView(VIEWS, "variants", { variants, controls: {} }).id).toBe("variants");
    expect(resolveView(VIEWS, "matrix", { variants: [], controls: boolControl }).id).toBe("matrix");
  });

  it("variant가 하나 이하거나 축이 될 prop이 없거나 모르는 id면 Single", () => {
    expect(resolveView(VIEWS, "variants", { variants: variants.slice(0, 1), controls: {} }).id).toBe("single");
    expect(resolveView(VIEWS, "matrix", { variants, controls: { label: { type: "text", optional: false } } }).id).toBe(
      "single",
    );
    expect(resolveView(VIEWS, "grid", { variants, controls: {} }).id).toBe("single");
  });
});
