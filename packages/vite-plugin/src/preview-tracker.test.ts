import { describe, expect, it } from "vitest";
import { createPreviewTracker } from "./preview-tracker.js";
import type { PreviewEntry } from "./scan.js";

function entry(name: string, lines: [number, number] = [1, 1]): PreviewEntry {
  return {
    id: `src/${name}.tsx#${name}`,
    name,
    file: `src/${name}.tsx`,
    exportName: name,
    startLine: lines[0],
    endLine: lines[1],
    controls: {},
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
}

describe("createPreviewTracker", () => {
  it("첫 스캔은 기준값으로 삼고 변경으로 보지 않음", async () => {
    const tracker = createPreviewTracker(async () => [entry("Button")]);

    expect(await tracker.refresh()).toBe(false);
    expect(tracker.getEntries().map((e) => e.name)).toEqual(["Button"]);
  });

  it("프리뷰 목록이 바뀌면 변경으로 판단", async () => {
    const results = [[entry("Button")], [entry("Button"), entry("Card")]];
    const tracker = createPreviewTracker(async () => results.shift()!);

    await tracker.refresh();
    expect(await tracker.refresh()).toBe(true);
  });

  it("라인 범위만 바뀌면 변경으로 보지 않지만 결과는 갱신", async () => {
    const results = [[entry("Button", [1, 1])], [entry("Button", [3, 5])]];
    const tracker = createPreviewTracker(async () => results.shift()!);

    await tracker.refresh();
    expect(await tracker.refresh()).toBe(false);
    expect(tracker.getEntries()[0].startLine).toBe(3);
  });

  it("이전 스캔이 끝나기 전에 요청된 스캔은 순서대로 실행해 최신 결과를 유지", async () => {
    const slow = deferred<PreviewEntry[]>();
    const scans = [() => slow.promise, async () => [entry("Latest")]];
    const tracker = createPreviewTracker(() => scans.shift()!());

    const first = tracker.refresh();
    const second = tracker.refresh();
    slow.resolve([entry("Stale")]);
    await Promise.all([first, second]);

    expect(tracker.getEntries().map((e) => e.name)).toEqual(["Latest"]);
  });

  it("실패한 스캔 뒤에도 다음 스캔을 실행", async () => {
    const scans = [
      async (): Promise<PreviewEntry[]> => {
        throw new Error("file removed during scan");
      },
      async () => [entry("Button")],
    ];
    const tracker = createPreviewTracker(() => scans.shift()!());

    await expect(tracker.refresh()).rejects.toThrow("file removed during scan");
    expect(await tracker.refresh()).toBe(false);
    expect(tracker.getEntries().map((e) => e.name)).toEqual(["Button"]);
  });
});
