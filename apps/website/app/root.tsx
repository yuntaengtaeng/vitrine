import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLocation } from "react-router";
import { localeFromPath } from "./i18n/locale";
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "@fontsource-variable/jetbrains-mono";
import "./styles/theme.css";
import "./styles/global.css";

export function Layout({ children }: { children: React.ReactNode }) {
  const locale = localeFromPath(useLocation().pathname);
  return (
    <html lang={locale}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
