import { SITE } from "../site";
import { useI18n } from "../i18n/locale";
import { container } from "../styles/layout.css";
import * as styles from "./SiteFooter.css";

export function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className={styles.footer}>
      <div className={`${container} ${styles.inner}`}>
        <span>{t.footer.tagline}</span>
        <div className={styles.links}>
          <a className={styles.link} href={SITE.npmUrl}>npm</a>
          <a className={styles.link} href={SITE.marketplaceUrl}>VS Code Marketplace</a>
          <a className={styles.link} href={SITE.githubUrl}>GitHub</a>
          <a className={styles.link} href={SITE.issuesUrl}>{t.footer.reportIssue}</a>
        </div>
      </div>
    </footer>
  );
}
