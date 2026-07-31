export const Card = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <div
    style={{
      border: "1px solid #e5e7eb",
      borderRadius: "8px",
      padding: "1rem",
      maxWidth: "280px",
      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    }}
  >
    <h3 style={{ margin: "0 0 0.4rem", fontSize: "1.05rem" }}>{title}</h3>
    <p style={{ margin: 0, color: "#555", fontSize: "0.9rem" }}>
      {description}
    </p>
  </div>
);

/** @preview name=Short card */
export const ShortCard = () => (
  <Card title="Vitrine" description="Inline previews for React." />
);

/** @preview name=Long card */
export const LongCard = () => (
  <Card
    title="Long description card"
    description="This card demonstrates a preview wrapper for a component whose props are all required, so it can't be previewed directly without sample data."
  />
);
