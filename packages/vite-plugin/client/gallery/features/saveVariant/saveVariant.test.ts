import { describe, expect, it } from "vitest";
import { savableArgs } from "./saveVariant";

describe("savableArgs", () => {
  it("소스에 쓸 수 있는 문자열, 숫자, boolean만", () => {
    expect(savableArgs({ a: "x", b: 2, c: false, d: undefined, e: null, f: () => {}, g: Number.NaN })).toEqual({
      a: "x",
      b: 2,
      c: false,
    });
  });
});
