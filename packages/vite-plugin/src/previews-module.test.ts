import { describe, expect, it } from "vitest";
import { renderPreviewsModule } from "./previews-module.js";

describe("preview virtual module", () => {
  const evaluate = (code: string) =>
    import(`data:text/javascript,${encodeURIComponent(code)}`) as Promise<{
      loadPreviewSetup: (() => Promise<unknown>) | undefined;
    }>;

  it("존재하는 setup file을 Vite가 분석하는 정적 경로로 지연 import", () => {
    const moduleCode = renderPreviewsModule([], {
      status: "found",
      importPath: "/src/vitrine.preview.tsx",
    });
    expect(moduleCode).toContain('import("/src/vitrine.preview.tsx")');
  });

  it("누락된 setup file은 import 없이 안내 메시지로 reject", async () => {
    const moduleCode = renderPreviewsModule([], {
      status: "unavailable",
      message: '[vitrine] setupFile not found\n  setupFile: "./src/setup.tsx"',
    });
    expect(moduleCode).not.toContain("import(");

    const { loadPreviewSetup } = await evaluate(moduleCode);
    await expect(loadPreviewSetup?.()).rejects.toThrow(
      '[vitrine] setupFile not found\n  setupFile: "./src/setup.tsx"',
    );
  });

  it("setupFile 옵션이 없으면 loader를 제공하지 않음", async () => {
    const { loadPreviewSetup } = await evaluate(renderPreviewsModule([]));
    expect(loadPreviewSetup).toBeUndefined();
  });
});

describe("renderPreviewsModule entries", () => {
  const entry = {
    id: "src/Button.tsx#Button",
    name: "Button",
    file: "src/Button.tsx",
    exportName: "Button",
    startLine: 3,
    endLine: 9,
    controls: { label: { type: "text" as const, optional: false, defaultValue: "" } },
  };
  const evaluateEntries = async (code: string) =>
    ((await import(`data:text/javascript,${encodeURIComponent(code.replace(/import\(/g, "(async () => ({}))("))}`)) as {
      default: Record<string, unknown>[];
    }).default;

  it("Gallery 필드와 지연 import loader를 직렬화", async () => {
    const [item] = await evaluateEntries(renderPreviewsModule([entry]));
    expect(item).toMatchObject({
      id: entry.id,
      name: "Button",
      file: "src/Button.tsx",
      exportName: "Button",
      controls: entry.controls,
    });
    expect(typeof item.load).toBe("function");
    expect(renderPreviewsModule([entry])).toContain('import("/src/Button.tsx")');
  });

  it("줄 번호가 바뀌어도 module 내용이 같아 Gallery reload가 생기지 않음", () => {
    const moved = { ...entry, startLine: 30, endLine: 36 };
    expect(renderPreviewsModule([moved])).toBe(renderPreviewsModule([entry]));
  });
});
