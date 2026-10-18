import { preview } from "vite-plugin-react-vitrine/preview";

/** @preview name="Feedback/Toast" */
export const Toast = ({
  message,
  onUndo,
  onDismiss,
}: {
  message: string;
  onUndo?: () => void;
  onDismiss?: () => void;
}) => (
  <div role="status" className="toast">
    {message}
    {onUndo && (
      <button type="button" onClick={onUndo}>
        Undo
      </button>
    )}
    {onDismiss && (
      <button type="button" className="dismiss" onClick={onDismiss}>
        Dismiss
      </button>
    )}
  </div>
);

preview(Toast, {
  args: { message: "Post published", onUndo: () => {}, onDismiss: () => {} },
});
