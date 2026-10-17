import * as styles from "./EmptyGallery.css";

const STARTER = `/** @preview */
export const Button = () => <button>Click me</button>;`;

const includeExample = (include: readonly string[]) =>
  `vitrine({ include: [${[...include, "packages/ui/**/*.tsx"].map((pattern) => `"${pattern}"`).join(", ")}] })`;

export const EmptyGallery = (props: { include: readonly string[] }) => (
  <section className={styles.root} aria-labelledby="vitrine-empty-heading">
    <h1 id="vitrine-empty-heading" className={styles.heading}>
      No previews yet
    </h1>
    <p className={styles.text}>Mark an exported component with a preview comment and save the file.</p>
    <pre className={styles.code}>{STARTER}</pre>
    <p className={styles.text}>Vitrine looks for previews in these files, relative to the Vite root:</p>
    <ul className={styles.patterns}>
      {props.include.map((pattern) => (
        <li key={pattern}>
          <code className={styles.inline}>{pattern}</code>
        </li>
      ))}
    </ul>
    <p className={styles.text}>If your components live elsewhere, add their folders in vite.config:</p>
    <pre className={styles.code}>{includeExample(props.include)}</pre>
  </section>
);
