import path from "node:path";

export interface ManifestEntry {
  id: string;
  name: string;
  file: string;
  exportName: string;
  startLine: number;
  endLine: number;
}

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
