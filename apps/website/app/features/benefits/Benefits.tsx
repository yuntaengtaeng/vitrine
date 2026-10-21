import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "../../i18n/locale";
import { useInView } from "../../hooks/useInView";
import { Caption } from "../../components/Caption";
import { SectionHeading } from "../../components/SectionHeading";
import { container, section } from "../../styles/layout.css";
import { TeamChat } from "./TeamChat";
import * as styles from "./Benefits.css";

const SPOTLIGHT_MS = 1600;

export function Benefits() {
  const { t } = useI18n();
  const reducedMotion = useReducedMotion() ?? false;
  const cardsRef = useRef<HTMLUListElement>(null);
  const cardsInView = useInView(cardsRef);
  const { lit, done } = useSpotlightOnce(t.benefits.cards.length, cardsInView && !reducedMotion);

  return (
    <section id="benefits" className={section}>
      <div className={container}>
        <SectionHeading
          label={t.benefits.label}
          title={
            <>
              {t.benefits.titleLead}
              <br />
              <span className={styles.titleAccent}>{t.benefits.titleAccent}</span>
            </>
          }
          lead={t.benefits.subhead}
        />

        <p className={styles.groupLabel}>{t.benefits.forYou}</p>
        <ul ref={cardsRef} className={styles.cards} data-replay={done}>
          {t.benefits.cards.map((card, index) => (
            <li key={card.id} className={styles.card} data-lit={lit === index}>
              <span className={styles.spot} aria-hidden="true" />
              <div className={styles.visual} aria-hidden="true">
                <CardVisual id={card.id} apiNotReady={t.benefits.apiNotReady} />
              </div>
              <Caption title={card.title} medium={card.medium} />
              <p className={styles.text}>{card.text}</p>
            </li>
          ))}
        </ul>

        <p className={styles.groupLabel}>{t.benefits.team}</p>
        <TeamChat />
      </div>
    </section>
  );
}

// 반복해 움직이면 읽기를 방해하므로 처음 볼 때 한 번만 차례로 비추고, 그 뒤로는 hover에 맡김
function useSpotlightOnce(count: number, active: boolean): { lit: number; done: boolean } {
  const [lit, setLit] = useState(-1);
  const [done, setDone] = useState(false);
  const played = useRef(false);

  useEffect(() => {
    if (!active || played.current) return;
    played.current = true;
    let index = 0;
    setLit(0);
    const timer = setInterval(() => {
      index += 1;
      setLit(index < count ? index : -1);
      if (index >= count) {
        clearInterval(timer);
        setDone(true);
      }
    }, SPOTLIGHT_MS);
    return () => {
      clearInterval(timer);
      setLit(-1);
    };
  }, [active, count]);

  return { lit, done };
}

function CardVisual({ id, apiNotReady }: { id: string; apiNotReady: string }) {
  if (id === "config") {
    return (
      <pre className={styles.mini}>
        <span className={styles.muted}>plugins: [</span>
        {"\n  react(),\n  "}
        <span className={styles.glow}>vitrine(),</span>
        {"\n"}
        <span className={styles.muted}>]</span>
      </pre>
    );
  }

  if (id === "before") {
    return (
      <div className={styles.stack}>
        <span className={styles.row}>
          <code className={styles.monoSmall}>args: {"{ user: sampleUser }"}</code>
          <span className={styles.badge}>{apiNotReady}</span>
        </span>
        <span className={`${styles.profile} ${styles.reveal}`}>
          <span className={styles.avatar} />
          Ada Park
          <span className={styles.follow}>Follow</span>
        </span>
      </div>
    );
  }

  if (id === "props") {
    return (
      <div className={styles.stack}>
        <code className={styles.monoSmall}>tone?: "primary" | "danger"</code>
        <span className={`${styles.control} ${styles.reveal}`}>
          <span className={styles.controlName}>tone</span>
          <span className={styles.select}>primary</span>
        </span>
      </div>
    );
  }

  return (
    <pre className={styles.mini}>
      <span className={styles.muted}>{"/** @preview */"}</span>
      {"\nexport const "}
      <span className={styles.cursorLine}>Danger</span>
      {" = …"}
    </pre>
  );
}
