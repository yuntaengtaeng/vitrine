import type { TextEdit } from "@vitrine/protocol";
import { describe, expect, it } from "vitest";
import { planVariantEdit, variantKeyFor } from "./variant-edit.js";

// 확장이 버퍼에 적용하는 것과 같은 결과를 보기 위해 뒤에서부터 적용
function apply(source: string, edits: readonly TextEdit[]): string {
  return [...edits]
    .sort((a, b) => b.start - a.start)
    .reduce((text, edit) => text.slice(0, edit.start) + edit.text + text.slice(edit.end), source);
}

function saved(source: string, exportName: string, name: string, args: Record<string, string | number | boolean>) {
  const plan = planVariantEdit(source, exportName, name, args);
  if (!plan.ok) throw new Error(plan.reason);
  return apply(source, plan.edits);
}

describe("variantKeyFor", () => {
  it("표시 이름을 camelCase key로, 숫자로 시작하면 접두어", () => {
    expect(variantKeyFor("Big danger")).toBe("bigDanger");
    expect(variantKeyFor("2 columns!")).toBe("variant2Columns");
  });
});

describe("planVariantEdit", () => {
  it("preview()의 variants 끝에 같은 들여쓰기로 더함", () => {
    const source = [
      'import { preview } from "vite-plugin-react-vitrine/preview";',
      "export const Button = () => null;",
      "preview(Button, {",
      "  variants: {",
      '    primary: { name: "Primary", args: { variant: "primary" } },',
      "  },",
      "});",
      "",
    ].join("\n");
    expect(saved(source, "Button", "Big danger", { variant: "danger", "aria-label": "Delete", count: 2 })).toContain(
      '    primary: { name: "Primary", args: { variant: "primary" } },\n    bigDanger: { name: "Big danger", args: { variant: "danger", "aria-label": "Delete", count: 2 } },\n  },',
    );
  });

  it("variants가 없으면 preview() 설정에 variants를 만듦", () => {
    const source = [
      'import { preview } from "vite-plugin-react-vitrine/preview";',
      "export const Toast = () => null;",
      'preview(Toast, { args: { message: "Saved" } });',
      "",
    ].join("\n");
    expect(saved(source, "Toast", "Long", { message: "A longer message" })).toContain(
      'args: { message: "Saved" },\nvariants: {\n  long: { name: "Long", args: { message: "A longer message" } },\n}',
    );
  });

  it("preview()가 없으면 import와 호출을 새로 만듦", () => {
    const source = "export const Badge = () => null;\n";
    const result = saved(source, "Badge", "New", { tone: "info" });
    expect(result.startsWith('import { preview } from "vite-plugin-react-vitrine/preview";\n')).toBe(true);
    expect(result.endsWith(
      'preview(Badge, {\n  variants: {\n    new: { name: "New", args: { tone: "info" } },\n  },\n});\n',
    )).toBe(true);
  });

  it("이름 있는 default export는 지역 이름으로 preview()를 부름", () => {
    expect(saved("const Chip = () => null;\nexport default Chip;\n", "default", "Small", {})).toContain(
      "preview(Chip, {",
    );
  });

  it("익명 default export, 이미 있는 key, 문법 오류는 이유와 함께 거절", () => {
    expect(planVariantEdit("export default () => null;\n", "default", "A", {})).toMatchObject({ ok: false });
    const withVariant = [
      'import { preview } from "vite-plugin-react-vitrine/preview";',
      "export const B = () => null;",
      'preview(B, { variants: { big: { args: {} } } });',
    ].join("\n");
    expect(planVariantEdit(withVariant, "B", "Big", {})).toEqual({ ok: false, reason: 'A variant named "big" already exists' });
    expect(planVariantEdit("export const B = (", "B", "Big", {})).toMatchObject({ ok: false });
  });
});
