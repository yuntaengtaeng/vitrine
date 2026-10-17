import type { CSSProperties } from "react";
import { COLOR } from "../../tokens/color";
import { FONT_SIZE } from "../../tokens/fontSize";
import { FIELD_BORDER } from "../controls/fieldStyle";
import { BACKGROUND_STYLE, STAGE_BACKGROUNDS, type StageBackground } from "./background";

const Styled = {
  Root: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: FONT_SIZE.label, color: COLOR.label } satisfies CSSProperties,
  Swatches: { display: "inline-flex", gap: 4 } satisfies CSSProperties,
  Swatch: { width: 20, height: 20, padding: 0, border: FIELD_BORDER, borderRadius: 5, cursor: "pointer" } satisfies CSSProperties,
  Active: { outline: `2px solid ${COLOR.activeText}`, outlineOffset: 1 } satisfies CSSProperties,
};

/** 무대 프레임 배경 선택, 프리뷰가 자기 배경을 칠하면 그 배경이 보임 */
export const BackgroundPicker = (props: { value: StageBackground; onChange: (background: StageBackground) => void }) => (
  <div
    style={Styled.Root}
    role="group"
    aria-label="Background"
    title="Shown behind previews that do not paint their own background"
  >
    Background
    <span style={Styled.Swatches}>
      {STAGE_BACKGROUNDS.map((background) => {
        const active = props.value === background;
        const { label, swatch } = BACKGROUND_STYLE[background];
        return (
          <button
            key={background}
            type="button"
            aria-label={label}
            title={label}
            aria-pressed={active}
            style={{ ...Styled.Swatch, background: swatch, ...(active ? Styled.Active : {}) }}
            onClick={() => props.onChange(background)}
          />
        );
      })}
    </span>
  </div>
);
