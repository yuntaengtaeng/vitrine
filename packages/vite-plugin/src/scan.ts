import fs from "node:fs";
import path from "node:path";
import type { ManifestEntry } from "@vitrine/protocol";
import fg from "fast-glob";
import { parse } from "@babel/parser";
import traverseModule, { type NodePath } from "@babel/traverse";
import { createTypeContext, getPropControls, type TypeContext } from "./props-controls.js";

// CJS/ESM interop에 따라 default export가 한 번 더 감싸여 오는 경우 보정
const traverse = (
  (traverseModule as unknown as { default?: typeof traverseModule }).default ??
  traverseModule
);

/** 스캔된 프리뷰 export 하나의 정보 */
export type PreviewEntry = ManifestEntry;

/** 프리뷰 스캔 옵션 */
export interface ScanOptions {
  root: string;
  include?: string[];
}

const PREVIEW_TAG = "@preview";
// 같은 줄에 다른 옵션이 올 수 있어 인용부호로 값의 끝을 구분
const NAME_OPTION_RE = /name\s*=\s*(?:"([^"]*)"|'([^']*)')/;

/** 프로젝트 하나의 @preview 스캐너 */
export interface PreviewScanner {
  /** include 글롭 패턴 기준 프로젝트 전체 @preview export 스캔 */
  scan(): Promise<PreviewEntry[]>;
  /** 소스가 바뀌어 캐시된 타입 정보가 낡았을 때 다음 scan에서 다시 만들도록 무효화 */
  invalidateTypes(): void;
}

type FileCache = Map<string, { mtimeMs: number; size: number; entries: PreviewEntry[] }>;

/** 파일별 스캔 결과와 prop 타입 분석용 ts.Program을 캐시하는 스캐너 생성 */
export const DEFAULT_INCLUDE = ["src/**/*.{tsx,jsx}"];

export function createPreviewScanner(options: ScanOptions): PreviewScanner {
  const { root, include = DEFAULT_INCLUDE } = options;
  const fileCache: FileCache = new Map();
  // ts.createProgram()이 tsconfig 전체를 다시 읽어들이는 비용이 커서(예제 9개
  // 파일 기준 Babel 스캔의 17배), 무효화될 때까지 한 번 만든 Program을 재사용
  let typeContext: TypeContext | undefined;

  return {
    scan: async () => {
      const files = await fg(include, { cwd: root, absolute: true, ignore: ["**/node_modules/**"] });
      const context = (typeContext ??= createTypeContext(root));
      const entries: PreviewEntry[] = [];
      for (const file of files) {
        for (const entry of scanFile(file, root, fileCache)) {
          // scanFile 캐시 entry를 공유하므로 복사해서 확장
          entries.push({ ...entry, controls: getPropControls(file, entry.exportName, context) });
        }
      }
      return entries;
    },
    invalidateTypes: () => {
      typeContext = undefined;
    },
  };
}

// 변경 판단은 mtime+size, content hash는 캐시로 피하려는 파일 읽기가 다시 필요
function scanFile(file: string, root: string, fileCache: FileCache): PreviewEntry[] {
  const stat = fs.statSync(file);
  const cached = fileCache.get(file);
  if (cached && cached.mtimeMs === stat.mtimeMs && cached.size === stat.size) {
    return cached.entries;
  }

  const relFile = path.relative(root, file).split(path.sep).join("/");
  const entries = scanSource(fs.readFileSync(file, "utf-8"), relFile);
  fileCache.set(file, { mtimeMs: stat.mtimeMs, size: stat.size, entries });
  return entries;
}

