import * as styles from "./Placard.css";

/** 미술관 작품 옆 라벨처럼 번호, 제목, 재료를 보여주는 표기 */
export function Placard({ number, title, medium }: { number?: string; title: string; medium?: string }) {
  return (
    <p className={styles.placard}>
      {number && <span className={styles.number}>{number}</span>}
      <span className={styles.title}>{title}</span>
      {medium && <span className={styles.medium}>{medium}</span>}
    </p>
  );
}
