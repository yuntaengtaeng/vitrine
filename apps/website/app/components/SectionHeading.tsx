import type { ReactNode } from "react";
import * as styles from "./SectionHeading.css";

/** 섹션 상단의 전시 라벨, 제목, 설명 묶음 */
export function SectionHeading({ label, title, lead }: { label: string; title: string; lead?: ReactNode }) {
  return (
    <>
      <p className={styles.label}>{label}</p>
      <h2 className={styles.title}>{title}</h2>
      {lead && <p className={styles.lead}>{lead}</p>}
    </>
  );
}
