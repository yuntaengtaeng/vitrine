import { useI18n } from "../../i18n/locale";
import { Frame } from "../../components/Frame";
import { Placard } from "../../components/Placard";
import { SectionHeading } from "../../components/SectionHeading";
import { container, section } from "../../styles/layout.css";
import * as styles from "./Collection.css";

const exhibitNumber = (index: number) => `No. ${String(index + 1).padStart(2, "0")}`;

export function Collection() {
  const { t } = useI18n();
  const { exhibits, notes } = t.features;

  return (
    <section id="features" className={section}>
      <div className={container}>
        <SectionHeading label={t.features.label} title={t.features.title} lead={t.features.lead} />
        <ol className={styles.wall}>
          {exhibits.map((exhibit, index) => (
            <li key={exhibit.id} className={styles.exhibit}>
              <Frame src={exhibit.image} alt={exhibit.alt} />
              <div className={styles.label}>
                <Placard number={exhibitNumber(index)} title={exhibit.title} medium={exhibit.medium} />
                <p className={styles.text}>{exhibit.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <ul className={styles.notes}>
          {notes.map((note, index) => (
            <li key={note.title} className={styles.note}>
              <Placard number={exhibitNumber(exhibits.length + index)} title={note.title} medium={note.medium} />
              <p className={styles.text}>{note.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
