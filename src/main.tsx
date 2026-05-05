import React from "react";
import { createRoot } from "react-dom/client";

const App = () => {
  console.log("Internal App is rendering");
  return <div style={{ color: 'red', fontSize: '100px', background: 'white', position: 'fixed', inset: 0, zIndex: 9999 }}>INTERNAL HELLO</div>;
};

console.log("main.tsx is running");
const container = document.getElementById("root");
if (container) {
  console.log("Container found");
  const root = createRoot(container);
  root.render(<App />);
} else {
  console.log("Container NOT found");
}
