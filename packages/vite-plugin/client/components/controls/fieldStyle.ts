import type { CSSProperties } from "react";
import { COLOR } from "../../tokens/color";

/** control input들이 공통으로 쓰는 크기, border, focus 스타일 */
export const FIELD_HEIGHT = 32;
export const FIELD_BORDER_RADIUS = 6;
export const FIELD_BORDER = `1px solid ${COLOR.border}`;
export const FIELD_FOCUS = { outlineColor: COLOR.activeText } satisfies CSSProperties;
