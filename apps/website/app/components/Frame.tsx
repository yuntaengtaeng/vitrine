import * as styles from "./Frame.css";

/** 흰 여백과 얇은 액자로 스크린샷을 전시품처럼 감싼 이미지 */
export function Frame({ src, alt }: { src: string; alt: string }) {
  return (
    <div className={styles.frame}>
      <img className={styles.image} src={src} alt={alt} loading="lazy" decoding="async" />
    </div>
  );
}
