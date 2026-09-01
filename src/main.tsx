import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { HelmetProvider } from "react-helmet-async";
import "./index.css";
import { initThemeTokens } from "./lib/theme-tokens";

initThemeTokens();

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(
    <HelmetProvider>
      <App />
    </HelmetProvider>,
  );
}
