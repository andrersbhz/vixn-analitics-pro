import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
 import { 
    LayoutDashboard,
    Youtube,
    Globe,
    Facebook,
    TrendingUp,
    Settings,
    LogOut,
    Menu,
    X,
    PieChart,
    ChevronRight,
    Sun,
    Moon,
    Megaphone,
    Search,
    AlertCircle
 } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { cn } from "@/lib/utils";
 import { useTheme } from "next-themes";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
   const [sidebarOpen, setSidebarOpen] = useState(false);
   const location = useLocation();
    const { setTheme, resolvedTheme } = useTheme();
   const [mounted, setMounted] = useState(false);
   useEffect(() => {
     setMounted(true);
   }, []);

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "YouTube Stats", href: "/youtube", icon: Youtube },
    { name: "Blog Analytics", href: "/blog", icon: Globe },
    { name: "Facebook Pages", href: "/facebook", icon: Facebook },
    { name: "Facebook Ads", href: "/facebook-ads", icon: Megaphone },
    { name: "AdSense", href: "/adsense", icon: PieChart },
    { name: "Estudo de Mercado", href: "/market-analysis", icon: Search },
    { name: "Estratégia", href: "/strategy", icon: TrendingUp },
    { name: "Relatórios", href: "/reports", icon: PieChart },
    { name: "Configurações", href: "/settings", icon: Settings },
    { name: "Diagnóstico", href: "/diagnostics", icon: AlertCircle },
  ];

   return (
     <div className="min-h-screen bg-background flex overflow-hidden">
       {/* Mobile sidebar */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          sidebarOpen ? "block" : "hidden"
        )}
      >
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
         <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-card border-r">
           <div className="flex h-16 items-center justify-between px-6 border-b">
             <span className="text-xl font-bold text-primary tracking-tight">GrowthSuite Pro</span>
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
              <X className="h-6 w-6" />
            </Button>
          </div>
          <nav className="flex-1 space-y-1 px-4 py-4 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                   location.pathname === item.href
                     ? "bg-primary text-primary-foreground"
                     : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors"
                )}
              >
                <item.icon className="mr-3 h-5 w-5" aria-hidden="true" />
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="border-t p-4">
            <Button variant="ghost" className="w-full justify-start text-slate-600">
              <LogOut className="mr-3 h-5 w-5" />
              Sair
            </Button>
          </div>
        </div>
      </div>

       {/* Static sidebar for desktop */}
       <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r bg-card">
         <div className="flex h-16 items-center px-6 border-b">
           <span className="text-xl font-bold text-primary tracking-tight">GrowthSuite Pro</span>
         </div>
        <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
               location.pathname === item.href
                 ? "bg-primary text-primary-foreground"
                 : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                "group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200"
              )}
            >
              <item.icon className={cn(
               "mr-3 h-5 w-5",
               location.pathname === item.href ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
             )} aria-hidden="true" />
              {item.name}
              {location.pathname === item.href && <ChevronRight className="ml-auto h-4 w-4" />}
            </Link>
          ))}
        </nav>
         <div className="border-t p-4 space-y-4">
           <div className="flex items-center justify-between px-4">
             <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tema</span>
             <Button
               variant="ghost"
               size="icon"
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                className="h-8 w-8 rounded-lg bg-accent/50 text-muted-foreground hover:text-foreground transition-all duration-200 active:scale-95"
              >
                 {mounted ? (resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />) : <Sun className="h-4 w-4" />}
             </Button>
           </div>
           <div className="flex items-center gap-3 px-4 py-3">
             <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
              AD
            </div>
             <div className="flex-1 min-w-0">
               <p className="text-sm font-medium text-foreground truncate">Admin User</p>
               <p className="text-xs text-muted-foreground truncate">admin@growthsuite.pro</p>
             </div>
           </div>
           <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10">
            <LogOut className="mr-3 h-5 w-5" />
            Sair
          </Button>
        </div>
      </div>

       {/* Main content */}
       <div className="lg:pl-64 flex flex-col flex-1 w-full min-h-screen">
         <header className="sticky top-0 z-40 lg:hidden flex h-16 items-center justify-between border-b bg-card px-4">
           <span className="text-xl font-bold text-primary tracking-tight">GrowthSuite Pro</span>
           <div className="flex items-center gap-2">
             <Button
               variant="ghost"
               size="icon"
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                className="h-9 w-9 text-muted-foreground transition-all duration-200 active:scale-95"
              >
                 {mounted ? (resolvedTheme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />) : <Sun className="h-5 w-5" />}
             </Button>
             <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
               <Menu className="h-6 w-6" />
             </Button>
           </div>
         </header>
        <main className="flex-1 relative focus:outline-none">
          <div className="py-8 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
