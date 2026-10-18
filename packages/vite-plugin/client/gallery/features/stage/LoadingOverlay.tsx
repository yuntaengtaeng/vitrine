import { useEffect, useState } from "react";
import * as styles from "./LoadingOverlay.css";

// frame은 보통 100ms 안팎으로 뜨므로 그보다 오래 걸릴 때만 보여 깜빡임을 피함
const SHOW_AFTER_MS = 300;

export const LoadingOverlay = () => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), SHOW_AFTER_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;
  return (
    <div role="status" className={styles.root}>
      Loading preview
    </div>
  );
};
