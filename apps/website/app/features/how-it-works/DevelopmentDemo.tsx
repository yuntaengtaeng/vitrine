import { useEffect, useRef, useState } from "react";
import { useI18n } from "../../i18n/locale";
import * as styles from "./DevelopmentDemo.css";

type PreviewStatus = "waiting" | "scanning" | "ready";
type PreviewName = "Button" | "Badge";

interface DemoFrame {
  code: string;
  previewStatus: PreviewStatus;
  previews: PreviewName[];
  activePreview?: PreviewName;
  label: string;
  activeLine?: number;
  duration: number;
}

const COMMENT = "/** @preview */";
const BUTTON_WITH_SAVE = "export const Button = () => <button>Save</button>;";
const BUTTON_WITH_PUBLISH = "export const Button = () => <button>Publish</button>;";
const BADGE = "export const Badge = () => <span>New</span>;";

function typed(value: string, frame: Omit<DemoFrame, "code" | "duration">, duration: number): DemoFrame[] {
  return Array.from({ length: value.length }, (_, index) => ({
    ...frame,
    code: value.slice(0, index + 1),
    duration,
  }));
}

const BUTTON_CODE = `${COMMENT}\n${BUTTON_WITH_SAVE}`;
const UPDATED_BUTTON_CODE = `${COMMENT}\n${BUTTON_WITH_PUBLISH}`;
const BOTH_COMPONENTS = `${UPDATED_BUTTON_CODE}\n\n${COMMENT}\n${BADGE}`;
const WAITING = { previewStatus: "waiting" as const, previews: [], label: "" };
const BUTTON_READY = {
  previewStatus: "ready" as const,
  previews: ["Button"] as PreviewName[],
  activePreview: "Button" as const,
  activeLine: 1,
};

const PLAYBACK: DemoFrame[] = [
  { code: "", ...WAITING, duration: 80 },
  ...typed(BUTTON_WITH_SAVE, WAITING, 16),
  { code: BUTTON_WITH_SAVE, ...WAITING, duration: 480 },
  ...typed(COMMENT, WAITING, 28).map((frame) => ({ ...frame, code: `${frame.code}\n${BUTTON_WITH_SAVE}` })),
  { code: BUTTON_CODE, ...WAITING, previewStatus: "scanning", duration: 650 },
  { code: BUTTON_CODE, ...BUTTON_READY, label: "Save", duration: 1100 },
  ...["Sav", "Sa", "S", "", "P", "Pu", "Pub", "Publ", "Publi", "Publis", "Publish"].map((label) => ({
    code: `${COMMENT}\nexport const Button = () => <button>${label}</button>;`,
    ...BUTTON_READY,
    label,
    duration: 60,
  })),
  { code: UPDATED_BUTTON_CODE, ...BUTTON_READY, label: "Publish", duration: 1100 },
  ...typed(`${COMMENT}\n${BADGE}`, { ...BUTTON_READY, label: "Publish" }, 15).map((frame) => ({
    ...frame,
    code: `${UPDATED_BUTTON_CODE}\n\n${frame.code}`,
    activeLine: undefined,
  })),
  {
    code: BOTH_COMPONENTS,
    ...BUTTON_READY,
    label: "Publish",
    previewStatus: "scanning",
    duration: 650,
  },
  {
    code: BOTH_COMPONENTS,
    previewStatus: "ready",
    previews: ["Button", "Badge"],
    activePreview: "Button",
    label: "Publish",
    activeLine: 1,
    duration: 1100,
  },
  {
    code: BOTH_COMPONENTS,
    previewStatus: "ready",
    previews: ["Button", "Badge"],
    activePreview: "Badge",
    label: "New",
    activeLine: 4,
    duration: 0,
  },
];
const COMPLETE_FRAME = PLAYBACK.at(-1)!;

export function DevelopmentDemo() {
  const { t } = useI18n();
  const demoRef = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState(COMPLETE_FRAME);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frameIndex = 0;
    let playbackTimer: ReturnType<typeof setTimeout> | undefined;
    const playNextFrame = () => {
      const nextFrame = PLAYBACK[frameIndex];
      if (!nextFrame) return;
      setFrame(nextFrame);
      frameIndex += 1;
      playbackTimer = setTimeout(playNextFrame, nextFrame.duration);
    };

    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      playbackTimer = setTimeout(playNextFrame, 250);
    }, { threshold: 0.35 });
    if (demoRef.current) observer.observe(demoRef.current);

    return () => {
      observer.disconnect();
      clearTimeout(playbackTimer);
    };
  }, []);

  const statusLabel = frame.previewStatus === "scanning"
    ? t.howItWorks.scanningPreview
    : frame.previewStatus === "ready"
      ? t.howItWorks.previewReady
      : "";

  return (
    <div ref={demoRef} className={styles.demo} role="img" aria-label={t.howItWorks.demoAria}>
      <div className={styles.editor}>
        <div className={styles.bar}>Components.tsx</div>
        <pre className={styles.code} aria-hidden="true">
          <code>
            {frame.code.split("\n").map((line, index) => {
              const active = index === frame.activeLine;
              return (
                <span key={`${index}-${line}`} className={active ? styles.activeLine : styles.codeLine}>
                  {line || " "}
                  {active && <span className={styles.caret} />}
                  {"\n"}
                </span>
              );
            })}
          </code>
          {frame.activeLine === undefined && <span className={styles.caret} />}
        </pre>
      </div>
      <div className={styles.preview}>
        <div className={`${styles.bar} ${styles.previewBar}`}>
          <span>/__vitrine</span>
          <span className={frame.previewStatus === "ready" ? styles.readyStatus : styles.status}>{statusLabel}</span>
        </div>
        <div className={frame.previews.length > 0 ? styles.gallery : `${styles.gallery} ${styles.galleryWithoutSidebar}`} aria-hidden="true">
          {frame.previews.length > 0 && (
            <div className={styles.sidebar}>
              <span className={styles.sidebarGroup}>Components</span>
              {frame.previews.map((preview) => (
                <span key={preview} className={preview === frame.activePreview ? styles.activeItem : styles.sidebarItem}>
                  {preview}
                </span>
              ))}
            </div>
          )}
          <div className={styles.canvas}>
            {frame.previewStatus === "scanning" && <span className={styles.scanLine} />}
            {frame.previewStatus === "ready" ? (
              <span key={frame.activePreview} className={frame.activePreview === "Badge" ? styles.previewBadge : styles.previewButton}>
                {frame.label}
              </span>
            ) : (
              <span className={styles.waiting}>
                {frame.previewStatus === "scanning" ? t.howItWorks.scanningPreview : t.howItWorks.waitingForPreview}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
