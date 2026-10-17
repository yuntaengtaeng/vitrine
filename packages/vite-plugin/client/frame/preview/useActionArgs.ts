import { useEffect, useMemo, useRef } from "react";
import type { Args } from "./previewConfig";

/**
 * action prop마다 호출을 알리는 함수를 넣은 args
 * preview() args로 넘긴 함수가 있으면 그 함수도 그대로 실행해 결과를 돌려줌
 */
export const useActionArgs = (
  args: Args,
  names: readonly string[],
  onAction: (name: string, values: unknown[]) => void,
): Args => {
  // 기록 함수는 이름마다 한 번만 만들어 props 참조가 렌더마다 바뀌지 않게 하고, 호출 시점의 args를 읽음
  const latestArgs = useRef(args);
  useEffect(() => {
    latestArgs.current = args;
  });
  const recorders = useMemo(
    () =>
      Object.fromEntries(
        names.map((name) => [
          name,
          (...values: unknown[]) => {
            onAction(name, values);
            const own = latestArgs.current[name];
            return typeof own === "function" ? (own as (...input: unknown[]) => unknown)(...values) : undefined;
          },
        ]),
      ),
    [names, onAction],
  );
  return names.length === 0 ? args : { ...args, ...recorders };
};
