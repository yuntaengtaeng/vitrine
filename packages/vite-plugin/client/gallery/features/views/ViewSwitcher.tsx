import * as styles from "./ViewSwitcher.css";

export const ViewSwitcher = (props: {
  views: readonly { id: string; label: string }[];
  activeId: string;
  onSelect: (id: string) => void;
}) => (
  <div className={styles.root} role="group" aria-label="View">
    {props.views.map((view) => (
      <button
        key={view.id}
        type="button"
        aria-pressed={view.id === props.activeId}
        className={styles.option}
        onClick={() => props.onSelect(view.id)}
      >
        {view.label}
      </button>
    ))}
  </div>
);
