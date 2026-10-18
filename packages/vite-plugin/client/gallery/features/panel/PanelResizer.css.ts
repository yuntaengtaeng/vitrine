import { style } from "@vanilla-extract/css";
import { vars } from "../../shared/theme/theme.css";

// 패널 윗선을 가운데에 두고 위아래로 잡을 여유를 줌
export const resizer = style({
  position: "absolute",
  top: -4,
  left: 0,
  right: 0,
  zIndex: 2,
  height: 8,
  cursor: "row-resize",
  touchAction: "none",
  outline: "none",
  selectors: {
    "&::after": {
      content: '""',
      position: "absolute",
      top: 3,
      left: 0,
      right: 0,
      height: 2,
      background: "transparent",
      transition: "background 120ms",
    },
    "&:hover::after, &:active::after, &:focus-visible::after": { background: vars.color.accent },
  },
});
