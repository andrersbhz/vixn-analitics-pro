import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
 import Index from "./pages/Index";
 import NotFound from "./pages/NotFound";
 import YouTubeStats from "./pages/YouTubeStats";
 import BlogAnalytics from "./pages/BlogAnalytics";
 import FacebookPages from "./pages/FacebookPages";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
           <Route path="/" element={<Index />} />
           <Route path="/youtube" element={<YouTubeStats />} />
           <Route path="/blog" element={<BlogAnalytics />} />
           <Route path="/facebook" element={<FacebookPages />} />
           {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
