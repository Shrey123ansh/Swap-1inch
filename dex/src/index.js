import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";

import { DexInchProvider } from "./Context/InchDexContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <DexInchProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </DexInchProvider>
  </React.StrictMode>
);
