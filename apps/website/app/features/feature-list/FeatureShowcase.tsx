import * as styles from "./FeatureShowcase.css";

const FEATURES = ["props", "variants", "globals", "groups", "viewport", "matrix", "actions", "history", "vscode", "links", "static"];

export function FeatureShowcase({ activeFeature }: { activeFeature: string }) {
  return (
    <div className={styles.frame} aria-hidden="true">
      {FEATURES.map((feature) => (
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
      <div className={styles.withToolbar}>
        <div className={styles.toolbar}><span>Primary</span><span className={styles.activeTab}>Danger</span></div>
        <div className={styles.canvas}><span className={styles.dangerButton}>Delete</span></div>
      </div>
    );
  }

  if (feature === "matrix") {
    const tones = [
      { name: "primary", button: styles.primaryButton },
      { name: "danger", button: styles.dangerButton },
    ];
    return (
      <div className={styles.matrix}>
        {tones.flatMap((tone, row) =>
          ["sm", "md", "lg"].map((size, column) => (
            <span
              key={`${tone.name}-${size}`}
              className={`${styles.cell} ${styles.reveal}`}
              style={{ animationDelay: `${(row * 3 + column) * 60}ms` }}
            >
              {tone.name}, {size}
              <span className={tone.button} style={{ fontSize: `${0.6875 + column * 0.125}rem` }}>Save</span>
            </span>
          )),
        )}
      </div>
    );
  }

  if (feature === "actions") {
    return (
      <div className={styles.split}>
        <div className={styles.canvas}>
          <span className={styles.toast}>Post published <span className={styles.toastAction}>Undo</span></span>
        </div>
        <div className={styles.log}>
          <span className={styles.reveal} style={{ animationDelay: "300ms" }}>
            12:04:31 <span className={styles.logName}>onUndo</span> [event click]
          </span>
          <span className={styles.reveal} style={{ animationDelay: "700ms" }}>
            12:04:33 <span className={styles.logName}>onDismiss</span> [event click]
          </span>
        </div>
      </div>
    );
  }

  if (feature === "globals") {
    return (
      <div className={styles.withToolbar}>
        <div className={styles.toolbar}>
          <span>Theme <span className={styles.select}>dark</span></span>
          <span>Locale <span className={styles.select}><Swap from="en" to="ko" /></span></span>
        </div>
        <div className={styles.darkCanvas}>
          <span className={`${styles.card} ${styles.reveal}`}>
            Ada Park
            <span className={styles.primaryButton}><Swap from="Follow" to="팔로우" late /></span>
          </span>
        </div>
      </div>
    );
  }

  if (feature === "history") {
    return (
      <div className={styles.withToolbar}>
        <div className={styles.toolbar}><span>Compare</span><span className={styles.activeTab}>Snapshot 1</span></div>
        <div className={styles.compare}>
          <span className={styles.version}>Snapshot 1<span className={styles.neutralButton}>Save</span></span>
          <span className={`${styles.version} ${styles.reveal}`}>Current<span className={styles.primaryButton}>Save changes</span></span>
        </div>
      </div>
    );
  }

  if (feature === "viewport") {
    return (
      <div className={styles.withToolbar}>
        <div className={styles.toolbar}>
          <span>Viewport <span className={styles.select}>Mobile</span></span>
        </div>
        <div className={styles.stage}>
          <div className={styles.viewportFrame}>
            <span className={styles.widthLabel}>375px</span>
            <span className={styles.bar} />
            <span className={styles.bar} style={{ width: "70%" }} />
            <span className={styles.primaryButton}>Save</span>
          </div>
        </div>
      </div>
    );
  }

  if (feature === "links") {
    return (
      <div className={styles.withToolbar}>
        <span className={styles.address}>
          /__vitrine#preview=src%2FButton.tsx%23Button<span className={styles.addressParam}>&amp;variant=danger</span>
        </span>
        <div className={styles.split}>
          <div className={styles.canvas}><span className={styles.dangerButton}>Delete</span></div>
          <span className={`${styles.copied} ${styles.reveal}`} style={{ animationDelay: "500ms", marginBottom: "1rem" }}>
            Link copied
          </span>
        </div>
      </div>
    );
  }

  if (feature === "vscode") {
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

  if (feature === "static") {
    const lines = ["vitrine-static/index.html", "vitrine-static/frame.html", "vitrine-static/assets/", "Gallery written to vitrine-static"];
    return (
      <div className={styles.editor}>
        <span>$ npx vitrine-static build</span>
        {lines.map((line, index) => (
          <span key={line} className={styles.reveal} style={{ animationDelay: `${200 + index * 220}ms` }}>
            {line}
          </span>
        ))}
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

// 결과만 보여 주면 번역이 잘못된 것처럼 보여서, 값이 바뀌는 순간을 보여 줌
function Swap({ from, to, late = false }: { from: string; to: string; late?: boolean }) {
  return (
    <span className={styles.swap}>
      <span className={late ? styles.swapFromLate : styles.swapFrom}>{from}</span>
      <span className={late ? styles.swapToLate : styles.swapTo}>{to}</span>
    </span>
  );
}
