// 스캔 안 됨, 0개 엔트리
// export const/export function은 선언과 export가 한 문장이라, 주석은 그
// export 문 바로 위까지만 허용됨, Unrelated 위의 주석이 아래 Exported로
// 건너뛰어 잡히면 안 됨 (실제로 겪은 버그, 지금은 고쳐진 상태를 검증하는 예시)
/** @preview */
const Unrelated = () => null;

export const Exported = () => null;
