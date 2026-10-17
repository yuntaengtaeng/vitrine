import { describe, expect, it } from "vitest";
import { DEFAULT_VIEWPORTS, renderGalleryConfigModule, resolveViewports } from "./gallery-config.js";

describe("resolveViewports", () => {
  it("옵션이 없으면 기본 viewport", () => {
    expect(resolveViewports(undefined)).toEqual({ viewports: DEFAULT_VIEWPORTS });
  });

  it("기본 목록에 추가하거나 통째로 교체", () => {
    expect(resolveViewports((defaults) => [...defaults, { name: "Breakpoint", width: 800 }]).viewports).toHaveLength(4);
    expect(resolveViewports(() => [{ name: "Main", width: 800 }])).toEqual({ viewports: [{ name: "Main", width: 800 }] });
  });

  it("옵션 함수가 기본 목록을 고쳐도 다음 호출의 기본값은 그대로", () => {
    resolveViewports((defaults) => {
      defaults[0].width = 1;
      return defaults;
    });
    expect(resolveViewports(undefined).viewports[0].width).toBe(375);
  });

  it("이름이 겹치거나 너비가 정수가 아니면 기본값과 안내", () => {
    const duplicated = resolveViewports(() => [
      { name: "A", width: 400 },
      { name: "A", width: 500 },
    ]);
    expect(duplicated.viewports).toEqual(DEFAULT_VIEWPORTS);
    expect(duplicated.warning).toContain("[vitrine] viewports");
    expect(resolveViewports(() => [{ name: "A", width: 12.5 }]).warning).toBeDefined();
    expect(resolveViewports(() => "nope" as never).warning).toBeDefined();
  });

  it("옵션 함수가 throw해도 dev server를 멈추지 않고 기본값과 안내", () => {
    const result = resolveViewports(() => {
      throw new Error("oops");
    });
    expect(result.viewports).toEqual(DEFAULT_VIEWPORTS);
    expect(result.warning).toContain("oops");
  });
});

describe("renderGalleryConfigModule", () => {
  it("설정을 default export로 직렬화", () => {
    expect(renderGalleryConfigModule({ viewports: [{ name: "Main", width: 800 }], include: ["src/**/*.tsx"] })).toBe(
      'export default {"viewports":[{"name":"Main","width":800}],"include":["src/**/*.tsx"]};\n',
    );
  });
});
