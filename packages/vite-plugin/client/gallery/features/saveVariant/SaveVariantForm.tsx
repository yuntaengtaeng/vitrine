import { useState } from "react";
import { saveVariant, savableArgs } from "./saveVariant";
import * as styles from "./SaveVariantForm.css";

type Status = { kind: "idle" } | { kind: "saving" } | { kind: "done"; message: string };

export const SaveVariantForm = (props: { previewId: string; args: Record<string, unknown> }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const submit = async () => {
    setStatus({ kind: "saving" });
    const outcome = await saveVariant({ previewId: props.previewId, name, args: savableArgs(props.args) });
    setStatus({ kind: "done", message: outcome.ok ? `Saved as ${outcome.key}` : outcome.reason });
    if (outcome.ok) {
      setOpen(false);
      setName("");
    }
  };

  const message = status.kind === "saving" ? "Saving" : status.kind === "done" ? status.message : "";
  return (
    <span className={styles.form}>
      <span className={styles.status} role="status">
        {message}
      </span>
      {open ? (
        <form
          className={styles.form}
          onSubmit={(event) => {
            event.preventDefault();
            if (name.trim()) void submit();
          }}
        >
          <input
            className={styles.input}
            aria-label="Variant name"
            placeholder="Variant name"
            value={name}
            autoFocus
            onChange={(event) => setName(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") setOpen(false);
            }}
          />
          <button type="submit" className={styles.button} disabled={!name.trim() || status.kind === "saving"}>
            Save
          </button>
          <button type="button" className={styles.button} onClick={() => setOpen(false)}>
            Cancel
          </button>
        </form>
      ) : (
        <button type="button" className={styles.button} onClick={() => setOpen(true)}>
          Save as variant
        </button>
      )}
    </span>
  );
};
