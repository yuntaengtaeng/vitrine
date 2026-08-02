export const Alert = ({
  message,
  tone = "neutral",
}: {
  message: string;
  tone?: "neutral" | "critical";
}) => (
  <div
    style={{
      background: tone === "critical" ? "#450a0a" : "#1e293b",
      color: tone === "critical" ? "#fca5a5" : "#cbd5e1",
      borderLeft: `4px solid ${tone === "critical" ? "#ef4444" : "#38bdf8"}`,
      padding: "0.8rem 1rem",
      maxWidth: "320px",
      fontFamily: "system-ui, sans-serif",
      fontSize: "0.9rem",
    }}
  >
    {message}
  </div>
);

/** @preview name=Neutral alert */
export const NeutralAlert = () => <Alert message="Deployment finished" />;

/** @preview name=Critical alert */
export const CriticalAlert = () => (
  <Alert message="Build failed" tone="critical" />
);
