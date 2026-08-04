import type { CSSProperties, ReactNode } from "react";
import { COLOR } from "../tokens/color";
import { FONT_SIZE } from "../tokens/fontSize";

const Styled = {
  Text: { color: COLOR.error, whiteSpace: "pre-wrap", fontSize: FONT_SIZE.secondary } satisfies CSSProperties,
};

/** 로드 실패, 렌더 에러 등 프리뷰 관련 에러 텍스트 표시, Canvas와 PreviewErrorBoundary가 공유 */
export const ErrorText = (props: { children: ReactNode }) => <pre style={Styled.Text}>{props.children}</pre>;
