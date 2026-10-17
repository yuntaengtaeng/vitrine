import { isRecord } from "./guards.js";

/** 파일의 스냅샷 목록 조회 route, `?file=<Vite root 기준 경로>` */
export const SNAPSHOTS_ROUTE = "/__vitrine/snapshots";

/** 옛 버전 모듈을 가리키는 query 이름, `/src/Button.tsx?vitrine-snapshot=3` (ADR 010) */
export const SNAPSHOT_QUERY = "vitrine-snapshot";

/** 기록이 바뀐 파일을 Gallery에 알리는 Vite HMR custom event, data는 `{ file }` */
export const SNAPSHOTS_CHANGED_EVENT = "vitrine:snapshots";

export interface SnapshotSummary {
  number: number;
  /** 기록 시각(ms) */
  at: number;
}

export interface SnapshotHistory {
  snapshots: SnapshotSummary[];
  /** Snapshot 1과 최근 기록 사이에서 상한 때문에 지운 수 */
  pruned: number;
}

export function isSnapshotHistory(value: unknown): value is SnapshotHistory {
  return (
    isRecord(value) &&
    Number.isSafeInteger(value.pruned) &&
    Array.isArray(value.snapshots) &&
    value.snapshots.every(
      (snapshot) => isRecord(snapshot) && Number.isSafeInteger(snapshot.number) && Number.isFinite(snapshot.at),
    )
  );
}
