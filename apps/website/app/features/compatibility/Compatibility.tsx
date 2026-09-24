import { useI18n } from "../../i18n/locale";
import { SectionHeading } from "../../components/SectionHeading";
import { container, surfaceSection } from "../../styles/layout.css";
import * as styles from "./Compatibility.css";

export function Compatibility() {
  const { t } = useI18n();

  return (
    <section className={surfaceSection}>
      <div className={container}>
        <SectionHeading label={t.compatibility.label} title={t.compatibility.title} />
        <p className={styles.statement}>{t.compatibility.lead}</p>
      </div>
    </section>
  );
}
