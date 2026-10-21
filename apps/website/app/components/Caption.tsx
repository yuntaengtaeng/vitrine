import * as styles from "./Caption.css";

/** 작품 제목과 재료를 위아래로 묶은 표기 */
export function Caption({ title, medium }: { title: string; medium?: string }) {
  return (
    <p className={styles.caption}>
      <span className={styles.title}>{title}</span>
      {medium && <span className={styles.medium}>{medium}</span>}
    </p>
  );
}
