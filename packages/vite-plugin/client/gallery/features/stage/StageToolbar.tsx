import type { GalleryViewport } from "@vitrine/protocol";
import type { CSSProperties } from "react";
import { BackgroundPicker } from "./background/BackgroundPicker";
import type { StageSettings } from "./stageSettings";
import { ViewportPicker } from "./viewport/ViewportPicker";

const Styled = {
  Root: { display: "flex", alignItems: "center", gap: "0.9rem", marginLeft: "auto" } satisfies CSSProperties,
};

export const StageToolbar = (props: {
  settings: StageSettings;
  viewports: readonly GalleryViewport[];
  onChange: (patch: Partial<StageSettings>) => void;
}) => (
  <div style={Styled.Root}>
    <BackgroundPicker value={props.settings.background} onChange={(background) => props.onChange({ background })} />
    <ViewportPicker
      value={props.settings.viewport}
      viewports={props.viewports}
      onChange={(viewport) => props.onChange({ viewport })}
    />
  </div>
);
