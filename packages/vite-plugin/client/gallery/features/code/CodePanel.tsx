import { useState } from "react";
import * as styles from "./CodePanel.css";
import { copyText } from "../../shared/copyText";
import { jsxSnippet } from "./jsxSnippet";

type CopyStatus = "idle" | "copied" | "failed";

export const CodePanel = (props: {
  componentName: string;
  args: Record<string, unknown>;
  /** 함수나 JSX라 Gallery가 값을 몰라 코드에 넣지 못한 prop */
  frameOnlyArgs: readonly string[];
}) => {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const snippet = jsxSnippet(props.componentName, props.args);

  return (
    <div className={styles.root}>
      <pre className={styles.code}>
        <code>{snippet}</code>
      </pre>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.copy}
          onClick={async () => setStatus((await copyText(snippet)) ? "copied" : "failed")}
        >
          Copy
        </button>
        <span className={styles.status} role="status">
          {status === "copied" ? "Copied" : status === "failed" ? "Copy failed, select the code instead" : ""}
        </span>
      </div>
      {props.frameOnlyArgs.length > 0 && (
        <p className={styles.note}>
          Not shown: {props.frameOnlyArgs.join(", ")} (functions and elements set in preview() stay in the preview)
        </p>
      )}
    </div>
  );
};
