import fs from "node:fs";
import path from "node:path";
import fg from "fast-glob";
import { parse } from "@babel/parser";
import traverseModule, { type NodePath } from "@babel/traverse";

// 번들러/모듈 해석 방식에 따라 @babel/traverse의 CJS/ESM interop이 달라짐,
// default export가 default 프로퍼티에 한 번 더 감싸여 오는 경우 보정
const traverse = (
  (traverseModule as unknown as { default?: typeof traverseModule }).default ??
  traverseModule
);

/** 스캔된 프리뷰 export 하나의 정보 */
export interface PreviewEntry {
  id: string;
  name: string;
  file: string;
  exportName: string;
  /** export 선언문의 시작/끝 라인 (1-indexed), 커서 위치 매칭에 사용 */
  startLine: number;
  endLine: number;
}

/** 프리뷰 스캔 옵션 */
export interface ScanOptions {
  root: string;
  include?: string[];
}

const PREVIEW_TAG = "@preview";
const NAME_OPTION_RE = /name\s*=\s*(?:"([^"]*)"|'([^']*)'|(.+))/;

/** include 글롭 패턴 기준 프로젝트 전체 @preview export 스캔 */
export async function scanPreviews(options: ScanOptions): Promise<PreviewEntry[]> {
  const { root, include = ["src/**/*.{tsx,jsx}"] } = options;
  const files = await fg(include, {
    cwd: root,
    absolute: true,
    ignore: ["**/node_modules/**"],
  });

  const entries: PreviewEntry[] = [];
  for (const file of files) {
    entries.push(...scanFile(file, root));
  }
  return entries;
}

/** 단일 파일에서 @preview export 스캔 */
export function scanFile(file: string, root: string): PreviewEntry[] {
  const code = fs.readFileSync(file, "utf-8");

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

  const relFile = path.relative(root, file).split(path.sep).join("/");
  const entries: PreviewEntry[] = [];

  traverse(ast, {
    ExportNamedDeclaration(nodePath) {
      const declaration = nodePath.node.declaration;
      if (!declaration) return;

      // export const/export function은 export 문 자체가 선언까지 포함하는
      // 하나의 완결된 문장이라, 주석은 그 바로 앞(한 칸도 건너뛸 필요 없음)
      // 까지만 허용, 그보다 앞선 문장까지 허용하면 무관한 주석을 잘못 주워옴
      const fallbackLowerBound = getPrecedingStatementEnd(nodePath, 1);

      if (declaration.type === "VariableDeclaration") {
        for (const decl of declaration.declarations) {
          if (decl.id.type !== "Identifier") continue;
          const comment = findPreviewComment(nodePath.node, ast.comments ?? [], fallbackLowerBound);
          if (!comment) continue;
          entries.push(makeEntry(relFile, decl.id.name, comment, nodePath.node.loc));
        }
      }

      if (declaration.type === "FunctionDeclaration" && declaration.id) {
        const comment = findPreviewComment(nodePath.node, ast.comments ?? [], fallbackLowerBound);
        if (comment) entries.push(makeEntry(relFile, declaration.id.name, comment, nodePath.node.loc));
      }
    },

    ExportDefaultDeclaration(nodePath) {
      const declaration = nodePath.node.declaration;
      // export default Foo;(로컬 식별자 참조)만 선언과 export가 서로 다른
      // 문장이라, 그 경우에 한해서만 한 칸 더 앞(선언 문장 위)까지 허용,
      // export default function/class/화살표 함수는 export 문 자체가
      // 선언을 포함하는 하나의 문장이라 한 칸도 건너뛸 필요가 없음
      const stepsBack = declaration.type === "Identifier" ? 2 : 1;
      const comment = findPreviewComment(nodePath.node, ast.comments ?? [], getPrecedingStatementEnd(nodePath, stepsBack));
      if (!comment) return;

      // default export는 exportName이 항상 "default"라 라벨로 못 씀,
      // 함수/클래스 선언 이름이나 참조하는 식별자가 있으면 그걸 쓰고
      // 없으면(익명 화살표 함수 등) 파일 이름을 라벨 기본값으로 사용
      const fallbackName =
        ("id" in declaration && declaration.id?.type === "Identifier" && declaration.id.name) ||
        (declaration.type === "Identifier" && declaration.name) ||
        path.basename(relFile, path.extname(relFile));
      entries.push(makeEntry(relFile, "default", comment, nodePath.node.loc, fallbackName));
    },
  });

  return entries;
}

// export 문 기준 stepsBack칸 앞 문장의 끝 위치, 없으면 -1
// findPreviewComment의 폴백이 이 위치보다 앞선 문장에 딸린 주석까지 주워오지
// 못하게 막는 하한선으로 씀. stepsBack은 대부분 1(export 문 바로 앞까지만
// 허용)이고, export default Foo; 처럼 선언과 export가 서로 다른 문장인
// 경우에만 2(선언 문장 위까지 허용)를 씀
function getPrecedingStatementEnd(nodePath: NodePath, stepsBack: number): number {
  if (typeof nodePath.key !== "number") return -1;
  const sibling = nodePath.getSibling(nodePath.key - stepsBack);
  return sibling.node?.end ?? -1;
}

function findPreviewComment(
  node: { leadingComments?: Array<{ value: string }> | null; start?: number | null },
  allComments: Array<{ value: string; end?: number }>,
  fallbackLowerBound: number,
): string | null {
  const leading = node.leadingComments?.find((c) => c.value.includes(PREVIEW_TAG));
  if (leading) return leading.value;

  // leadingComments 첨부가 특이 위치(주석과 export 사이 빈 줄 등)를 놓치는 경우 대비,
  // ast.comments에서 @preview를 포함한 가장 가까운 선행 주석으로 폴백. 단
  // fallbackLowerBound보다 앞선 문장에 딸린 주석은 후보에서 제외, 안 그러면
  // 이 export와 무관한 더 앞선 문장 위의 @preview 주석을 잘못 주워옴
  // (호출부의 getPrecedingStatementEnd 주석, scan.test.ts의 관련 케이스 참고)
  if (node.start == null) return null;
  const preceding = allComments
    .filter(
      (c): c is { value: string; end: number } =>
        c.end != null &&
        c.end > fallbackLowerBound &&
        c.end <= node.start! &&
        c.value.includes(PREVIEW_TAG),
    )
    .sort((a, b) => b.end - a.end)[0];
  return preceding?.value ?? null;
}

function makeEntry(
  file: string,
  exportName: string,
  comment: string,
  loc: { start: { line: number }; end: { line: number } } | null | undefined,
  fallbackName: string = exportName,
): PreviewEntry {
  const nameMatch = comment.match(NAME_OPTION_RE);
  const rawName = nameMatch ? nameMatch[1] ?? nameMatch[2] ?? nameMatch[3] : undefined;
  const name = rawName?.trim() || fallbackName;
  return {
    id: `${file}#${exportName}`,
    name,
    file,
    exportName,
    startLine: loc?.start.line ?? 1,
    endLine: loc?.end.line ?? 1,
  };
}

/** 스캔된 프리뷰 목록을 가상 모듈 JS 문자열로 직렬화 */
export function renderPreviewsModule(entries: PreviewEntry[]): string {
  const items = entries.map(
    (entry) =>
      `  { id: ${JSON.stringify(entry.id)}, name: ${JSON.stringify(entry.name)}, ` +
      `file: ${JSON.stringify(entry.file)}, exportName: ${JSON.stringify(entry.exportName)}, ` +
      `load: () => import(${JSON.stringify("/" + entry.file)}) }`,
  );
  return `export default [\n${items.join(",\n")}\n];\n`;
}
