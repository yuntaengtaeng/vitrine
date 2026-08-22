import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

export default [
  reactHooks.configs.flat.recommended,
  {
    name: "@vitrine/eslint-config/react",
    languageOptions: {
      globals: globals.browser,
    },
  },
];
