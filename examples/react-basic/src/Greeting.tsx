import { preview } from "vite-plugin-react-vitrine/preview";
import { useLocale } from "./LocaleProvider";

const MESSAGE = { en: "Hello", ko: "안녕하세요" } as const;

/** @preview */
export const Greeting = ({ name }: { name: string }) => (
  <p style={{ margin: 0 }}>
    {MESSAGE[useLocale()]}, {name}
  </p>
);

preview(Greeting, {
  args: { name: "Vitrine" },
  variants: {
    toolbar: { name: "Follows toolbar" },
    korean: { name: "Always Korean", globals: { locale: "ko" } },
  },
});
