import { describe, expect, it } from "vitest";
import { singleLayout, variantsLayout } from "./viewLayouts";

describe("variantsLayout", () => {
  it("variant마다 칸 하나, 바꾼 값은 모든 칸에 적용", () => {
    const layout = variantsLayout({
      variants: [
        { key: "primary", name: "Primary" },
        { key: "danger", name: "Danger" },
      ],
      overrides: { label: "Save" },
    });
    expect(layout).toEqual({
      kind: "grid",
      cells: [
        { key: "primary", label: "Primary", variantKey: "primary", args: { label: "Save" } },
        { key: "danger", label: "Danger", variantKey: "danger", args: { label: "Save" } },
      ],
    });
  });
});

describe("singleLayout", () => {
  it("메시지의 variant와 값으로 하나만 그림", () => {
    expect(singleLayout()).toEqual({ kind: "single" });
  });
});
