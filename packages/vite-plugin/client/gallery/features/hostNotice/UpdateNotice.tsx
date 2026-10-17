import * as styles from "./UpdateNotice.css";

const MESSAGE = {
  extension: "Update the Vitrine VS Code extension to use every gallery feature",
  plugin: "Update vite-plugin-react-vitrine to use every gallery feature",
} as const;

export const UpdateNotice = (props: { outdated: keyof typeof MESSAGE }) => (
  <p className={styles.root} role="status">
    {MESSAGE[props.outdated]}
  </p>
);
