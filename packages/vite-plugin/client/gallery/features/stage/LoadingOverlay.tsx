import { useEffect, useState, type CSSProperties } from "react";
import { COLOR } from "../../../tokens/color";
import { FONT_SIZE } from "../../../tokens/fontSize";

// frame은 보통 100ms 안팎으로 뜨므로 그보다 오래 걸릴 때만 보여 깜빡임을 피함
const SHOW_AFTER_MS = 300;

const Styled = {
  Root: {
    position: "absolute",
    inset: 0,
    display: "grid",
    placeItems: "center",
    color: COLOR.muted,
    fontSize: FONT_SIZE.label,
    pointerEvents: "none",
  } satisfies CSSProperties,
};

export const LoadingOverlay = () => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), SHOW_AFTER_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;
  return (
    <div role="status" style={Styled.Root}>
      Loading preview
    </div>
  );
};