/** 소스 문자열에서 @preview export 스캔 (relFile은 프로젝트 루트 기준 POSIX 경로) */
export function scanSource(code: string, relFile: string): PreviewEntry[] {
  let ast;
  try {
    ast = parse(code, {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
      attachComment: true,
    });
  } catch {
    return [];
  }

  const comments = ast.comments ?? [];
  const entries: PreviewEntry[] = [];

  traverse(ast, {
    ExportNamedDeclaration(nodePath) {
      const declaration = nodePath.node.declaration;
      if (!declaration) return;

      const comment = findPreviewComment(nodePath.node, comments, getPrecedingStatementEnd(nodePath, 1));
      if (!comment) return;

      if (declaration.type === "VariableDeclaration") {
        for (const decl of declaration.declarations) {
          if (decl.id.type !== "Identifier") continue;
          entries.push(makeEntry(relFile, decl.id.name, comment, nodePath.node.loc));
        }
      }

      if (declaration.type === "FunctionDeclaration" && declaration.id) {
        entries.push(makeEntry(relFile, declaration.id.name, comment, nodePath.node.loc));
      }
    },

    ExportDefaultDeclaration(nodePath) {
      const declaration = nodePath.node.declaration;
      // export default Foo; 는 선언이 별도 문장이라 그 선언 위의 주석까지 허용
      const stepsBack = declaration.type === "Identifier" ? 2 : 1;
      const comment = findPreviewComment(nodePath.node, comments, getPrecedingStatementEnd(nodePath, stepsBack));
      if (!comment) return;

      const label =
        ("id" in declaration && declaration.id?.type === "Identifier" && declaration.id.name) ||
        (declaration.type === "Identifier" && declaration.name) ||
        path.basename(relFile, path.extname(relFile));
      const loc = declaration.type === "Identifier"
        ? spanWithDeclaration(nodePath, declaration.name)
        : nodePath.node.loc;
      entries.push(makeEntry(relFile, "default", comment, loc, label));
    },
  });

  return entries;
}

// export default Foo; 의 커서 범위를 Foo 선언 문장까지 넓혀 본문에서도 프리뷰가 선택되게 함
function spanWithDeclaration(nodePath: NodePath, name: string): SourceLocation | null | undefined {
  const exportLoc = nodePath.node.loc;
  const declarationLoc = nodePath.scope.getBinding(name)?.path.getStatementParent()?.node.loc;
  if (!exportLoc || !declarationLoc) return exportLoc;
  return {
    start: declarationLoc.start.line < exportLoc.start.line ? declarationLoc.start : exportLoc.start,
    end: declarationLoc.end.line > exportLoc.end.line ? declarationLoc.end : exportLoc.end,
  };
}

// stepsBack칸 앞 문장의 끝 위치, 폴백 주석 탐색의 하한선 (없으면 -1)
function getPrecedingStatementEnd(nodePath: NodePath, stepsBack: number): number {
  if (typeof nodePath.key !== "number") return -1;
  const sibling = nodePath.getSibling(nodePath.key - stepsBack);
  return sibling.node?.end ?? -1;
}

function findPreviewComment(
  node: { leadingComments?: Array<{ value: string }> | null; start?: number | null },
  allComments: Array<{ value: string; end?: number }>,
  lowerBound: number,
): string | null {
  const leading = node.leadingComments?.find((c) => c.value.includes(PREVIEW_TAG));
  if (leading) return leading.value;

  // 빈 줄 등으로 leadingComments에 붙지 않은 주석 대비, 하한선 이후 가장 가까운 주석으로 폴백
  if (node.start == null) return null;
  const nodeStart = node.start;
  const nearest = allComments
    .filter(
      (c): c is { value: string; end: number } =>
        c.end != null && c.end > lowerBound && c.end <= nodeStart && c.value.includes(PREVIEW_TAG),
    )
    .sort((a, b) => b.end - a.end)[0];
  return nearest?.value ?? null;
}

type SourceLocation = { start: { line: number }; end: { line: number } };

function makeEntry(
  file: string,
  exportName: string,
  comment: string,
  loc: SourceLocation | null | undefined,
  fallbackName: string = exportName,
): PreviewEntry {
  const nameMatch = comment.match(NAME_OPTION_RE);
  const rawName = nameMatch ? nameMatch[1] ?? nameMatch[2] : undefined;
  const { name, group } = splitNameAndGroup(rawName?.trim() || fallbackName);
  return {
    id: `${file}#${exportName}`,
    name,
    ...(group ? { group } : {}),
    file,
    exportName,
    startLine: loc?.start.line ?? 1,
    endLine: loc?.end.line ?? 1,
    controls: {},
  };
}

// "Inputs/Button" 형식의 마지막 세그먼트를 name, 나머지를 group 경로로 분리
function splitNameAndGroup(raw: string): { name: string; group?: string } {
  const segments = raw.split("/").map((segment) => segment.trim()).filter((segment) => segment.length > 0);
  if (segments.length <= 1) return { name: segments[0] ?? raw };
  return { name: segments[segments.length - 1], group: segments.slice(0, -1).join("/") };
}
