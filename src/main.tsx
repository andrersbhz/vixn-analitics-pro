import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("main.tsx: Starting application...");

try {
  const container = document.getElementById("root");
  if (container) {
    console.log("main.tsx: Root container found, rendering App...");
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } else {
    console.error("main.tsx: Root container NOT found!");
  }
} catch (error) {
  console.error("main.tsx: Fatal error during startup:", error);
}
