import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "./components/ui/sonner";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { ThemeProvider } from "./components/ThemeProvider";
import Index from "./pages/Index";
import YouTubeStats from "./pages/YouTubeStats";
import BlogAnalytics from "./pages/BlogAnalytics";
import FacebookPages from "./pages/FacebookPages";
import FacebookAds from "./pages/FacebookAds";
import AdSenseAnalytics from "./pages/AdSenseAnalytics";
import MarketAnalysis from "./pages/MarketAnalysis";
import Strategy from "./pages/Strategy";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import AuthCallback from "./pages/AuthCallback";
import Diagnostics from "./pages/Diagnostics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const Loading = () => (
  <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground">
    <div className="flex flex-col items-center gap-4">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      <p className="text-sm font-medium">Carregando GrowthSuite Pro...</p>
    </div>
  </div>
);

const App = () => {
  console.log("App is rendering simple");
  return <div style={{ color: 'red', fontSize: '100px', background: 'white', position: 'fixed', inset: 0, zIndex: 9999 }}>HELLO WORLD</div>;
};

export default App;
