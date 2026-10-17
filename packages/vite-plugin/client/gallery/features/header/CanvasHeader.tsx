import { useState } from "react";
import { copyText } from "../../shared/copyText";
import { openInEditor } from "../../shared/editorLink";
import { groupSegments } from "../../shared/previewGroup";
import { secondaryButton } from "../../shared/ui/button.css";
import * as styles from "./CanvasHeader.css";

export const CanvasHeader = (props: { entry: GalleryPreviewEntry; canOpenInEditor: boolean }) => {
  const { entry } = props;
  const groups = groupSegments(entry.group);
  const [copied, setCopied] = useState<"idle" | "copied" | "failed">("idle");
  return (
    <header className={styles.root}>
      <div className={styles.titles}>
        {groups.length > 0 && <span className={styles.group}>{groups.join(" / ")}</span>}
        <h1 className={styles.name}>{entry.name}</h1>
      </div>
      <div className={styles.meta}>
        <code className={styles.file} title={entry.file}>
          {entry.file}
        </code>
        <span className={styles.status} role="status">
          {copied === "copied" ? "Link copied" : copied === "failed" ? "Copy failed" : ""}
        </span>
        <button
          type="button"
          className={secondaryButton}
          title="Copy a link to this preview with its variant, props and globals"
          onClick={async () => setCopied((await copyText(window.location.href)) ? "copied" : "failed")}
        >
          Copy link
        </button>
        {props.canOpenInEditor && (
          <button type="button" className={secondaryButton} onClick={() => openInEditor(entry.id)}>
            Open in editor
          </button>
        )}
      </div>
    </header>
  );
};
