import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
 import { 
    LayoutDashboard,
    Globe,
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
    AlertCircle,
    Sparkles
 } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { cn } from "@/lib/utils";
 import { useTheme } from "next-themes";
import { useBrand } from "@/hooks/use-brand";

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
   const { profile } = useBrand();
   const brandName = profile.brandName || "GrowthSuite Pro";
   const BrandMark = () => (
    <span className="flex flex-col items-center gap-1 min-w-0 w-full">
      {profile.logoUrl ? (
        <img src={profile.logoUrl} alt={brandName} className="h-10 w-10 rounded object-contain" />
      ) : null}
      <span className="w-full text-center text-sm font-extralight gradient-text tracking-widest uppercase break-words leading-tight">
        {brandName}
      </span>
    </span>
   );

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "YouTube Stats", href: "/youtube", icon: () => (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ) },
    { name: "Blog Analytics", href: "/blog", icon: Globe },
    { name: "Facebook Pages", href: "/facebook", icon: () => (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ) },
    { name: "Facebook Ads", href: "/facebook-ads", icon: Megaphone },
    { name: "AdSense", href: "/adsense", icon: PieChart },
    { name: "Estudo de Mercado", href: "/market-analysis", icon: Search },
    { name: "Market Intelligence Pro", href: "/market-intelligence", icon: Sparkles },
    { name: "Estratégia", href: "/strategy", icon: TrendingUp },
    { name: "Relatórios", href: "/reports", icon: PieChart },
    { name: "Configurações", href: "/settings", icon: Settings },
    { name: "Diagnóstico", href: "/diagnostics", icon: AlertCircle },
  ];

   return (
      <div className="min-h-screen bg-background flex overflow-hidden relative">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full z-0 pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full z-0 pointer-events-none" />
        
       <div className={cn("fixed inset-0 z-50 lg:hidden", sidebarOpen ? "block" : "hidden")}> 
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-card/80 backdrop-blur-xl border-r border-white/10">
           <div className="flex h-16 items-center justify-between px-6 border-b">
             <BrandMark />
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}><X className="h-6 w-6" /></Button>
          </div>
          <nav className="flex-1 space-y-1 px-4 py-4 overflow-y-auto">
            {navigation.map((item) => (
              <Link key={item.name} to={item.href} className={cn(location.pathname === item.href ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground", "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors")}> 
                <item.icon className="mr-3 h-5 w-5" aria-hidden="true" />{item.name}
              </Link>
            ))}
          </nav>
          <div className="border-t p-4"><Button variant="ghost" className="w-full justify-start text-slate-600"><LogOut className="mr-3 h-5 w-5" />Sair</Button></div>
        </div>
      </div>

        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r border-white/5 bg-card/40 backdrop-blur-xl z-10">
          <div className="flex min-h-16 items-center justify-center px-4 py-3 border-b border-white/5"><BrandMark /></div>
        <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
          {navigation.map((item) => (
            <Link key={item.name} to={item.href} className={cn(location.pathname === item.href ? "bg-primary/20 text-primary border border-primary/20 shadow-[0_0_15px_rgba(139,92,246,0.1)]" : "text-muted-foreground hover:bg-white/5 hover:text-foreground", "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 mb-1")}> 
              <item.icon className={cn("mr-3 h-5 w-5", location.pathname === item.href ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} aria-hidden="true" />
              {item.name}
              {location.pathname === item.href && <ChevronRight className="ml-auto h-4 w-4" />}
            </Link>
          ))}
        </nav>
         <div className="border-t p-4 space-y-4">
           <div className="flex items-center justify-between px-4">
             <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tema</span>
             <Button variant="ghost" size="icon" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} className="h-8 w-8 rounded-lg bg-accent/50 text-muted-foreground hover:text-foreground transition-all duration-200 active:scale-95">
                 {mounted ? (resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />) : <Sun className="h-4 w-4" />}
             </Button>
           </div>
           <div className="flex items-center gap-3 px-4 py-3">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-light border border-primary/20">AD</div>
             <div className="flex-1 min-w-0"><p className="text-sm font-light text-foreground truncate">{profile.fullName || "Usuário"}</p><p className="text-xs text-muted-foreground truncate">{profile.email || "—"}</p></div>
           </div>
           <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"><LogOut className="mr-3 h-5 w-5" />Sair</Button>
        </div>
      </div>

        <div className="lg:pl-64 flex flex-col flex-1 w-full min-h-screen relative z-1">
          <header className="sticky top-0 z-40 lg:hidden flex h-16 items-center justify-between border-b border-white/5 bg-background/60 backdrop-blur-md px-4">
            <BrandMark />
           <div className="flex items-center gap-2">
             <Button variant="ghost" size="icon" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} className="h-9 w-9 text-muted-foreground transition-all duration-200 active:scale-95">{mounted ? (resolvedTheme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />) : <Sun className="h-5 w-5" />}</Button>
             <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}><Menu className="h-6 w-6" /></Button>
           </div>
         </header>
        <main className="flex-1 relative focus:outline-none"><div className="py-8 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto">{children}</div></main>
      </div>
    </div>
  );
};

export default DashboardLayout;
