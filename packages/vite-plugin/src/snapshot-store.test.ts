import { describe, expect, it } from "vitest";
import { createSnapshotStore } from "./snapshot-store.js";

const FILE = "src/Button.tsx";

describe("createSnapshotStore", () => {
  it("내용이 바뀐 저장만 번호를 붙여 기록", () => {
    const store = createSnapshotStore();
    expect(store.record(FILE, "a", 1)).toBe(true);
    expect(store.record(FILE, "a", 2)).toBe(false);
    expect(store.record(FILE, "b", 3)).toBe(true);
    expect(store.history(FILE)).toEqual({ snapshots: [{ number: 1, at: 1 }, { number: 2, at: 3 }], pruned: 0 });
    expect(store.content(FILE, 2)).toBe("b");
  });

  it("상한을 넘으면 Snapshot 1은 남기고 그다음부터 지우며 번호는 밀리지 않음", () => {
    const store = createSnapshotStore({ limit: 3 });
    for (const [index, content] of ["a", "b", "c", "d", "e"].entries()) store.record(FILE, content, index);
    expect(store.history(FILE)).toEqual({
      snapshots: [
        { number: 1, at: 0 },
        { number: 4, at: 3 },
        { number: 5, at: 4 },
      ],
      pruned: 2,
    });
    expect(store.content(FILE, 2)).toBeUndefined();
  });

  it("shouldRecord가 거절하면 기록하지 않지만 첫 기록은 항상 남김", () => {
    const store = createSnapshotStore({
      shouldRecord: ({ lastRecordedAt, now }) => lastRecordedAt === null || now - lastRecordedAt > 3000,
    });
    expect(store.record(FILE, "a", 0)).toBe(true);
    expect(store.record(FILE, "b", 1000)).toBe(false);
    expect(store.record(FILE, "c", 5000)).toBe(true);
    expect(store.history(FILE).snapshots.map((snapshot) => snapshot.number)).toEqual([1, 2]);
  });

  it("폐기한 파일은 다시 기록하면 Snapshot 1부터", () => {
    const store = createSnapshotStore();
    store.record(FILE, "a", 0);
    store.record(FILE, "b", 1);
    store.discard(FILE);
    store.record(FILE, "c", 2);
    expect(store.history(FILE).snapshots).toEqual([{ number: 1, at: 2 }]);
  });
});
