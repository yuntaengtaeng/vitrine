export interface AutoControlsProps {
  label: string;
  count: number;
  enabled: boolean;
  size: "small" | "medium" | "large";
  priority?: 1 | 2 | 3;
}
