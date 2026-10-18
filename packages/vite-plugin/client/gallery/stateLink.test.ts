import { describe, expect, it } from "vitest";
import { decodeStateLink, encodeStateLink } from "./stateLink";

describe("state link", () => {
  it("프리뷰, variant, 바꾼 값, globals를 hash로 왕복", () => {
    const link = {
      previewId: "src/Button.tsx#Button",
      variantKey: "danger",
      args: { label: "Delete & go", count: 2, disabled: true, icon: null },
      globals: { locale: "ko" },
    };
    expect(decodeStateLink(encodeStateLink(link))).toEqual(link);
  });

  it("비어 있는 값은 hash에 넣지 않음", () => {
    expect(encodeStateLink({ previewId: "Badge", variantKey: null, args: {}, globals: {} })).toBe("#preview=Badge");
  });

  it("읽을 수 없는 값은 버리고 나머지만 복원", () => {
    expect(decodeStateLink('#preview=Badge&args={"a":{"x":1},"b":"ok"}&globals=oops')).toEqual({
      previewId: "Badge",
      variantKey: null,
      args: { b: "ok" },
      globals: {},
    });
  });

  it("프리뷰가 없으면 null", () => {
    expect(decodeStateLink("")).toBeNull();
    expect(decodeStateLink("#variant=danger")).toBeNull();
  });
});
