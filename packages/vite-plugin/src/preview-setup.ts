import path from "node:path";

/** setupFile 옵션을 Vite root 기준으로 해석한 결과 */
export type PreviewSetupPath =
  | {
      status: "valid";
      /** 사용자가 옵션에 적은 원래 값 */
      setupFile: string;
      /** setup module의 절대 filesystem 경로 */
      filePath: string;
      /** Vite가 resolve할 root 기준 import 경로 */
      importPath: string;
    }
  | { status: "invalid"; message: string };

/** 갤러리가 setup module을 불러올 수 있는지 판단한 결과 */
export type PreviewSetupModule =
  | { status: "found"; importPath: string }
  | { status: "unavailable"; message: string };

/** HMR 복구 판단에 필요한 Vite module graph node의 최소 형태 */
export interface PreviewSetupGraphNode {
  file: string | null;
  isSelfAccepting?: boolean;
  importers: Set<PreviewSetupGraphNode>;
}

// Vite가 module 경로의 #, ?, %를 URL fragment, query, escape로 해석해 해당 파일을 제공하지 못함
const UNSUPPORTED_PATH_CHARACTERS = /[#?%]/;

/** setupFile을 Vite root 안의 절대 경로와 import 경로로 변환, 지원하지 않는 경로면 안내 메시지 */
export function resolvePreviewSetupPath(root: string, setupFile: string): PreviewSetupPath {
  const filePath = path.resolve(root, setupFile.replaceAll("\\", "/"));
  const location = describeSetupLocation(setupFile, filePath, root);
  const relativePath = path.relative(root, filePath);
  if (
    relativePath === "" ||
    relativePath === ".." ||
    relativePath.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relativePath)
  ) {
    return {
      status: "invalid",
      message: `[vitrine] setupFile must point to a file inside the Vite root\n${location}`,
    };
  }

  const importPath = "/" + relativePath.split(path.sep).join("/");
  if (UNSUPPORTED_PATH_CHARACTERS.test(importPath)) {
    return {
      status: "invalid",
      message:
        `[vitrine] setupFile path cannot contain "#", "?" or "%" because Vite cannot load it, rename the file\n` +
        location,
    };
  }

  return { status: "valid", setupFile, filePath, importPath };
}

/** 경로 해석 결과와 실제 파일 여부로 갤러리용 setup module 상태 생성 */
export function getPreviewSetupModule(
  setup: PreviewSetupPath,
  root: string,
  isFile: boolean,
): PreviewSetupModule {
  if (setup.status === "invalid") return { status: "unavailable", message: setup.message };
  if (isFile) return { status: "found", importPath: setup.importPath };

  const extensionHint = path.extname(setup.filePath)
    ? ""
    : "\n  setupFile needs the file extension, for example ./src/vitrine.preview.tsx";
  return {
    status: "unavailable",
    message:
      `[vitrine] setupFile not found, previews are not rendered until it exists\n` +
      describeSetupLocation(setup.setupFile, setup.filePath, root) +
      extensionHint,
  };
}

/**
 * 아직 분석되지 않은 setup module 또는 그 의존 module이 바뀌었는지 판단
 *
 * Vite는 변환 실패와 미요청 module을 구분 없이 갱신 전파에서 제외하므로 복구 여부는 Gallery가 판단
 * setupFilePaths에는 root 기준 경로와 symlink를 푼 실제 경로를 함께 전달
 */
export function needsPreviewSetupRecovery(
  changedModules: readonly PreviewSetupGraphNode[],
  setupFilePaths: readonly string[],
): boolean {
  const setupFiles = new Set(setupFilePaths.map((file) => path.resolve(file)));
  return changedModules.some(
    (mod) => mod.isSelfAccepting === undefined && isInSetupModuleTree(mod, setupFiles),
  );
}

// setup module에서 시작하는 import tree에 속하는지 importer를 거슬러 확인
function isInSetupModuleTree(mod: PreviewSetupGraphNode, setupFiles: ReadonlySet<string>): boolean {
  const visited = new Set<PreviewSetupGraphNode>();
  const pending = [mod];
  while (pending.length > 0) {
    const current = pending.pop()!;
    if (visited.has(current)) continue;
    visited.add(current);
    if (current.file && setupFiles.has(path.resolve(current.file))) return true;
    pending.push(...current.importers);
  }
  return false;
}

/** 경로 오류 진단용 입력값, 해석된 경로, 기준 root 설명 */
function describeSetupLocation(setupFile: string, filePath: string, root: string): string {
  return `  setupFile: ${setupFile}\n  resolved: ${filePath}\n  Vite root: ${root}`;
}
