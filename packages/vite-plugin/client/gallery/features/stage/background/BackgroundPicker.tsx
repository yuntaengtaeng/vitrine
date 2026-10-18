import { BACKGROUND_LABEL, STAGE_BACKGROUNDS, type StageBackground } from "./background";
import * as styles from "./background.css";

export const BackgroundPicker = (props: { value: StageBackground; onChange: (background: StageBackground) => void }) => (
  <div
    className={styles.picker}
    role="group"
    aria-label="Background"
    title="Shown behind previews that do not paint their own background"
  >
    Background
    <span className={styles.swatches}>
      {STAGE_BACKGROUNDS.map((background) => (
        <button
          key={background}
          type="button"
          aria-label={BACKGROUND_LABEL[background]}
          title={BACKGROUND_LABEL[background]}
          aria-pressed={props.value === background}
          className={styles.swatch[background]}
          onClick={() => props.onChange(background)}
        />
      ))}
    </span>
  </div>
);
