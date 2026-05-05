import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 blur-[100px] rounded-full" />
      <div className="text-center relative z-10 space-y-4">
        <h1 className="text-6xl font-extralight tracking-tighter text-foreground opacity-20">404</h1>
        <p className="text-xl font-light text-muted-foreground italic">Oops! Página não encontrada</p>
        <a href="/" className="inline-block text-primary font-light tracking-widest uppercase text-xs border-b border-primary/20 hover:border-primary transition-all pb-1 mt-4">
          Voltar ao Início
        </a>
      </div>
    </div>
  );
};

export default NotFound;
