import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  getPreviewSetupModule,
  needsPreviewSetupRecovery,
  resolvePreviewSetupPath,
  type PreviewSetupGraphNode,
  type PreviewSetupPath,
} from "./preview-setup.js";

const root = path.resolve("project");

const expectValid = (setup: PreviewSetupPath) => {
  if (setup.status !== "valid") throw new Error(`expected valid setup path\n${setup.message}`);
  return setup;
};

const expectInvalidMessage = (setup: PreviewSetupPath) => {
  if (setup.status !== "invalid") throw new Error("expected invalid setup path");
  return setup.message;
};

describe("resolvePreviewSetupPath", () => {
  it("Vite root 기준 상대 경로를 절대 경로와 import 경로로 변환", () => {
    expect(resolvePreviewSetupPath(root, "./src/vitrine.preview.tsx")).toEqual({
      status: "valid",
      setupFile: "./src/vitrine.preview.tsx",
      filePath: path.join(root, "src", "vitrine.preview.tsx"),
      importPath: "/src/vitrine.preview.tsx",
    });
  });

  it("Windows separator와 root 안의 절대 경로를 같은 import 경로로 정규화", () => {
    expect(expectValid(resolvePreviewSetupPath(root, ".\\src\\setup.tsx")).importPath).toBe(
      "/src/setup.tsx",
    );
    expect(
      expectValid(resolvePreviewSetupPath(root, path.join(root, "src", "setup.tsx"))).importPath,
    ).toBe("/src/setup.tsx");
  });

  it("공백과 한글 파일명은 그대로 import 경로로 유지", () => {
    expect(expectValid(resolvePreviewSetupPath(root, "src/설정 파일.tsx")).importPath).toBe(
      "/src/설정 파일.tsx",
    );
  });

  it("root 밖 경로를 입력값, 해석 경로, root 안내와 함께 invalid 처리", () => {
    const message = expectInvalidMessage(resolvePreviewSetupPath(root, "../shared/setup.tsx"));
    expect(message).toContain("setupFile must point to a file inside the Vite root");
    expect(message).toContain("setupFile: ../shared/setup.tsx");
    expect(message).toContain(`resolved: ${path.resolve(root, "../shared/setup.tsx")}`);
    expect(message).toContain(`Vite root: ${root}`);
  });

  it("root 자체와 이름이 ..로 시작하는 root 내부 파일을 구분", () => {
    expect(expectInvalidMessage(resolvePreviewSetupPath(root, "."))).toContain("inside the Vite root");
    expect(expectValid(resolvePreviewSetupPath(root, "..setup.tsx")).importPath).toBe("/..setup.tsx");
  });

  it("Vite가 제공할 수 없는 #, ?, % 경로를 이름 변경 안내와 함께 invalid 처리", () => {
    for (const setupFile of ["src/setup #1.tsx", "src/setup?.tsx", "src/50% setup.tsx"]) {
      expect(expectInvalidMessage(resolvePreviewSetupPath(root, setupFile))).toContain("rename the file");
    }
  });
});

describe("getPreviewSetupModule", () => {
  const setup = resolvePreviewSetupPath(root, "./src/vitrine.preview.tsx");

  it("일반 파일이 있으면 import 경로 제공", () => {
    expect(getPreviewSetupModule(setup, root, true)).toEqual({
      status: "found",
      importPath: "/src/vitrine.preview.tsx",
    });
  });

  it("파일이 없으면 기준 root와 해석 경로를 담은 안내 생성", () => {
    const setupModule = getPreviewSetupModule(setup, root, false);
    expect(setupModule.status).toBe("unavailable");
    if (setupModule.status !== "unavailable") return;
    expect(setupModule.message).toContain("setupFile not found");
    expect(setupModule.message).toContain(`resolved: ${expectValid(setup).filePath}`);
    expect(setupModule.message).toContain(`Vite root: ${root}`);
    expect(setupModule.message).not.toContain("file extension");
  });

  it("확장자 없는 경로가 파일이 아니면 확장자 안내 추가", () => {
    const setupModule = getPreviewSetupModule(resolvePreviewSetupPath(root, "./src/setup"), root, false);
    expect(setupModule).toMatchObject({ status: "unavailable" });
    if (setupModule.status !== "unavailable") return;
    expect(setupModule.message).toContain("setupFile needs the file extension");
  });

  it("invalid 경로는 파일 확인 결과와 무관하게 같은 안내로 unavailable 처리", () => {
    const invalid = resolvePreviewSetupPath(root, "../setup.tsx");
    expect(getPreviewSetupModule(invalid, root, true)).toEqual({
      status: "unavailable",
      message: expectInvalidMessage(invalid),
    });
  });
});

describe("needsPreviewSetupRecovery", () => {
  const setupFilePath = path.join(root, "src", "setup.tsx");
  const node = (
    file: string,
    isSelfAccepting: boolean | undefined,
    importers: PreviewSetupGraphNode[] = [],
  ): PreviewSetupGraphNode => ({ file, isSelfAccepting, importers: new Set(importers) });

  it("변환에 성공한 적 없는 setup module 변경은 복구 대상", () => {
    expect(needsPreviewSetupRecovery([node(setupFilePath, undefined)], setupFilePath)).toBe(true);
  });

  it("setup이 import하는 변환 실패 module 변경도 복구 대상", () => {
    const setup = node(setupFilePath, true);
    const provider = node(path.join(root, "src", "Provider.tsx"), undefined, [setup]);
    const theme = node(path.join(root, "src", "theme.ts"), undefined, [provider]);
    expect(needsPreviewSetupRecovery([theme], setupFilePath)).toBe(true);
  });

  it("정상 HMR 경계가 있거나 setup tree 밖인 module은 Vite HMR에 맡김", () => {
    expect(needsPreviewSetupRecovery([node(setupFilePath, true)], setupFilePath)).toBe(false);
    const preview = node(path.join(root, "src", "Badge.tsx"), undefined, [
      node(path.join(root, "src", "App.tsx"), true),
    ]);
    expect(needsPreviewSetupRecovery([preview], setupFilePath)).toBe(false);
  });

  it("순환 import가 있어도 탐색 종료", () => {
    const a = node(path.join(root, "src", "a.ts"), undefined);
    const b = node(path.join(root, "src", "b.ts"), undefined, [a]);
    a.importers.add(b);
    expect(needsPreviewSetupRecovery([a], setupFilePath)).toBe(false);
  });
});
