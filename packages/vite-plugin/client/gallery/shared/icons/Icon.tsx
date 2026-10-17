import type { CSSProperties, ReactNode } from "react";

export interface IconProps {
  /** px */
  size?: number;
  style?: CSSProperties;
}

/** 의미는 감싼 버튼의 이름이 전달하므로 스크린 리더에서 숨김 */
export const Icon = (props: IconProps & { children: ReactNode }) => (
  <svg
    viewBox="0 0 16 16"
    width={props.size ?? 16}
    height={props.size ?? 16}
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0, ...props.style }}
  >
    {props.children}
  </svg>
);
