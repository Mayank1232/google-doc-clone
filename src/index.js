import React from "react";
import "./assets/css/index.css";
import "./assets/css/style.css";
import App from "./App";
import { render } from "react-dom";

render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
