import { Caption } from "./Caption";
import * as styles from "./Placard.css";

/** 미술관 작품 옆 라벨처럼 번호, 제목, 재료를 세로선 옆에 보여주는 표기 */
export function Placard({ number, title, medium }: { number?: string; title: string; medium?: string }) {
  return (
    <div className={styles.placard}>
      {number && <span className={styles.number}>{number}</span>}
      <Caption title={title} medium={medium} />
    </div>
  );
}
