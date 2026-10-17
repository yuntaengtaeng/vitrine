import { describe, expect, it } from "vitest";
import { fixedGlobals, parseGlobals } from "./previewGlobals";

describe("parseGlobals", () => {
  it("label과 default가 없으면 이름과 첫 선택지", () => {
    expect(parseGlobals({ theme: { options: ["light", "dark"] } })).toEqual({
      theme: { label: "theme", options: ["light", "dark"], defaultValue: "light" },
    });
  });

  it("선언이 없으면 빈 목록", () => {
    expect(parseGlobals(undefined)).toEqual({});
  });

  it("선택지가 없거나 문자열이 아니거나 default가 선택지 밖이면 이유와 함께 거절", () => {
    expect(() => parseGlobals({ theme: { options: [] } })).toThrow('global "theme" needs options');
    expect(() => parseGlobals({ size: { options: [1, 2] } })).toThrow('global "size" needs options');
    expect(() => parseGlobals({ theme: { options: ["light"], default: "dark" } })).toThrow("default must be one of");
    expect(() => parseGlobals(["theme"])).toThrow("must be an object");
  });
});

describe("fixedGlobals", () => {
  it("variant 고정값이 preview() 고정값을 덮어씀", () => {
    const config = { globals: { theme: "dark", locale: "en" }, variants: { ko: { globals: { locale: "ko" } } } };
    expect(fixedGlobals(config, "ko")).toEqual({ theme: "dark", locale: "ko" });
    expect(fixedGlobals(config, undefined)).toEqual({ theme: "dark", locale: "en" });
  });
});
