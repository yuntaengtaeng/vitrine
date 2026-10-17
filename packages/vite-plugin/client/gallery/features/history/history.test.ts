import { describe, expect, it } from "vitest";
import { comparableSnapshots, historyLayout, resolveSnapshot } from "./history";

const history = {
  snapshots: [
    { number: 1, at: new Date(2026, 9, 18, 9, 0, 0).getTime() },
    { number: 4, at: new Date(2026, 9, 18, 9, 5, 0).getTime() },
    { number: 5, at: new Date(2026, 9, 18, 9, 6, 0).getTime() },
  ],
  pruned: 2,
};
const base = { variantKey: "primary", overrides: { label: "Go" } };

describe("snapshot choice", () => {
  it("마지막 기록은 지금 버전과 같아 비교 목록에서 뺌", () => {
    expect(comparableSnapshots(history).map((snapshot) => snapshot.number)).toEqual([1, 4]);
  });

  it("고르지 않았거나 없는 번호면 직전 기록", () => {
    expect(resolveSnapshot(history, { mode: "side" })?.number).toBe(4);
    expect(resolveSnapshot(history, { snapshot: 3, mode: "side" })?.number).toBe(4);
    expect(resolveSnapshot(history, { snapshot: 1, mode: "side" })?.number).toBe(1);
    expect(resolveSnapshot({ snapshots: [history.snapshots[0]], pruned: 0 }, { mode: "side" })).toBeNull();
  });
});

describe("historyLayout", () => {
  it("나란히는 옛 버전과 지금 버전 두 열, 같은 variant와 바꾼 값", () => {
    expect(historyLayout(history.snapshots[1], "side", base)).toEqual({
      kind: "grid",
      columns: 2,
      cells: [
        { key: "snapshot-4", label: "Snapshot 4, 09:05:00", snapshot: 4, variantKey: "primary", args: { label: "Go" } },
        { key: "current", label: "Current", variantKey: "primary", args: { label: "Go" } },
      ],
    });
  });

  it("겹쳐 보기는 overlay, 비교할 기록이 없으면 지금 버전만", () => {
    expect(historyLayout(history.snapshots[0], "overlay", base)).toMatchObject({ kind: "grid", overlay: true });
    expect(historyLayout(null, "side", base)).toEqual({ kind: "single" });
  });
});
