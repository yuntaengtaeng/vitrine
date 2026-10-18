import { RED } from "@vitrine/brand";
import type { CSSProperties, ReactNode } from "react";

// frame은 사용자 문서라 Gallery CSS를 넣지 않고 inline style만 사용
const Styled = {
  Text: { color: RED[600], whiteSpace: "pre-wrap", fontSize: "0.85rem" } satisfies CSSProperties,
};

export const ErrorText = (props: { children: ReactNode }) => <pre style={Styled.Text}>{props.children}</pre>;
