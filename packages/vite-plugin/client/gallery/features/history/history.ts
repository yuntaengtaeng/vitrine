import type { FrameArgs, FrameLayout, SnapshotHistory, SnapshotSummary } from "@vitrine/protocol";
import { clockTime } from "../../shared/clockTime";

export type HistoryMode = "side" | "overlay";

/** 고른 스냅샷과 비교 방식, 스냅샷을 고르지 않았으면 직전 기록 */
export interface HistoryChoice {
  snapshot?: number;
  mode: HistoryMode;
}

export const snapshotLabel = (snapshot: SnapshotSummary) => `Snapshot ${snapshot.number}, ${clockTime(snapshot.at)}`;

/** 마지막 기록은 지금 저장된 내용과 같아 비교할 의미가 없으므로 그 앞의 기록만 */
export function comparableSnapshots(history: SnapshotHistory): SnapshotSummary[] {
  return history.snapshots.slice(0, -1);
}

export function resolveSnapshot(history: SnapshotHistory, choice: HistoryChoice): SnapshotSummary | null {
  const candidates = comparableSnapshots(history);
  return candidates.find((snapshot) => snapshot.number === choice.snapshot) ?? candidates.at(-1) ?? null;
}

/** 고른 옛 버전과 지금 버전을 같은 variant와 바꾼 값으로 나란히 두거나 겹침 */
export function historyLayout(
  snapshot: SnapshotSummary | null,
  mode: HistoryMode,
  base: { variantKey: string | null; overrides: FrameArgs },
): FrameLayout {
  if (!snapshot) return { kind: "single" };
  const cells = [
    { key: `snapshot-${snapshot.number}`, label: snapshotLabel(snapshot), snapshot: snapshot.number },
    { key: "current", label: "Current" },
  ].map((cell) => ({ ...cell, variantKey: base.variantKey, args: base.overrides }));
  return mode === "overlay" ? { kind: "grid", cells, overlay: true } : { kind: "grid", cells, columns: 2 };
}
