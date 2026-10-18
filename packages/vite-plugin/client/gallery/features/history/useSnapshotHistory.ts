/// <reference types="vite/client" />
import {
  SNAPSHOTS_CHANGED_EVENT,
  SNAPSHOTS_ROUTE,
  isSnapshotHistory,
  type SnapshotHistory,
} from "@vitrine/protocol";
import { useEffect, useState } from "react";

/** dev server가 보관한 이 파일의 스냅샷 목록, 저장으로 기록이 바뀌면 다시 받아옴 */
export const useSnapshotHistory = (file: string, enabled: boolean): SnapshotHistory | null => {
  const [history, setHistory] = useState<SnapshotHistory | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const load = () =>
      fetch(`${SNAPSHOTS_ROUTE}?file=${encodeURIComponent(file)}`)
        .then((response) => response.json())
        .then((value: unknown) => {
          if (!cancelled && isSnapshotHistory(value)) setHistory(value);
        })
        // 서버가 잠시 끊겨도 History 보기만 숨겨지고 나머지 Gallery는 계속 동작
        .catch(() => undefined);
    const onChange = (data: { file?: string }) => {
      if (data.file === file) void load();
    };
    void load();
    import.meta.hot?.on(SNAPSHOTS_CHANGED_EVENT, onChange);
    return () => {
      cancelled = true;
      import.meta.hot?.off(SNAPSHOTS_CHANGED_EVENT, onChange);
    };
  }, [file, enabled]);

  return enabled ? history : null;
};
