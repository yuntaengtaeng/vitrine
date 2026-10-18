import { describe, expect, it } from "vitest";
import { parseGlobalSelection } from "./useGlobalSelection";

describe("parseGlobalSelection", () => {
  it("문자열 값만 복원", () => {
    expect(parseGlobalSelection('{"theme":"dark","size":2}')).toEqual({ theme: "dark" });
  });

  it("비었거나 깨진 값은 빈 선택", () => {
    expect(parseGlobalSelection(null)).toEqual({});
    expect(parseGlobalSelection("{oops")).toEqual({});
    expect(parseGlobalSelection('["dark"]')).toEqual({});
  });
});
