import type { CSSProperties } from "react";
import { COLOR } from "../tokens/color";
import { FONT_SIZE } from "../tokens/fontSize";
import { FIELD_BORDER, FIELD_BORDER_RADIUS } from "./controls/fieldStyle";
import {
  STAGE_BACKGROUNDS,
  STAGE_WIDTHS,
  stageWidthLabel,
  type StageBackground,
  type StageSettings,
} from "../preview/stageSettings";

const SWATCH: Record<StageBackground, { label: string; background: string }> = {
  light: { label: "Light background", background: COLOR.surface },
  dark: { label: "Dark background", background: COLOR.frameDarkBg },
  transparent: {
    label: "Transparent background",
    background: `repeating-conic-gradient(${COLOR.checkerDark} 0 25%, ${COLOR.checkerLight} 0 50%) 0 0 / 8px 8px`,
  },
};

const Styled = {
  Root: { display: "flex", alignItems: "center", gap: "0.9rem", marginLeft: "auto" } satisfies CSSProperties,
  Group: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: FONT_SIZE.label, color: COLOR.label } satisfies CSSProperties,
  Swatches: { display: "inline-flex", gap: 4 } satisfies CSSProperties,
  Swatch: {
    width: 20,
    height: 20,
    padding: 0,
    border: FIELD_BORDER,
    borderRadius: 5,
    cursor: "pointer",
  } satisfies CSSProperties,
  SwatchActive: { outline: `2px solid ${COLOR.activeText}`, outlineOffset: 1 } satisfies CSSProperties,
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

export const StageToolbar = (props: { settings: StageSettings; onChange: (patch: Partial<StageSettings>) => void }) => (
  <div style={Styled.Root}>
    <div style={Styled.Group} role="group" aria-label="Background">
      Background
      <span style={Styled.Swatches}>
        {STAGE_BACKGROUNDS.map((background) => {
          const active = props.settings.background === background;
          return (
            <button
              key={background}
              type="button"
              aria-label={SWATCH[background].label}
              title={SWATCH[background].label}
              aria-pressed={active}
              style={{ ...Styled.Swatch, background: SWATCH[background].background, ...(active ? Styled.SwatchActive : {}) }}
              onClick={() => props.onChange({ background })}
            />
          );
        })}
      </span>
    </div>
    <label style={Styled.Group} title="Sets the preview frame width, media queries still follow the window width">
      Frame width
      <select
        style={Styled.Select}
        value={String(props.settings.width)}
        onChange={(event) => {
          const width = STAGE_WIDTHS.find((option) => String(option) === event.currentTarget.value);
          if (width !== undefined) props.onChange({ width });
        }}
      >
        {STAGE_WIDTHS.map((width) => (
          <option key={width} value={String(width)}>
            {stageWidthLabel(width)}
          </option>
        ))}
      </select>
    </label>
  </div>
);
