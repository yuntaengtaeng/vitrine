import { scanParsedSource } from "./scan.js";
import type { SnapshotStore } from "./snapshot-store.js";

/**
 * 저장된 파일 내용으로 기록, 유지, 폐기를 정함 (ADR 010)
 * 파싱에 실패한 저장은 기록하지 않고 기존 기록을 유지, `@preview`가 사라지거나 파일이 지워지면 폐기
 * @param file Vite root 기준 POSIX 경로
 * @param code 저장된 내용, 파일이 지워졌으면 null
 * @returns 기록이 바뀌었는지
 */
export function applySnapshotChange(store: SnapshotStore, file: string, code: string | null, now: number): boolean {
  if (code === null) return store.discard(file);
  const entries = scanParsedSource(code, file);
  if (entries === null) return false;
  if (entries.length === 0) return store.discard(file);
  return store.record(file, code, now);
}
