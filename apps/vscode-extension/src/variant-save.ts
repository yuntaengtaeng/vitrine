import crypto from "node:crypto";

/** 확장이 편집을 적용해도 되는지, 안 되면 Gallery에 보여줄 이유 */
export function variantEditConflict(documentText: string, isDirty: boolean, contentHash: string): string | null {
  const hash = crypto.createHash("sha256").update(documentText).digest("hex");
  if (hash === contentHash) return null;
  return isDirty
    ? "The file has unsaved changes. Save or undo them, then try again"
    : "The file changed after the gallery read it. Try again";
}
