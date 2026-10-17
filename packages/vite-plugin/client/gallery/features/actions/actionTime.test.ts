import { describe, expect, it } from "vitest";
import { formatActionTime } from "./actionTime";

describe("formatActionTime", () => {
  it("시, 분, 초, 밀리초를 자리수 맞춰 표시", () => {
    expect(formatActionTime(new Date(2026, 9, 18, 9, 5, 3, 7).getTime())).toBe("09:05:03.007");
  });
});
