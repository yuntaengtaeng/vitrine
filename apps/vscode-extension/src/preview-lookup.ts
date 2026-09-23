import path from "node:path";
import type { ManifestEntry } from "@vitrine/protocol";

export type { ManifestEntry } from "@vitrine/protocol";

/** 프로젝트 루트 기준 POSIX 상대 경로, 루트 밖 파일이면 null */
export function toProjectRelativeFile(root: string, absoluteFile: string): string | null {
  const rel = path.relative(root, absoluteFile);
  if (!rel || rel.startsWith("..") || path.isAbsolute(rel)) return null;
  return rel.split(path.sep).join("/");
}

/** 상대 경로 + 커서 라인(1-indexed)에 해당하는 프리뷰 엔트리 탐색 */
export function findEntryAtLine(
  manifest: ManifestEntry[],
  relFile: string,
  line: number,
): ManifestEntry | null {
  return (
    manifest.find(
      (entry) => entry.file === relFile && line >= entry.startLine && line <= entry.endLine,
    ) ?? null
  );
}

/** 커서 위치에서 새로 선택할 프리뷰 id 조회, 해당 프리뷰가 없거나 이미 선택된 경우 null */
export function resolveCursorPreviewId(options: {
  manifest: ManifestEntry[];
  relFile: string;
  /** VS Code의 0-indexed 커서 라인 */
  cursorLine: number;
  lastSelectedId: string | null;
}): string | null {
  // manifest 라인은 Babel loc 기준 1-indexed
  const entry = findEntryAtLine(options.manifest, options.relFile, options.cursorLine + 1);
  if (!entry || entry.id === options.lastSelectedId) return null;
  return entry.id;
}
