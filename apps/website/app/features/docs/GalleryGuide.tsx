import { useI18n } from "../../i18n/locale";
import { SITE } from "../../site";
import { DocHeader } from "./DocHeader";
import { OptionList } from "./OptionList";
import * as styles from "./docs.css";

export function GalleryGuide() {
  const { t } = useI18n();
  const page = t.docs.gallery;

  return (
    <main className={styles.article}>
      <DocHeader label="/__vitrine" title={page.title} lead={page.lead} />
      <div className={styles.guide}>
        <div className={styles.docContent}>
          {page.sections.map((section) => (
            <section key={section.title} className={styles.providerSection}>
              <h2 className={styles.providerTitle}>{section.title}</h2>
              <p className={styles.providerText}>{section.text}</p>
              {section.items.length > 0 && <OptionList items={section.items} />}
            </section>
          ))}
          <a className={styles.textLink} href={SITE.demoPath}>{t.hero.demo}</a>
        </div>
      </div>
    </main>
  );
}
