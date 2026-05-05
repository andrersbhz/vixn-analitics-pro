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
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="growth-suite-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/youtube" element={<YouTubeStats />} />
              <Route path="/blog" element={<BlogAnalytics />} />
              <Route path="/facebook" element={<FacebookPages />} />
              <Route path="/facebook-ads" element={<FacebookAds />} />
              <Route path="/adsense" element={<AdSenseAnalytics />} />
              <Route path="/market-analysis" element={<MarketAnalysis />} />
              <Route path="/strategy" element={<Strategy />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/diagnostics" element={<Diagnostics />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
