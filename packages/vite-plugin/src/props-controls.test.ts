import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createTypeContext, getPropControls } from "./props-controls.js";

describe("getPropControls", () => {
  let root: string;

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "vitrine-props-controls-"));
    fs.mkdirSync(path.join(root, "src"));
    fs.writeFileSync(
      path.join(root, "tsconfig.json"),
      JSON.stringify({ compilerOptions: { jsx: "react-jsx", strict: true }, include: ["src"] }),
    );
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  /** props 타입 선언으로 컴포넌트 파일을 만들고 추론된 controls 반환 */
  function controlsFor(propsType: string, preamble = "") {
    const file = path.join(root, "src", "Box.tsx");
    fs.writeFileSync(file, `${preamble}\nexport const Box = (props: ${propsType}) => null;\n`);
    return getPropControls(file, "Box", createTypeContext(root));
  }

  it("단일 문자열 literal은 옵션 하나의 select로 추론", () => {
    expect(controlsFor("{ kind: 'card' }")).toEqual({
      kind: { type: "select", options: ["card"], optional: false, defaultValue: "card" },
    });
  });

  it("number literal union은 숫자 옵션 select로 추론", () => {
    expect(controlsFor("{ level?: 1 | 2 | 3 }")).toEqual({
      level: { type: "select", options: [1, 2, 3], optional: true },
    });
  });

  it("null과 undefined member는 제외하고 추론", () => {
    expect(controlsFor("{ title: string | null; size: 'sm' | 'md' | undefined }")).toEqual({
      title: { type: "text", optional: false, defaultValue: "" },
      size: { type: "select", options: ["sm", "md"], optional: false, defaultValue: "sm" },
    });
  });

  it("문자열 enum은 enum 값 select로 추론", () => {
    expect(controlsFor("{ tone: Tone }", "enum Tone { Info = 'info', Danger = 'danger' }")).toEqual({
      tone: { type: "select", options: ["info", "danger"], optional: false, defaultValue: "info" },
    });
  });

  it("literal이 아닌 혼합 union은 첫 member 기준으로 추론", () => {
    expect(controlsFor("{ value: string | number }")).toEqual({
      value: { type: "text", optional: false, defaultValue: "" },
    });
  });

  it("control로 표현할 수 없는 prop은 생략", () => {
    expect(controlsFor("{ data: { id: string }; onClick: () => void; items: string[] }")).toEqual({});
  });

  it("찾는 export가 없으면 빈 controls 반환", () => {
    controlsFor("{ label: string }");
    const file = path.join(root, "src", "Box.tsx");
    expect(getPropControls(file, "Missing", createTypeContext(root))).toEqual({});
  });

  it("tsconfig에 포함되지 않은 파일이면 빈 controls 반환", () => {
    const outside = path.join(root, "Outside.tsx");
    fs.writeFileSync(outside, "export const Box = (props: { label: string }) => null;\n");
    expect(getPropControls(outside, "Box", createTypeContext(root))).toEqual({});
  });
});
