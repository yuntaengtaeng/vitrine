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
  const path = PATHS[usePageStep(playing)];

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
          {/* 숫자가 바뀔 때마다 다시 마운트해 로딩 애니메이션을 새 페이지처럼 재생 */}
          <div key={path} className={styles.skeleton} data-state={state} aria-hidden="true">
            <PageSkeleton path={path} />
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

// 주소와 숫자는 CSS keyframes로 움직이므로 같은 간격의 timer로 페이지 차례를 맞춤
function usePageStep(playing: boolean): number {
  const last = PATHS.length - 1;
  const [step, setStep] = useState(playing ? 0 : last);

  useEffect(() => {
    if (!playing) return;
    const timers = PATHS.slice(1).map((_, index) =>
      setTimeout(() => setStep(index + 1), styles.PAGE_STEP_MS * (index + 1)),
    );
    return () => timers.forEach(clearTimeout);
  }, [playing]);

  return step;
}

function Bone({
  width = "100%",
  height = 12,
  shape,
  tone,
}: {
  width?: number | string;
  height?: number | string;
  shape?: "round" | "card";
  tone?: "accent";
}) {
  return <span className={styles.bone} data-shape={shape} data-tone={tone} style={{ width, height }} />;
}

function PageSkeleton({ path }: { path: string }) {
  if (path === "/login") {
    return (
      <div className={styles.loginForm}>
        <Bone width={36} height={36} shape="round" />
        <Bone width="64%" />
        <Bone height={26} />
        <Bone height={26} />
        <Bone height={28} tone="accent" />
      </div>
    );
  }

  if (path === "/products") {
    return (
      <>
        <Bone width="32%" height={14} />
        <div className={styles.productGrid}>
          {[0, 1, 2].map((index) => (
            <div key={index} className={styles.skeletonStack}>
              <Bone height={84} shape="card" />
              <Bone width="82%" />
              <Bone width="44%" />
            </div>
          ))}
        </div>
      </>
    );
  }

  if (path === "/cart") {
    return (
      <>
        <Bone width="26%" height={14} />
        {[0, 1, 2].map((index) => (
          <div key={index} className={styles.skeletonRow}>
            <Bone width={40} height={40} shape="card" />
            <div className={styles.skeletonStack}>
              <Bone width="58%" />
              <Bone width="34%" />
            </div>
            <Bone width={48} />
          </div>
        ))}
      </>
    );
  }

  if (path === "/checkout") {
    return (
      <div className={styles.checkoutColumns}>
        <div className={styles.skeletonStack}>
          {[0, 1, 2].map((index) => (
            <div key={index} className={styles.skeletonStack}>
              <Bone width="30%" height={10} />
              <Bone height={24} />
            </div>
          ))}
        </div>
        <div className={styles.skeletonStack}>
          <Bone height={80} shape="card" />
          <Bone width="70%" />
          <Bone height={28} tone="accent" />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.skeletonRow}>
      <Bone width="min(44%, 200px)" height={112} shape="card" tone="accent" />
      <div className={styles.skeletonStack}>
        <Bone height={24} />
        <div className={styles.skeletonRow}>
          <Bone height={24} />
          <Bone height={24} />
        </div>
        <Bone width="48%" />
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
