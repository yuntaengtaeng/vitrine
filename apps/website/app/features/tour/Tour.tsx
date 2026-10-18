import { SITE } from "../../site";
import { useI18n } from "../../i18n/locale";
import { CopyCommand } from "../../components/CopyCommand";
import { SectionHeading } from "../../components/SectionHeading";
import { container, roomSection } from "../../styles/layout.css";
import * as styles from "./Tour.css";

export function Tour() {
  const { t } = useI18n();

  return (
    <section id="tour" className={roomSection}>
      <div className={`${container} ${styles.layout}`}>
        <div>
          <SectionHeading label={t.tour.label} title={t.tour.title} lead={t.tour.lead} />
          <div className={styles.command}>
            <CopyCommand command={t.tour.command} copyLabel={t.hero.copy} copiedLabel={t.hero.copied} />
          </div>
          <div className={styles.links}>
            <a className={styles.demo} href={SITE.demoPath}>
              {t.tour.demo}
            </a>
            <a className={styles.guide} href={SITE.staticPluginUrl}>
              {t.tour.guide}
            </a>
          </div>
        </div>
        <a className={styles.preview} href={SITE.demoPath}>
          <img
            className={styles.image}
            src="/screenshots/matrix-crop.png"
            alt=""
            loading="lazy"
            decoding="async"
          />
          <span className={styles.note}>{t.tour.note}</span>
        </a>
      </div>
    </section>
  );
}
