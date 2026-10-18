import { useCallback, useState } from "react";

/** 바뀌지 않으면 같은 Set을 돌려줘 불필요한 re-render를 막음 */
export function withPreviewFailure(failedIds: ReadonlySet<string>, id: string, failed: boolean): ReadonlySet<string> {
  if (failedIds.has(id) === failed) return failedIds;
  const next = new Set(failedIds);
  if (failed) next.add(id);
  else next.delete(id);
  return next;
}

export const useFailedPreviews = () => {
  const [failedIds, setFailedIds] = useState<ReadonlySet<string>>(() => new Set());
  const markFailed = useCallback(
    (id: string, failed: boolean) => setFailedIds((current) => withPreviewFailure(current, id, failed)),
    [],
  );
  return [failedIds, markFailed] as const;
};
