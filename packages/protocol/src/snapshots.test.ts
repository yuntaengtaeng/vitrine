import { describe, expect, it } from "vitest";
import { isSnapshotHistory } from "./snapshots.js";

describe("isSnapshotHistory", () => {
  it("번호와 시각, 지운 수를 가진 목록만", () => {
    expect(isSnapshotHistory({ snapshots: [{ number: 1, at: 10 }], pruned: 0 })).toBe(true);
    expect(isSnapshotHistory({ snapshots: [{ number: "1", at: 10 }], pruned: 0 })).toBe(false);
    expect(isSnapshotHistory({ snapshots: [] })).toBe(false);
  });
});
