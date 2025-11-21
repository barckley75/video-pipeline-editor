// src/main.tsx

/**
 * 🚀 APPLICATION ENTRY POINT
 * 
 * React application bootstrap file. Mounts the root App component to the DOM.
 * Minimal configuration - all logic delegated to App.tsx.
 * 
 * COMMUNICATES WITH:
 * └── App.tsx - Root component
 */

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
