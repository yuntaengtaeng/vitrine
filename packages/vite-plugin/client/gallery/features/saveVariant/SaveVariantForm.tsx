import { useEffect, useRef, useState } from "react";
import { saveVariant, savableArgs } from "./saveVariant";
import * as styles from "./SaveVariantForm.css";

// 저장 결과는 잠깐 보여주고 지워 탭 줄에 남지 않게 함
const SAVED_NOTICE_MS = 3000;

export const SaveVariantForm = (props: { previewId: string; args: Record<string, unknown> }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const rootRef = useRef<HTMLSpanElement>(null);

  const close = () => {
    setOpen(false);
    setError(null);
  };

  useEffect(() => {
    if (!savedKey) return;
    const timer = setTimeout(() => setSavedKey(null), SAVED_NOTICE_MS);
    return () => clearTimeout(timer);
  }, [savedKey]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const submit = async () => {
    setSaving(true);
    setError(null);
    const outcome = await saveVariant({ previewId: props.previewId, name, args: savableArgs(props.args) });
    setSaving(false);
    if (!outcome.ok) return setError(outcome.reason);
    setSavedKey(outcome.key);
    setName("");
    close();
  };

  return (
    <span ref={rootRef} className={styles.root}>
      {savedKey && (
        <span className={styles.saved} role="status">
          Saved as {savedKey}
        </span>
      )}
      <button type="button" className={styles.button} aria-expanded={open} onClick={() => (open ? close() : setOpen(true))}>
        Save as variant
      </button>
      {open && (
        <form
          className={styles.popover}
          aria-label="Save as variant"
          onSubmit={(event) => {
            event.preventDefault();
            if (name.trim() && !saving) void submit();
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") close();
          }}
        >
          <label className={styles.label}>
            Variant name
            <input
              className={styles.input}
              value={name}
              autoFocus
              onChange={(event) => setName(event.currentTarget.value)}
            />
          </label>
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
          <div className={styles.actions}>
            <button type="button" className={styles.button} onClick={close}>
              Cancel
            </button>
            <button type="submit" className={styles.button} disabled={!name.trim() || saving}>
              {saving ? "Saving" : "Save"}
            </button>
          </div>
        </form>
      )}
    </span>
  );
};
