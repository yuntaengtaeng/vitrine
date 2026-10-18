import { createContext, createElement, useContext, useState, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { act, create } from "react-test-renderer";
import { describe, expect, it } from "vitest";
import { PreviewRenderer } from "./PreviewRenderer";

describe("PreviewRenderer", () => {
  it("전역 wrapper와 컴포넌트 wrapper 안에서 context 사용", () => {
    const GlobalContext = createContext("missing");
    const LocalContext = createContext("missing");
    const GlobalWrapper = ({ children }: { children: ReactNode }) =>
      createElement(GlobalContext.Provider, { value: "dark" }, children);
    const LocalWrapper = ({ children }: { children: ReactNode }) =>
      createElement(LocalContext.Provider, { value: "signed-in" }, children);
    const Consumer = ({ label }: { label?: string }) =>
      createElement("span", null, `${useContext(GlobalContext)}:${useContext(LocalContext)}:${label}`);

    const markup = renderToStaticMarkup(
      createElement(PreviewRenderer, {
        component: Consumer,
        args: { label: "Save" },
        globalWrapper: GlobalWrapper,
        wrapper: LocalWrapper,
      }),
    );

    expect(markup).toBe("<span>dark:signed-in:Save</span>");
  });

  it("consumer interaction 뒤 args가 바뀌어도 provider state를 유지", () => {
    const ThemeContext = createContext({ dark: false, toggle: () => {} });
    const ThemeProvider = ({ children }: { children: ReactNode }) => {
      const [dark, setDark] = useState(false);
      return createElement(
        ThemeContext.Provider,
        { value: { dark, toggle: () => setDark((current) => !current) } },
        children,
      );
    };
    const Consumer = ({ label }: { label?: string }) => {
      const theme = useContext(ThemeContext);
      return createElement(
        "button",
        { onClick: theme.toggle },
        `${theme.dark ? "dark" : "light"}:${label}`,
      );
    };
    const renderPreview = (label: string) =>
      createElement(PreviewRenderer, {
        component: Consumer,
        args: { label },
        globalWrapper: ThemeProvider,
        wrapper: undefined,
      });

    const renderer = create(renderPreview("Before"));
    act(() => renderer.root.findByType("button").props.onClick());
    expect(renderer.root.findByType("button").children).toEqual(["dark:Before"]);

    act(() => renderer.update(renderPreview("After")));
    expect(renderer.root.findByType("button").children).toEqual(["dark:After"]);

    act(() => renderer.update(createElement(PreviewRenderer, {
      key: "another-preview",
      component: Consumer,
      args: { label: "Fresh" },
      globalWrapper: ThemeProvider,
      wrapper: undefined,
    })));
    expect(renderer.root.findByType("button").children).toEqual(["light:Fresh"]);
  });
});
