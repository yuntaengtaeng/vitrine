import * as styles from "./FeatureShowcase.css";

export function FeatureShowcase({ activeFeature }: { activeFeature: string }) {
  const features = ["props", "variants", "cursor", "groups"];

  return (
    <div className={styles.frame} aria-hidden="true">
      {features.map((feature) => (
        <div key={feature} className={feature === activeFeature ? `${styles.scene} ${styles.sceneActive}` : styles.scene}>
          <FeatureScene feature={feature} />
        </div>
      ))}
    </div>
  );
}

function FeatureScene({ feature }: { feature: string }) {
  if (feature === "variants") {
    return (
      <>
        <div className={styles.toolbar}><span>Primary</span><span className={styles.activeTab}>Danger</span></div>
        <div className={styles.canvas}><span className={styles.dangerButton}>Delete</span></div>
      </>
    );
  }

  if (feature === "cursor") {
    return (
      <div className={styles.editor}>
        <span>/** @preview */</span>
        <span className={styles.activeLine}>export const Primary = Button;</span>
        <span>/** @preview */</span>
        <span>export const Danger = Button;</span>
      </div>
    );
  }

  if (feature === "groups") {
    return (
      <div className={styles.tree}>
        <strong>Inputs</strong>
        <span className={styles.treeItem}>Button</span>
        <span className={styles.treeItem}>Checkbox</span>
        <strong>Feedback</strong>
        <span className={styles.treeItem}>Alert</span>
      </div>
    );
  }

  return (
    <div className={styles.controls}>
      <div className={styles.controlRow}><span>tone</span><span className={styles.controlValue}>primary</span></div>
      <div className={styles.controlRow}><span>children</span><span className={styles.controlValue}>Save</span></div>
      <div className={styles.controlRow}><span>disabled</span><span className={styles.toggle} /></div>
    </div>
  );
}
