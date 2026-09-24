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
          <div>
            <p className={styles.label}>{t.hero.label}</p>
            <h1 className={styles.title}>
              {t.hero.titleLead}
              <span className={styles.titleAccent}>{t.hero.titleAccent}</span>
            </h1>
          </div>
          <div>
            <p className={styles.lead}>{t.hero.lead}</p>
            <div className={styles.actions}>
              <CopyCommand command={SITE.installCommand} copyLabel={t.hero.copy} copiedLabel={t.hero.copied} />
              <a className={styles.extension} href={SITE.marketplaceUrl}>
                {t.hero.extension}
              </a>
            </div>
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
