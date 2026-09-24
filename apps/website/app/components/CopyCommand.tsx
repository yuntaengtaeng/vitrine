import { useState } from "react";
import * as styles from "./CopyCommand.css";

/** 클릭하면 명령을 클립보드에 복사하는 버튼 */
export function CopyCommand({
  command,
  copyLabel,
  copiedLabel,
}: {
  command: string;
  copyLabel: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <button type="button" className={styles.button} onClick={copy}>
      <span className={styles.prompt}>$</span>
      <code className={styles.command}>{command}</code>
      <span className={styles.status} aria-live="polite">
        {copied ? copiedLabel : copyLabel}
      </span>
    </button>
  );
}
