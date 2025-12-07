import { createRoot } from "react-dom/client";
import App from "./App.tsx";

// 🌐 Import i18n before anything else
import "./i18n";

import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
