import { Link } from "react-router";
import { SITE } from "../../site";
import { docsPath, useI18n } from "../../i18n/locale";
import { CopyCommand } from "../../components/CopyCommand";
import { Placard } from "../../components/Placard";
import { container } from "../../styles/layout.css";
import * as styles from "./Hero.css";

export function Hero() {
  const { locale, t } = useI18n();

  return (
    <section className={styles.hero}>
      <div className={container}>
        <p className={styles.label}>{t.hero.label}</p>
        <h1 className={styles.title}>
          {t.hero.titleLead}
          <em className={styles.titleAccent}>{t.hero.titleAccent}</em>
        </h1>
        <div className={styles.intro}>
          <p className={styles.lead}>{t.hero.lead}</p>
          <div className={styles.actions}>
            <a className={styles.primary} href={SITE.demoPath}>
              {t.hero.demo}
            </a>
            <Link className={styles.secondary} to={docsPath(locale)}>
              {t.hero.start}
            </Link>
          </div>
          <CopyCommand command={SITE.installCommand} copyLabel={t.hero.copy} copiedLabel={t.hero.copied} />
        </div>

        <figure className={styles.exhibit}>
          <div className={styles.glass}>
            <picture>
              <source srcSet="/screenshots/gallery-dark.png" media="(prefers-color-scheme: dark)" />
              <img
                className={styles.screenshot}
                src="/screenshots/gallery.png"
                alt={t.hero.exhibit.alt}
                width={2560}
                height={1600}
                fetchPriority="high"
              />
            </picture>
          </div>
          <div className={styles.plinth} aria-hidden="true" />
          <figcaption className={styles.caption}>
            <Placard number={t.hero.exhibit.number} title={t.hero.exhibit.title} medium={t.hero.exhibit.medium} />
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
