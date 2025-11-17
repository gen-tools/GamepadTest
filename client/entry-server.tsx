import React from "react";
import { StaticRouter } from "react-router-dom/server";
import { HelmetProvider } from "react-helmet-async";
import RootApp from "./RootApp";

export function render(url: string, helmetContext: any) {
  return React.createElement(
    HelmetProvider,
    { context: helmetContext },
    React.createElement(
      StaticRouter,
      { location: url },
      React.createElement(RootApp)
    )
  );
}
