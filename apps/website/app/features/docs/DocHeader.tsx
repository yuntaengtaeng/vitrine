import * as styles from "./docs.css";

export function DocHeader({ label, title, lead }: { label: string; title: string; lead: string }) {
  return (
    <header className={styles.intro}>
      <p className={styles.label}>{label}</p>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.lead}>{lead}</p>
    </header>
  );
}
