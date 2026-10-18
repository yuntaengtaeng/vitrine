import { useI18n } from "../../i18n/locale";
import { CodeSnippet } from "../../components/CodeSnippet";
import { Placard } from "../../components/Placard";
import { SectionHeading } from "../../components/SectionHeading";
import { container, surfaceSection } from "../../styles/layout.css";
import * as styles from "./HowItWorks.css";

export function HowItWorks() {
  const { t } = useI18n();

  return (
    <section id="how-it-works" className={surfaceSection}>
      <div className={container}>
        <SectionHeading label={t.howItWorks.label} title={t.howItWorks.title} lead={t.howItWorks.lead} />
        <ol className={styles.wall}>
          {t.howItWorks.steps.map((step, index) => (
            <li key={step.title} className={styles.step}>
              <Placard number={`No. 0${index + 1}`} title={step.title} medium={step.medium} />
              <p className={styles.text}>{step.text}</p>
              <div className={styles.code}>
                <CodeSnippet code={step.code} />
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
