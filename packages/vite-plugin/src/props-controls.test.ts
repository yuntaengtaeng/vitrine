import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import ts from "typescript";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { analyzeProps, createTypeContext } from "./props-controls.js";

describe("analyzeProps", () => {
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
    return analyzeProps(file, "Box", createTypeContext(root)).controls;
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

  it("on으로 시작하는 함수 prop만 action, render prop과 컴포넌트 prop은 제외", () => {
    const file = path.join(root, "src", "Box.tsx");
    fs.writeFileSync(
      file,
      [
        'import type { ComponentType, ReactNode } from "react";',
        "export const Box = (props: {",
        "  onClick: () => void;",
        "  onChange?: (value: string) => void;",
        "  renderItem: () => ReactNode;",
        "  icon?: ComponentType;",
        "  online: boolean;",
        "}) => null;",
      ].join("\n"),
    );
    expect(analyzeProps(file, "Box", createTypeContext(root)).actions).toEqual(["onClick", "onChange"]);
  });

  it("찾는 export가 없으면 빈 controls 반환", () => {
    controlsFor("{ label: string }");
    const file = path.join(root, "src", "Box.tsx");
    expect(analyzeProps(file, "Missing", createTypeContext(root))).toEqual({ controls: {}, actions: [] });
  });

  it("tsconfig에 포함되지 않은 파일이면 빈 controls 반환", () => {
    const outside = path.join(root, "Outside.tsx");
    fs.writeFileSync(outside, "export const Box = (props: { label: string }) => null;\n");
    expect(analyzeProps(outside, "Box", createTypeContext(root))).toEqual({ controls: {}, actions: [] });
  });
});

describe("analyzeProps의 tsconfig project references", () => {
  let root: string;

  // create-vite react-ts 템플릿의 tsconfig.app.json 옵션
  const APP_OPTIONS = {
    tsBuildInfoFile: "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    target: "ES2022",
    lib: ["ES2022", "DOM", "DOM.Iterable"],
    module: "ESNext",
    skipLibCheck: true,
    moduleResolution: "bundler",
    allowImportingTsExtensions: true,
    verbatimModuleSyntax: true,
    moduleDetection: "force",
    noEmit: true,
    jsx: "react-jsx",
    strict: true,
  };

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "vitrine-props-references-"));
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  function writeJson(relative: string, value: unknown) {
    fs.mkdirSync(path.dirname(path.join(root, relative)), { recursive: true });
    fs.writeFileSync(path.join(root, relative), JSON.stringify(value));
  }

  /** 컴포넌트 파일을 만들고 그 파일의 추론된 controls 반환 */
  function controlsAt(relative: string, filePath = path.join(root, relative)) {
    fs.mkdirSync(path.dirname(path.join(root, relative)), { recursive: true });
    fs.writeFileSync(path.join(root, relative), 'export const Box = (props: { tone: "a" | "b" }) => null;\n');
    return analyzeProps(filePath, "Box", createTypeContext(root)).controls;
  }

  const TONE = { tone: { type: "select", options: ["a", "b"], optional: false, defaultValue: "a" } };

  it("create-vite 템플릿처럼 files가 비고 references만 있는 루트 tsconfig", () => {
    writeJson("tsconfig.json", { files: [], references: [{ path: "./tsconfig.app.json" }, { path: "./tsconfig.node.json" }] });
    writeJson("tsconfig.app.json", { compilerOptions: APP_OPTIONS, include: ["src"] });
    writeJson("tsconfig.node.json", { compilerOptions: { ...APP_OPTIONS, lib: ["ES2023"] }, include: ["vite.config.ts"] });
    expect(controlsAt("src/Box.tsx")).toEqual(TONE);
  });

  it("디렉터리를 가리키는 reference", () => {
    writeJson("tsconfig.json", { files: [], references: [{ path: "./app" }] });
    writeJson("app/tsconfig.json", { compilerOptions: APP_OPTIONS, include: ["src"] });
    expect(controlsAt("app/src/Box.tsx")).toEqual(TONE);
  });

  it("references 안에 다시 references가 있는 solution 구성", () => {
    writeJson("tsconfig.json", { files: [], references: [{ path: "./solution" }] });
    writeJson("solution/tsconfig.json", { files: [], references: [{ path: "../tsconfig.app.json" }] });
    writeJson("tsconfig.app.json", { compilerOptions: APP_OPTIONS, include: ["src"] });
    expect(controlsAt("src/Box.tsx")).toEqual(TONE);
  });

  it("서로를 참조하는 순환 references에서도 멈추고 분석", () => {
    writeJson("tsconfig.json", { files: [], references: [{ path: "./tsconfig.app.json" }] });
    writeJson("tsconfig.app.json", { compilerOptions: APP_OPTIONS, include: ["src"], references: [{ path: "./tsconfig.json" }] });
    expect(controlsAt("src/Box.tsx")).toEqual(TONE);
  });

  it("루트가 자기 파일과 references를 함께 가지면 루트 프로젝트 사용", () => {
    writeJson("tsconfig.json", { compilerOptions: APP_OPTIONS, include: ["src"], references: [{ path: "./tsconfig.node.json" }] });
    writeJson("tsconfig.node.json", { compilerOptions: APP_OPTIONS, include: ["vite.config.ts"] });
    expect(controlsAt("src/Box.tsx")).toEqual(TONE);
  });

  it("없는 tsconfig를 가리키는 reference는 건너뜀", () => {
    writeJson("tsconfig.json", { files: [], references: [{ path: "./missing.json" }, { path: "./tsconfig.app.json" }] });
    writeJson("tsconfig.app.json", { compilerOptions: APP_OPTIONS, include: ["src"] });
    expect(controlsAt("src/Box.tsx")).toEqual(TONE);
  });

  it.runIf(!ts.sys.useCaseSensitiveFileNames)("대소문자 구분이 없는 파일 시스템에서는 경로 대소문자가 달라도 분석", () => {
    writeJson("tsconfig.json", { files: [], references: [{ path: "./tsconfig.app.json" }] });
    writeJson("tsconfig.app.json", { compilerOptions: APP_OPTIONS, include: ["src"] });
    const file = path.join(root, "src", "Box.tsx");
    const swapped = file.replace(/^[a-z]/i, (drive) => (drive === drive.toLowerCase() ? drive.toUpperCase() : drive.toLowerCase()));
    expect(controlsAt("src/Box.tsx", swapped)).toEqual(TONE);
  });
});
