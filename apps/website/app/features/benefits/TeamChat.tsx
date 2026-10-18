import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "../../i18n/locale";
import { useInView } from "../../hooks/useInView";
import * as styles from "./TeamChat.css";

const NEXT_CHAT_MS = 8000;
const AVATAR_COLORS: Record<string, string> = {
  disabled: "#7c3aed",
  static: "#0f766e",
  long: "#b45309",
  search: "#1d4ed8",
};

export function TeamChat() {
  const { t } = useI18n();
  const chats = t.benefits.chats;
  const reducedMotion = useReducedMotion() ?? false;
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef);
  const [activeIndex, setActiveIndex] = useState(0);
  const [chosen, setChosen] = useState(false);
  const [holding, setHolding] = useState(false);
  const autoplay = inView && !chosen && !holding && !reducedMotion;

  useEffect(() => {
    if (!autoplay) return;
    const timer = setInterval(() => setActiveIndex((index) => (index + 1) % chats.length), NEXT_CHAT_MS);
    return () => clearInterval(timer);
  }, [autoplay, chats.length]);

  const chat = chats[activeIndex];

  return (
    <div
      ref={rootRef}
      className={styles.root}
      onMouseEnter={() => setHolding(true)}
      onMouseLeave={() => setHolding(false)}
      onFocus={() => setHolding(true)}
      onBlur={() => setHolding(false)}
    >
      <div className={styles.tabs}>
        {chats.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className={styles.tab}
            aria-pressed={index === activeIndex}
            onClick={() => {
              setActiveIndex(index);
              setChosen(true);
            }}
          >
            {item.tab}
          </button>
        ))}
      </div>

      <div className={styles.window}>
        <div key={chat.id} className={styles.conversation}>
          <p className={styles.channel}># {chat.channel}</p>
          <div className={styles.message}>
            <span className={styles.avatar} style={{ background: AVATAR_COLORS[chat.id] }} aria-hidden="true">
              {chat.who[0]}
            </span>
            <div className={styles.body}>
              <span className={styles.author}>
                {chat.who} <span className={styles.role}>{chat.role}</span>
              </span>
              <span>{chat.ask}</span>
            </div>
          </div>
          <div className={`${styles.message} ${styles.reply}`}>
            <span className={styles.avatar} data-me="true" aria-hidden="true">
              {t.benefits.you[0]}
            </span>
            <div className={styles.body}>
              <span className={styles.author}>{t.benefits.you}</span>
              <span>{chat.reply}</span>
              <span className={styles.link}>{chat.link}</span>
            </div>
          </div>
        </div>

        <div className={styles.gallery}>
          <p className={styles.galleryBar}>{chat.id === "static" ? chat.link : "localhost:5173/__vitrine"}</p>
          <div key={chat.id} className={styles.stage}>
            <GalleryView id={chat.id} />
          </div>
        </div>
      </div>
    </div>
  );
}

function GalleryView({ id }: { id: string }) {
  const { t } = useI18n();

  if (id === "disabled") {
    return (
      <div className={styles.center}>
        <span className={styles.button} data-disabled="true">Publish</span>
        <code className={styles.caption}>disabled: true</code>
      </div>
    );
  }

  if (id === "static") {
    return (
      <div className={styles.miniGallery}>
        <p className={styles.miniHint}>{t.benefits.staticHint}</p>
        <div className={styles.miniBody}>
          <div className={styles.miniSidebar}>
            <span data-current="true">Toast</span>
            <span>Button</span>
            <span>Tag</span>
          </div>
          <div className={styles.miniStage}>
            <span className={styles.toast}>
              <span className={styles.toastDot} aria-hidden="true" />
              {t.why.toasts.success}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (id === "long") {
    return (
      <div className={styles.center}>
        <span className={styles.toast} data-tone="error">
          <span className={styles.toastDot} aria-hidden="true" />
          {t.why.toasts.long}
        </span>
        <code className={styles.caption}>message: "{t.why.toasts.long.slice(0, 18)}…"</code>
      </div>
    );
  }

  return (
    <div className={styles.search}>
      <span className={styles.searchBox}>tag</span>
      <span className={styles.result} data-current="true">Feedback / Tag</span>
      <span className={styles.result}>Forms / TagInput</span>
    </div>
  );
}
