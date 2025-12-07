import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import CropRecommendation from "./pages/CropRecommendation";
import CropYieldPrediction from "./pages/CropYieldPrediction";
import AIAssistant from "./pages/AIAssistant";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

import "./index.css";

// 🌐 i18next translation hook
import { useTranslation } from "react-i18next";

// LANGUAGE SWITCHER COMPONENT
function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <div
      style={{
        position: "fixed",
        top: "15px",
        right: "20px",
        zIndex: 5000,
      }}
    >
      <div className="lang-toggle">
        <div
          id="knBtn"
          className={`lang-option ${i18n.language === "kn" ? "active" : "inactive"}`}
          onClick={() => i18n.changeLanguage("kn")}
        >
          ಕನ್ನಡ
        </div>

        <div
          id="enBtn"
          className={`lang-option ${i18n.language === "en" ? "active" : "inactive"}`}
          onClick={() => i18n.changeLanguage("en")}
        >
          ENGLISH
        </div>
      </div>
    </div>
  );
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      {/* 🌐 CLEAN i18n Language Toggle */}
      <LanguageSwitcher />

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/crop-recommendation" element={<CropRecommendation />} />
          <Route path="/crop-yield-prediction" element={<CropYieldPrediction />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
