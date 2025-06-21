import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import React from "react";
import HoverCarousel from "./components/HoverCarousel.jsx";
import Test from "./Test.jsx";

// import NewApp from './NewApp.jsx'

// import SettingsPopup from './components/MenuPopup.jsx'
// import MenuPopup from './components/MenuPopup.jsx'

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
    {/* <HoverCarousel /> */}
    {/* <Test /> */}
  </StrictMode>
);
