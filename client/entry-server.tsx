import React from "react";
import ReactDOMServer from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { HelmetProvider } from "react-helmet-async";
import RootApp from "./RootApp";

export function render(url: string, helmetContext: any): string {
  const app = React.createElement(
    HelmetProvider,
    { context: helmetContext },
    React.createElement(
      StaticRouter,
      { location: url },
      React.createElement(RootApp)
    )
  );

  return ReactDOMServer.renderToString(app);
}
