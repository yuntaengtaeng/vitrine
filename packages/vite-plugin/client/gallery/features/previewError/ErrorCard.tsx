import { secondaryButton } from "../../shared/ui/button.css";
import * as styles from "./ErrorCard.css";
import { stackFrames, type PreviewFailure } from "./errorDetails";

export const ErrorCard = (props: { failure: PreviewFailure; onOpenInEditor?: () => void }) => {
  const frames = stackFrames(props.failure, window.location.origin);
  return (
    <section role="alert" aria-label="Preview error" className={styles.root}>
      <div className={styles.header}>
        <div className={styles.titles}>
          <h2 className={styles.title}>This preview failed to render</h2>
          <p className={styles.message}>{props.failure.message}</p>
        </div>
        {props.onOpenInEditor && (
          <button type="button" className={secondaryButton} onClick={props.onOpenInEditor}>
            Open in editor
          </button>
        )}
      </div>
      {frames.length > 0 && (
        <details className={styles.details}>
          <summary className={styles.summary}>Stack trace</summary>
          <pre className={styles.stack}>
            {frames.map((frame, index) => (
              <div key={index} className={frame.library ? styles.libraryFrame : undefined}>
                {frame.text}
              </div>
            ))}
          </pre>
        </details>
      )}
    </section>
  );
};
