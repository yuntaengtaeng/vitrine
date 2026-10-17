import { COLOR } from "./color";

/** 투명 배경을 나타내는 체크무늬 CSS background, cell은 한 칸 크기(px) */
export const checkerboard = (cell: number) =>
  `repeating-conic-gradient(${COLOR.checkerDark} 0 25%, ${COLOR.checkerLight} 0 50%) 0 0 / ${cell}px ${cell}px`;
