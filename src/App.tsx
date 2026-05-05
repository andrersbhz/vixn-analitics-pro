import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { Suspense, lazy } from "react";

const Diagnostics = lazy(() => import("./pages/Diagnostics"));
const ThemeProvider = lazy(() => import("./components/ThemeProvider").then(m => ({ default: m.ThemeProvider })));
const BrowserRouter = lazy(() => import("react-router-dom").then(m => ({ default: m.BrowserRouter })));
const Route = lazy(() => import("react-router-dom").then(m => ({ default: m.Route })));
const Routes = lazy(() => import("react-router-dom").then(m => ({ default: m.Routes })));
const Sonner = lazy(() => import("./components/ui/sonner").then(m => ({ default: m.Toaster })));
const Toaster = lazy(() => import("./components/ui/toaster").then(m => ({ default: m.Toaster })));
const TooltipProvider = lazy(() => import("./components/ui/tooltip").then(m => ({ default: m.TooltipProvider })));
const Index = lazy(() => import("./pages/Index"));
const YouTubeStats = lazy(() => import("./pages/YouTubeStats"));
const BlogAnalytics = lazy(() => import("./pages/BlogAnalytics"));
const FacebookPages = lazy(() => import("./pages/FacebookPages"));
const FacebookAds = lazy(() => import("./pages/FacebookAds"));
const AdSenseAnalytics = lazy(() => import("./pages/AdSenseAnalytics"));
const MarketAnalysis = lazy(() => import("./pages/MarketAnalysis"));
const Strategy = lazy(() => import("./pages/Strategy"));
const Reports = lazy(() => import("./pages/Reports"));
const Settings = lazy(() => import("./pages/Settings"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const NotFound = lazy(() => import("./pages/NotFound"));

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
      <Suspense fallback={<Loading />}>
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
      </Suspense>
    </QueryClientProvider>
  );
};

export default App;
