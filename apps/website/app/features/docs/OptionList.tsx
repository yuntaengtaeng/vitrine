import * as styles from "./docs.css";

/** 이름과 설명 쌍의 목록, 이름은 코드로 표시 */
export function OptionList({ items }: { items: readonly { name: string; text: string }[] }) {
  return (
    <dl className={styles.options}>
      {items.map((item) => (
        <div key={item.name} className={styles.option}>
          <dt className={styles.optionName}><code>{item.name}</code></dt>
          <dd className={styles.optionDescription}>{item.text}</dd>
        </div>
      ))}
    </dl>
  );
}
