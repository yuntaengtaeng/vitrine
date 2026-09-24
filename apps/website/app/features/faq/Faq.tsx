import { useI18n } from "../../i18n/locale";
import { SITE } from "../../site";
import { SectionHeading } from "../../components/SectionHeading";
import { container, section } from "../../styles/layout.css";
import * as styles from "./Faq.css";

export function Faq() {
  const { t } = useI18n();

  return (
    <section id="faq" className={section}>
      <div className={container}>
        <SectionHeading label={t.faq.label} title={t.faq.title} />
        <div className={styles.list}>
          {t.faq.items.map((item) => (
            <details key={item.question} className={styles.item}>
              <summary className={styles.question}>{item.question}</summary>
              <p className={styles.answer}>{item.answer}</p>
            </details>
          ))}
          <details className={styles.item}>
            <summary className={styles.question}>{t.faq.reportIssue.question}</summary>
            <p className={styles.answer}>
              {t.faq.reportIssue.beforeLink}
              <a className={styles.answerLink} href={SITE.issuesUrl}>{t.faq.reportIssue.link}</a>
              {t.faq.reportIssue.afterLink}
            </p>
          </details>
        </div>
      </div>
    </section>
  );
}
