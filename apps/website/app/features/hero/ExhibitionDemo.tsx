import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import { useEffect, useState } from "react";
import { useI18n } from "../../i18n/locale";
import { EXHIBITS, exhibitNumber, type Exhibit, type ExhibitTone } from "./exhibits";
import * as styles from "./ExhibitionDemo.css";

const AUTOPLAY_MS = 3600;
const EASE = [0.2, 0.8, 0.2, 1] as const;
const TONES: ExhibitTone[] = ["primary", "danger", "ghost"];
const EDITED_LABEL = "Save changes";

// 자동 재생 한 바퀴 안에 코드를 고쳐 저장하면 진열장이 바로 바뀌는 장면을 한 번 넣음
const STEPS = [
  { index: 0, edited: false },
  { index: 0, edited: true },
  { index: 1, edited: false },
  { index: 2, edited: false },
];

// 패널이 먼저 올라온 뒤 값 줄이 위에서부터 하나씩 채워짐
const panelVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: EASE, when: "beforeChildren", staggerChildren: 0.08 },
  },
  exit: { opacity: 0, y: 20, transition: { duration: 0.25 } },
};

const rowVariants: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.25 } },
};

/** 커서가 @preview 사이를 옮겨가면 진열장의 전시품과 Props 패널이 바뀌는 Hero 데모 */
export function ExhibitionDemo() {
  const { t } = useI18n();
  const reducedMotion = useReducedMotion();
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const autoplay = playing && !reducedMotion;

  useEffect(() => {
    if (!autoplay) return;
    const timer = setInterval(() => setStep((current) => (current + 1) % STEPS.length), AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [autoplay]);

  const select = (index: number) => {
    setStep(STEPS.findIndex((candidate) => candidate.index === index && !candidate.edited));
    setPlaying(false);
  };

  const { index: activeIndex, edited } = STEPS[step];
  const exhibit = EXHIBITS[activeIndex];
  const active = edited ? { ...exhibit, label: EDITED_LABEL } : exhibit;

  return (
    <div className={styles.frame} aria-label={t.demo.ariaLabel} role="group">
      <div>
        <div className={styles.tabBar}>
          <span className={styles.tabTitle}>
            {t.demo.editorTab}
            <AnimatePresence>
              {edited && (
                <motion.span
                  key="saved"
                  className={styles.saved}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                >
                  {t.demo.saved}
                </motion.span>
              )}
            </AnimatePresence>
          </span>
          {!reducedMotion && (
            <button
              type="button"
              className={styles.iconButton}
              onClick={() => setPlaying((value) => !value)}
              aria-label={playing ? t.demo.pause : t.demo.play}
              title={playing ? t.demo.pause : t.demo.play}
            >
              {playing ? <PauseIcon /> : <PlayIcon />}
            </button>
          )}
        </div>
        <pre className={styles.code}>
          <span className={styles.importLine}>
            <span className={styles.keyword}>import</span> {"{ Button }"} <span className={styles.keyword}>from</span>{" "}
            <span className={styles.string}>"./Button"</span>;
          </span>
          {EXHIBITS.map((item, index) => (
            <CodeBlock
              key={item.id}
              exhibit={index === activeIndex ? active : item}
              active={index === activeIndex}
              edited={index === activeIndex && edited}
              onSelect={() => select(index)}
            />
          ))}
        </pre>
      </div>

      <div className={styles.room}>
        <div className={styles.stage}>
          <motion.div
            key={`light-${active.id}-${active.label}`}
            className={styles.spotlight}
            initial={{ opacity: 0.3 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
          <div className={styles.glass}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={`${active.id}-${active.label}`}
                className={styles.exhibit[active.tone]}
                initial={{ opacity: 0, y: 26, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 18, scale: 0.97 }}
                transition={{ duration: 0.45, ease: EASE }}
              >
                {active.label}
              </motion.span>
            </AnimatePresence>
            <motion.span
              key={`glint-${active.id}-${active.label}`}
              className={styles.reflection}
              initial={{ left: "-40%" }}
              animate={{ left: "130%" }}
              transition={{ duration: 1, ease: "easeInOut", delay: 0.15 }}
            />
          </div>
          <div className={styles.plinth} />
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active.id}
            className={styles.panel}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div className={styles.panelHeader} variants={rowVariants}>
              <span className={styles.panelNumber}>
                {t.demo.exhibitNumber} {exhibitNumber(activeIndex)}
              </span>
              <span className={styles.panelName}>{active.name}</span>
              <span className={styles.panelGroup}>{active.group}</span>
            </motion.div>
            <motion.div className={styles.propRow} variants={rowVariants}>
              <span>tone</span>
              <span className={styles.toneOptions}>
                {TONES.map((tone) => (
                  <span
                    key={tone}
                    className={tone === active.tone ? `${styles.toneOption} ${styles.toneOptionActive}` : styles.toneOption}
                  >
                    {tone}
                  </span>
                ))}
              </span>
            </motion.div>
            <motion.div className={styles.propRow} variants={rowVariants}>
              <span>children</span>
              <span className={styles.propValue}>"{active.label}"</span>
            </motion.div>
            <motion.div className={styles.propRow} variants={rowVariants}>
              <span>disabled</span>
              <span className={styles.toggle} />
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function CodeBlock({
  exhibit,
  active,
  edited,
  onSelect,
}: {
  exhibit: Exhibit;
  active: boolean;
  edited: boolean;
  onSelect: () => void;
}) {
  return (
    <button type="button" className={styles.block} onClick={onSelect} aria-pressed={active}>
      {active && (
        <motion.span layoutId="active-preview" className={styles.highlight} transition={{ duration: 0.4, ease: EASE }} />
      )}
      <span className={styles.line}>
        <span className={styles.comment}>{`/** @preview name="${exhibit.group}/${exhibit.name}" */`}</span>
      </span>
      <span className={styles.line}>
        <span className={styles.keyword}>export const</span> {exhibit.name} = () =&gt;
      </span>
      <span className={styles.line}>
        {"  "}&lt;<span className={styles.tag}>Button</span> tone=<span className={styles.string}>"{exhibit.tone}"</span>&gt;
        <span className={edited ? styles.editedText : undefined}>{exhibit.label}</span>&lt;/<span className={styles.tag}>Button</span>&gt;;
        {active && <span className={styles.caret} />}
      </span>
    </button>
  );
}

function PauseIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
      <rect x="1.5" y="1" width="2.5" height="8" rx="0.5" fill="currentColor" />
      <rect x="6" y="1" width="2.5" height="8" rx="0.5" fill="currentColor" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
      <path d="M2.5 1.2v7.6a.5.5 0 0 0 .76.43l6-3.8a.5.5 0 0 0 0-.86l-6-3.8a.5.5 0 0 0-.76.43Z" fill="currentColor" />
    </svg>
  );
}
