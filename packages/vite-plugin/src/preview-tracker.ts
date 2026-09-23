import { renderPreviewsModule, type PreviewEntry } from "./scan.js";

/** 마지막 스캔 결과와 가상 모듈 변경 여부 추적기 */
export interface PreviewTracker {
  /** 마지막으로 완료된 스캔 결과 조회 */
  getEntries(): PreviewEntry[];
  /** 재스캔 후 가상 모듈 내용이 이전 스캔과 달라졌는지 판단, 첫 스캔은 항상 false */
  refresh(): Promise<boolean>;
}

/** 스캔을 한 번에 하나씩 실행해 늦게 끝난 이전 스캔이 최신 결과를 덮어쓰지 않는 추적기 생성 */
export function createPreviewTracker(scan: () => Promise<PreviewEntry[]>): PreviewTracker {
  let entries: PreviewEntry[] = [];
  let renderedModule: string | null = null;
  let pending: Promise<unknown> = Promise.resolve();

  const rescan = async (): Promise<boolean> => {
    const nextEntries = await scan();
    const nextModule = renderPreviewsModule(nextEntries);
    const changed = renderedModule !== null && nextModule !== renderedModule;
    entries = nextEntries;
    renderedModule = nextModule;
    return changed;
  };

  return {
    getEntries: () => entries,
    refresh: () => {
      const run = pending.then(rescan);
      pending = run.catch(() => undefined);
      return run;
    },
  };
}
