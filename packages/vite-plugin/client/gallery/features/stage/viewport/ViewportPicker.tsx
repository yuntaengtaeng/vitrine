import type { GalleryViewport } from "@vitrine/protocol";
import type { CSSProperties } from "react";
import { COLOR } from "../../../../tokens/color";
import { FONT_SIZE } from "../../../../tokens/fontSize";
import { FIELD_BORDER, FIELD_BORDER_RADIUS } from "../../../shared/ui/fieldStyle";
import { RESPONSIVE_VIEWPORT, findViewport, viewportLabel } from "./viewport";

const Styled = {
  Root: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: FONT_SIZE.label, color: COLOR.label } satisfies CSSProperties,
  Select: {
    height: 26,
    padding: "0 0.4rem",
    border: FIELD_BORDER,
    borderRadius: FIELD_BORDER_RADIUS,
    background: COLOR.surface,
    color: COLOR.body,
    fontFamily: "inherit",
    fontSize: FONT_SIZE.label,
  } satisfies CSSProperties,
};

export const ViewportPicker = (props: {
  value: string;
  viewports: readonly GalleryViewport[];
  onChange: (viewport: string) => void;
}) => {
  const value = findViewport(props.value, props.viewports)?.name ?? RESPONSIVE_VIEWPORT;
  return (
    <label style={Styled.Root}>
      Viewport
      <select style={Styled.Select} value={value} onChange={(event) => props.onChange(event.currentTarget.value)}>
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
