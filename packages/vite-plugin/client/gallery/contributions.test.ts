import { describe, expect, it } from "vitest";
import { VIEWS, resolveView } from "./contributions";

const variants = [
  { key: "primary", name: "Primary" },
  { key: "danger", name: "Danger" },
];

describe("resolveView", () => {
  it("고른 보기를 쓸 수 있으면 그 보기", () => {
    expect(resolveView(VIEWS, "variants", variants).id).toBe("variants");
  });

  it("variant가 하나 이하라 Variants를 쓸 수 없거나 모르는 id면 Single", () => {
    expect(resolveView(VIEWS, "variants", variants.slice(0, 1)).id).toBe("single");
    expect(resolveView(VIEWS, "matrix", variants).id).toBe("single");
  });
});
