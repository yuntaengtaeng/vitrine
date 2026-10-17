import type { SnapshotHistory, SnapshotSummary } from "@vitrine/protocol";
import type { SnapshotOptions } from "./index.js";

export const DEFAULT_SNAPSHOT_LIMIT = 20;

interface FileHistory {
  entries: (SnapshotSummary & { content: string })[];
  nextNumber: number;
  pruned: number;
}

/** 파일별 저장본을 메모리에 보관, 번호는 늘어나기만 하고 상한을 넘으면 Snapshot 1 다음부터 지움 */
export function createSnapshotStore(options: SnapshotOptions = {}) {
  const limit = Math.max(2, options.limit ?? DEFAULT_SNAPSHOT_LIMIT);
  const histories = new Map<string, FileHistory>();

  return {
    /** 기록했으면 true, 내용이 같거나 shouldRecord가 거절하면 false */
    record(file: string, content: string, now: number): boolean {
      const history = histories.get(file) ?? { entries: [], nextNumber: 1, pruned: 0 };
      const last = history.entries.at(-1);
      if (last?.content === content) return false;
      // 첫 기록은 서버 시작이나 @preview가 생긴 시점이라 거르지 않음
      if (last && options.shouldRecord && !options.shouldRecord({ file, lastRecordedAt: last.at, now })) return false;

      history.entries.push({ number: history.nextNumber, at: now, content });
      history.nextNumber += 1;
      if (history.entries.length > limit) {
        history.entries.splice(1, 1);
        history.pruned += 1;
      }
      histories.set(file, history);
      return true;
    },
    discard(file: string): boolean {
      return histories.delete(file);
    },
    has(file: string): boolean {
      return histories.has(file);
    },
    history(file: string): SnapshotHistory {
      const history = histories.get(file);
      if (!history) return { snapshots: [], pruned: 0 };
      return { snapshots: history.entries.map(({ number, at }) => ({ number, at })), pruned: history.pruned };
    },
    content(file: string, number: number): string | undefined {
      return histories.get(file)?.entries.find((entry) => entry.number === number)?.content;
    },
  };
}

export type SnapshotStore = ReturnType<typeof createSnapshotStore>;
