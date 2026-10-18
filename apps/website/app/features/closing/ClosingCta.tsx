import { Link } from "react-router";
import { SITE } from "../../site";
import { docsPath, useI18n } from "../../i18n/locale";
import { container } from "../../styles/layout.css";
import * as styles from "./ClosingCta.css";

export function ClosingCta() {
  const { locale, t } = useI18n();

  return (
    <section className={styles.section}>
      <div className={container}>
        <div className={styles.panel}>
          <div className={styles.copy}>
            <h2 className={styles.title}>{t.closing.title}</h2>
            <p className={styles.text}>{t.closing.text}</p>
          </div>
          <div className={styles.actions}>
            <Link className={styles.primary} to={docsPath(locale)}>{t.closing.start}</Link>
            <a className={styles.secondary} href={SITE.demoPath}>{t.closing.demo}</a>
          </div>
        </div>
      </div>
    </section>
  );
}
