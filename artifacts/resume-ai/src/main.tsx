import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initConsentMode } from "./lib/consent-mode";

// Register Consent Mode v2 defaults before anything (including the AdSense
// loader) can run, so EEA/UK visitors never get personalized ad signals before
// the certified CMP records their choice.
initConsentMode();

createRoot(document.getElementById("root")!).render(<App />);
