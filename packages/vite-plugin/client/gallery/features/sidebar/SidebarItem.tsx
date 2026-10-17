import * as styles from "./SidebarItem.css";

export const SidebarItem = (props: {
  entry: GalleryPreviewEntry;
  isActive: boolean;
  failed: boolean;
  onSelect: (id: string) => void;
}) => {
  const { entry } = props;
  return (
    <button
      type="button"
      aria-current={props.isActive ? "true" : undefined}
      className={styles.item}
      title={props.failed ? `${entry.file}, failed to render` : entry.file}
      onClick={() => props.onSelect(entry.id)}
    >
      {entry.name}
      {props.failed && <span aria-hidden="true" className={styles.failedDot} data-preview-failed />}
    </button>
  );
};
