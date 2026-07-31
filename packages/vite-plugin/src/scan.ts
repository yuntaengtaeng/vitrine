import fs from "node:fs";
import path from "node:path";
import fg from "fast-glob";
import { parse } from "@babel/parser";
import traverseModule from "@babel/traverse";

// @babel/traverse's CJS/ESM interop is inconsistent across bundlers/resolutions;
// the default export sometimes arrives wrapped in a `default` property.
const traverse = (
  (traverseModule as unknown as { default?: typeof traverseModule }).default ??
  traverseModule
);

export interface PreviewEntry {
  id: string;
  name: string;
  file: string;
  exportName: string;
}

export interface ScanOptions {
  root: string;
  include?: string[];
}

const PREVIEW_TAG = "@preview";
const NAME_OPTION_RE = /name\s*=\s*(?:"([^"]*)"|'([^']*)'|(.+))/;

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

      if (declaration.type === "VariableDeclaration") {
        for (const decl of declaration.declarations) {
          if (decl.id.type !== "Identifier") continue;
          const comment = findPreviewComment(nodePath.node, ast.comments ?? []);
          if (!comment) continue;
          entries.push(makeEntry(relFile, decl.id.name, comment));
        }
      }

      if (declaration.type === "FunctionDeclaration" && declaration.id) {
        const comment = findPreviewComment(nodePath.node, ast.comments ?? []);
        if (comment) entries.push(makeEntry(relFile, declaration.id.name, comment));
      }
    },
  });

  return entries;
}

function findPreviewComment(
  node: { leadingComments?: Array<{ value: string }> | null; start?: number | null },
  allComments: Array<{ value: string; end?: number }>,
): string | null {
  const leading = node.leadingComments?.find((c) => c.value.includes(PREVIEW_TAG));
  if (leading) return leading.value;

  // Fallback: leadingComments attachment can miss comments in unusual positions
  // (e.g. blank line between comment and export). Fall back to the nearest
  // preceding comment in source order that mentions @preview.
  if (node.start == null) return null;
  const preceding = allComments
    .filter(
      (c): c is { value: string; end: number } =>
        c.end != null && c.end <= node.start! && c.value.includes(PREVIEW_TAG),
    )
    .sort((a, b) => b.end - a.end)[0];
  return preceding?.value ?? null;
}

function makeEntry(file: string, exportName: string, comment: string): PreviewEntry {
  const nameMatch = comment.match(NAME_OPTION_RE);
  const rawName = nameMatch ? nameMatch[1] ?? nameMatch[2] ?? nameMatch[3] : undefined;
  const name = rawName?.trim() || exportName;
  return {
    id: `${file}#${exportName}`,
    name,
    file,
    exportName,
  };
}
