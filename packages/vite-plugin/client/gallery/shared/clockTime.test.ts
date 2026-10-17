import { describe, expect, it } from "vitest";
import { clockTime } from "./clockTime";

describe("clockTime", () => {
  const at = new Date(2026, 9, 18, 9, 5, 3, 7).getTime();

  it("시, 분, 초를 자리수 맞춰 표시", () => {
    expect(clockTime(at)).toBe("09:05:03");
  });

  it("요청하면 밀리초까지", () => {
    expect(clockTime(at, { milliseconds: true })).toBe("09:05:03.007");
  });
});
