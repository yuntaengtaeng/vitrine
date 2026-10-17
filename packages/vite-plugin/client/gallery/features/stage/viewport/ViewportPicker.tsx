import type { GalleryViewport } from "@vitrine/protocol";
import { RESPONSIVE_VIEWPORT, findViewport, viewportLabel } from "./viewport";
import * as styles from "./ViewportPicker.css";

export const ViewportPicker = (props: {
  value: string;
  viewports: readonly GalleryViewport[];
  onChange: (viewport: string) => void;
}) => {
  const value = findViewport(props.value, props.viewports)?.name ?? RESPONSIVE_VIEWPORT;
  return (
    <label className={styles.picker}>
      Viewport
      <select className={styles.select} value={value} onChange={(event) => props.onChange(event.currentTarget.value)}>
        <option value={RESPONSIVE_VIEWPORT}>{RESPONSIVE_VIEWPORT}</option>
        {props.viewports.map((viewport) => (
          <option key={viewport.name} value={viewport.name}>
            {viewportLabel(viewport)}
          </option>
        ))}
      </select>
    </label>
  );
};
