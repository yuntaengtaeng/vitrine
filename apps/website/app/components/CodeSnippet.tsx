import * as styles from "./CodeSnippet.css";

/** 짧은 코드 예시 블록, 주석 줄만 강조색으로 구분 */
export function CodeSnippet({ code }: { code: string }) {
  return (
    <pre className={styles.snippet}>
      {code.split("\n").map((line, index) => (
        <span key={index} className={line.trimStart().startsWith("/**") ? styles.comment : undefined}>
          {line}
          {"\n"}
        </span>
      ))}
    </pre>
  );
}
