import type { GalleryViewport } from "@vitrine/protocol";
import { BackgroundPicker } from "./background/BackgroundPicker";
import * as styles from "./StageToolbar.css";
import type { StageSettings } from "./stageSettings";
import { ViewportPicker } from "./viewport/ViewportPicker";

export const StageToolbar = (props: {
  settings: StageSettings;
  viewports: readonly GalleryViewport[];
  onChange: (patch: Partial<StageSettings>) => void;
}) => (
  <div className={styles.root}>
    <BackgroundPicker value={props.settings.background} onChange={(background) => props.onChange({ background })} />
    <ViewportPicker
      value={props.settings.viewport}
      viewports={props.viewports}
      onChange={(viewport) => props.onChange({ viewport })}
    />
  </div>
);
