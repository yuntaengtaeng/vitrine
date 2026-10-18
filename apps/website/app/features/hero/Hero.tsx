import { SITE } from "../../site";
import { useI18n } from "../../i18n/locale";
import { CopyCommand } from "../../components/CopyCommand";
import { container } from "../../styles/layout.css";
import { ExhibitionDemo } from "./ExhibitionDemo";
import * as styles from "./Hero.css";

export function Hero() {
  const { t } = useI18n();

  return (
    <section className={styles.hero}>
      <div className={container}>
        <div className={styles.intro}>
          <p className={styles.label}>{t.hero.label}</p>
          <h1 className={styles.title}>
            {t.hero.titleLead}
            <span className={styles.titleAccent}>{t.hero.titleAccent}</span>
          </h1>
          <p className={styles.lead}>
            {t.hero.leadStart}
            <code className={styles.leadCode}>/** @preview */</code>
            {t.hero.leadEnd}
          </p>
          <div className={styles.actions}>
            <a className={styles.demoLink} href={SITE.demoPath}>
              {t.hero.demo}
            </a>
            <CopyCommand command={SITE.installCommand} copyLabel={t.hero.copy} copiedLabel={t.hero.copied} />
          </div>
        </div>
        <div className={styles.demo}>
          <ExhibitionDemo />
          <p className={styles.hint}>{t.hero.demoHint}</p>
        </div>
      </div>
    </section>
  );
}
