import { preview } from "vite-plugin-react-vitrine/preview";

/** @preview */
export const Toast = ({ message, onUndo }: { message: string; onUndo?: () => void }) => (
  <div
    role="status"
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "0.75rem",
      padding: "0.6rem 0.9rem",
      borderRadius: 8,
      background: "#111827",
      color: "white",
      fontSize: "0.9rem",
    }}
  >
    {message}
    {onUndo && (
      <button type="button" onClick={onUndo} style={{ border: 0, background: "transparent", color: "#93c5fd" }}>
        Undo
      </button>
    )}
  </div>
);

preview(Toast, {
  args: { message: "Changes saved", onUndo: () => {} },
});
