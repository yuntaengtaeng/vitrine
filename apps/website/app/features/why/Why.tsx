import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "../../i18n/locale";
import { useInView } from "../../hooks/useInView";
import { SectionHeading } from "../../components/SectionHeading";
import { container, section } from "../../styles/layout.css";
import * as styles from "./Why.css";

// 주소창 한 단계가 클릭 한 번, 숫자와 주소가 같은 박자로 바뀜
const PATHS = ["/login", "/products", "/cart", "/checkout", "/checkout/payment"];
const TODAY_PLAY_MS = 7500;

type Mode = "today" | "vitrine";

export function Why() {
  const { t } = useI18n();
  const reducedMotion = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef);
  const [mode, setMode] = useState<Mode>("today");
  const [chosen, setChosen] = useState(false);

  // 버튼을 누르지 않는 방문자도 해결 장면까지 보도록 한 바퀴 뒤 넘김
  useEffect(() => {
    if (!inView || chosen || reducedMotion || mode !== "today") return;
    const timer = setTimeout(() => setMode("vitrine"), TODAY_PLAY_MS);
    return () => clearTimeout(timer);
  }, [inView, chosen, reducedMotion, mode]);

  const choose = (next: Mode) => {
    setMode(next);
    setChosen(true);
  };

  return (
    <section ref={sectionRef} id="why" className={section}>
      <div className={container}>
        <SectionHeading label={t.why.label} title={t.why.title} />
        <div className={styles.toggle}>
          <button type="button" className={styles.toggleButton} aria-pressed={mode === "today"} onClick={() => choose("today")}>
            {t.why.today}
          </button>
          <button type="button" className={styles.toggleButton} aria-pressed={mode === "vitrine"} onClick={() => choose("vitrine")}>
            {t.why.vitrine}
          </button>
        </div>
        {/* 두 장면을 같은 칸에 겹쳐 두어 전환할 때 높이가 바뀌지 않게 함 */}
        <div className={styles.stage}>
          <TodayScene
            key={`today-${inView && mode === "today"}`}
            active={mode === "today"}
            playing={inView && mode === "today" && !reducedMotion}
          />
          <VitrineScene key={`vitrine-${mode === "vitrine"}`} active={mode === "vitrine"} />
        </div>
      </div>
    </section>
  );
}

function TodayScene({ active, playing }: { active: boolean; playing: boolean }) {
  const { t } = useI18n();
  const state = playing ? "playing" : "done";

  return (
    <div className={styles.scene} data-active={active} aria-hidden={!active}>
      <div className={styles.browser}>
        <div className={styles.browserBar}>
          <span className={styles.dots} aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <div className={styles.address}>
            <div className={styles.addressTrack} data-state={state}>
              {PATHS.map((path) => (
                <span key={path} className={styles.addressLine}>
                  localhost:5173{path}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className={styles.page}>
          <div className={styles.skeleton} aria-hidden="true">
            <span style={{ width: "42%" }} />
            <span style={{ width: "68%" }} />
            <span style={{ width: "54%" }} />
          </div>
          {playing && <span className={styles.click} aria-hidden="true" />}
          <div className={styles.todayToast} data-state={state} role="presentation">
            <span className={styles.toastDot} data-tone="error" aria-hidden="true" />
            {t.why.toastMessage}
          </div>
        </div>
      </div>
      <div className={styles.copy}>
        <p className={styles.count}>
          <span className={styles.counter} aria-hidden="true">
            <span className={styles.counterTrack} data-state={state}>
              {PATHS.map((path, index) => (
                <span key={path}>{index + 1}</span>
              ))}
            </span>
          </span>
          <span className={styles.visuallyHidden}>{PATHS.length}</span>
          <span className={styles.countText}>{t.why.todayCount}</span>
        </p>
        <p className={styles.gone} data-state={state}>{t.why.todayGone}</p>
        <p className={styles.text}>{t.why.todayText}</p>
      </div>
    </div>
  );
}

const PREVIEW_CODE = `preview(Toast, {
  variants: {
    success: { args: { tone: "success" } },
    error: { args: { tone: "error" } },
    warning: { args: { tone: "warning" } },
    long: { args: { message: "We couldn't…" } },
  },
});`;

function VitrineScene({ active }: { active: boolean }) {
  const { t } = useI18n();
  const toasts = [
    { tone: "success", message: t.why.toasts.success },
    { tone: "error", message: t.why.toasts.error },
    { tone: "warning", message: t.why.toasts.warning },
    { tone: "error", message: t.why.toasts.long },
  ];

  return (
    <div className={styles.scene} data-active={active} aria-hidden={!active}>
      <div className={styles.split}>
        <pre className={styles.code}>{PREVIEW_CODE}</pre>
        <div className={styles.gallery}>
          {toasts.map((toast, index) => (
            <div key={index} className={styles.galleryToast} style={{ animationDelay: `${index * 90}ms` }}>
              <span className={styles.toastDot} data-tone={toast.tone} aria-hidden="true" />
              {toast.message}
            </div>
          ))}
        </div>
      </div>
      <div className={styles.copy}>
        <p className={styles.count}>
          <span className={styles.zero}>0</span>
          <span className={styles.countText}>
            {t.why.vitrineCount}. {t.why.vitrineCountText}
          </span>
        </p>
        <p className={styles.text}>{t.why.vitrineText}</p>
      </div>
    </div>
  );
}
