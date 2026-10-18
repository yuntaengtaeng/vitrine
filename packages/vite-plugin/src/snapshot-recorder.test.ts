import { describe, expect, it } from "vitest";
import { applySnapshotChange } from "./snapshot-recorder.js";
import { createSnapshotStore } from "./snapshot-store.js";

const FILE = "src/Button.tsx";
const preview = (label: string) => `/** @preview */\nexport const Button = () => <button>${label}</button>;\n`;

describe("applySnapshotChange", () => {
  it("@preview 파일 저장을 기록하고 문법 오류 저장은 건너뛰며 기록을 유지", () => {
    const store = createSnapshotStore();
    expect(applySnapshotChange(store, FILE, preview("A"), 1)).toBe(true);
    expect(applySnapshotChange(store, FILE, "export const Button = (", 2)).toBe(false);
    expect(applySnapshotChange(store, FILE, preview("B"), 3)).toBe(true);
    expect(store.history(FILE).snapshots.map((snapshot) => snapshot.number)).toEqual([1, 2]);
  });

  it("@preview가 사라지거나 파일이 지워지면 폐기, @preview가 없는 파일은 기록하지 않음", () => {
    const store = createSnapshotStore();
    applySnapshotChange(store, FILE, preview("A"), 1);
    expect(applySnapshotChange(store, FILE, "export const Button = () => null;\n", 2)).toBe(true);
    expect(store.has(FILE)).toBe(false);

    applySnapshotChange(store, FILE, preview("A"), 3);
    expect(applySnapshotChange(store, FILE, null, 4)).toBe(true);
    expect(store.has(FILE)).toBe(false);

    expect(applySnapshotChange(store, "src/util.ts", "export const x = 1;\n", 5)).toBe(false);
  });
});
