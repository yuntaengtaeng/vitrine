/** @preview */
export const Button = ({
  variant = "primary",
}: {
  variant?: "primary" | "danger";
}) => {
  const background = variant === "danger" ? "#dc2626" : "#4f46e5";
  return (
    <button
      style={{
        background,
        color: "white",
        border: "none",
        borderRadius: "6px",
        padding: "0.6rem 1.2rem",
        fontSize: "1rem",
        cursor: "pointer",
      }}
    >
      {variant === "danger" ? "Delete" : "Confirm"}
    </button>
  );
};

/** @preview name=Danger button */
export const DangerButton = () => <Button variant="danger" />;
