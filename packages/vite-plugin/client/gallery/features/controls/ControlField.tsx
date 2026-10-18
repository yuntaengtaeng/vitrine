import type { ReactNode } from "react";
import { ResetIcon } from "../../shared/icons/ResetIcon";
import * as styles from "./ControlField.css";

const Root = (props: { children: ReactNode }) => <div className={styles.root}>{props.children}</div>;

const Label = (props: { name: string; type: string; optional: boolean }) => (
  <div className={styles.label}>
    <span className={styles.name}>{props.name}</span>
    {props.optional && <span className={styles.optional}>optional</span>}
    <code className={styles.type} title={props.type}>
      {props.type}
    </code>
  </div>
);

const Input = (props: { children: ReactNode }) => <div className={styles.input}>{props.children}</div>;

const Reset = (props: { name: string; onReset: () => void }) => (
  <button
    type="button"
    aria-label={`Reset ${props.name}`}
    title="Reset to the variant value"
    className={styles.reset}
    onClick={props.onReset}
  >
    <ResetIcon size={14} />
  </button>
);

export const ControlField = Object.assign(Root, { Label, Input, Reset });
