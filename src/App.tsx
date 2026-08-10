import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "./components/ui/sonner";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { ThemeProvider } from "./components/ThemeProvider";
import Index from "./pages/Index";
import Login from "./pages/Login";
import YouTubeStats from "./pages/YouTubeStats";
import BlogAnalytics from "./pages/BlogAnalytics";
import FacebookPages from "./pages/FacebookPages";
import FacebookAds from "./pages/FacebookAds";
import AdSenseAnalytics from "./pages/AdSenseAnalytics";
import MarketAnalysis from "./pages/MarketAnalysis";
import MarketIntelligencePro from "./pages/MarketIntelligencePro";
import Strategy from "./pages/Strategy";
import StrategyOperations from "./pages/StrategyOperations";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Diagnostics from "./pages/Diagnostics";
import AdSenseOAuthCallback from "./pages/AdSenseOAuthCallback";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="growth-suite-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/youtube" element={<YouTubeStats />} />
              <Route path="/blog" element={<BlogAnalytics />} />
              <Route path="/facebook" element={<FacebookPages />} />
              <Route path="/facebook-ads" element={<FacebookAds />} />
              <Route path="/adsense" element={<AdSenseAnalytics />} />
              <Route path="/market-analysis" element={<MarketAnalysis />} />
              <Route path="/market-intelligence" element={<MarketIntelligencePro />} />
              <Route path="/strategy" element={<Strategy />} />
              <Route path="/strategy-operations" element={<StrategyOperations />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/diagnostics" element={<Diagnostics />} />
              <Route path="/adsense/oauth/callback" element={<AdSenseOAuthCallback />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
