import { Link, useLocation } from "react-router";
import { SITE } from "../site";
import { docsPath, homePath, useI18n } from "../i18n/locale";
import { container } from "../styles/layout.css";
import * as styles from "./SiteHeader.css";

export function SiteHeader() {
  const { locale, t } = useI18n();
  const otherLocale = locale === "ko" ? "en" : "ko";
  const onDocsPage = useLocation().pathname.endsWith("/docs");
  const otherLocalePath = onDocsPage ? docsPath(otherLocale) : homePath(otherLocale);

  return (
    <header className={styles.header}>
      <div className={`${container} ${styles.inner}`}>
        <Link className={styles.brand} to={homePath(locale)}>
          <img className={styles.logo} src="/favicon.svg" alt="" />
          {SITE.name}
        </Link>
        <nav className={styles.nav} aria-label="Main">
          <a className={styles.navLink} href={`${homePath(locale)}#how-it-works`}>{t.header.howItWorks}</a>
          <a className={styles.navLink} href={`${homePath(locale)}#features`}>{t.header.features}</a>
          <Link className={styles.navLink} to={docsPath(locale)}>{t.header.docs}</Link>
          <a className={styles.navLink} href={`${homePath(locale)}#faq`}>{t.header.faq}</a>
          <a className={styles.navLink} href={SITE.githubUrl}>GitHub</a>
          <Link className={styles.language} to={otherLocalePath} hrefLang={otherLocale} lang={otherLocale}>
            {t.header.switchLanguage}
          </Link>
          <Link className={styles.cta} to={docsPath(locale)}>{t.header.getStarted}</Link>
        </nav>
      </div>
    </header>
  );
}
