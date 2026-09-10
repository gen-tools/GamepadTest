import "./global.css";

import { BrowserRouter } from "react-router-dom";
import { hydrateRoot, createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import RootApp from "./RootApp";

const container = document.getElementById("root")!;
const app = (
  <HelmetProvider>
    <BrowserRouter>
      <RootApp />
    </BrowserRouter>
  </HelmetProvider>
);

if (container.hasChildNodes()) {
  hydrateRoot(container, app);
} else {
  createRoot(container).render(app);
}
