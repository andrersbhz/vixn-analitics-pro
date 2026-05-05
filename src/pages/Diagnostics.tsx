import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { AnalyticsCard } from "@/components/analytics/AnalyticsCard";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database, 
  RefreshCw, 
  Terminal,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConnections } from "@/hooks/use-connections";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Diagnostics = () => {
  const { connections, loading: connectionsLoading, testSync } = useConnections();
  const [isCheckingDB, setIsCheckingDB] = useState(false);
  const [dbStatus, setDbStatus] = useState<"ok" | "error" | "checking">("checking");
  const [logs, setLogs] = useState<{ type: "error" | "info" | "warn"; msg: string; time: string }[]>([]);
  const adsenseConn = connections.find(c => c.id === 'adsense');

  useEffect(() => {
    const checkDB = async () => {
      setIsCheckingDB(true);
      setDbStatus("checking");
      try {
        const { error } = await supabase.from('platform_connections').select('id').limit(1);
        setDbStatus(error ? "error" : "ok");
      } catch (e) {
        setDbStatus("error");
      } finally {
        setIsCheckingDB(false);
      }
    };

    checkDB();

    // Intercept console errors for display
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.error = (...args: any[]) => {
      const msg = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
      setLogs(prev => [{ type: "error" as const, msg, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 50));
      originalError.apply(console, args);
    };

    console.warn = (...args: any[]) => {
      const msg = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
      setLogs(prev => [{ type: "warn" as const, msg, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 50));
      originalWarn.apply(console, args);
    };

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  const handleRecheck = () => {
    window.location.reload();
  };

  const healthChecks = [
    {
      name: "Conexão com Banco de Dados (Supabase)",
      status: dbStatus,
      desc: dbStatus === "ok" ? "Conexão estável." : "Erro ao acessar o banco de dados.",
      icon: Database
    },
    {
      name: "Estado das Conexões",
      status: connectionsLoading ? "checking" : "ok",
      desc: connectionsLoading ? "Carregando..." : `${connections.filter(c => c.isConnected).length} plataformas conectadas.`,
      icon: ShieldCheck
    },
    {
      name: "Google AdSense",
      status: adsenseConn?.isConnected ? "ok" : "warn",
      desc: adsenseConn?.isConnected ? "Configurado e pronto." : "Não conectado.",
      icon: Activity
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <Terminal className="h-8 w-8" />
            </div>
            <div>
               <h1 className="text-3xl font-extralight text-foreground tracking-tight">Centro de Diagnóstico</h1>
               <p className="text-muted-foreground mt-1 font-light italic opacity-80">Verifique a integridade do sistema e visualize logs em tempo real.</p>
            </div>
          </div>
          <div className="flex gap-2">
             <Button onClick={handleRecheck} variant="outline" className="gap-2">
               <RefreshCw className="h-4 w-4" /> Recarregar
             </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {healthChecks.map((check, i) => (
            <div key={i} className="glass-card p-5 relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div className="p-2 bg-muted/30 rounded-full border border-white/5">
                  <check.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                {check.status === "ok" && <CheckCircle className="h-5 w-5 text-emerald-500/80" />}
                {check.status === "error" && <AlertTriangle className="h-5 w-5 text-rose-500/80" />}
                {check.status === "warn" && <AlertTriangle className="h-5 w-5 text-amber-500/80" />}
                {check.status === "checking" && <RefreshCw className="h-5 w-5 text-primary animate-spin" />}
              </div>
              <div className="mt-4">
                <h3 className="font-light text-foreground uppercase tracking-widest text-sm">{check.name}</h3>
                <p className="text-sm text-muted-foreground mt-1 font-light italic">{check.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <AnalyticsCard title="Última Sincronização AdSense">
            <div className="space-y-4">
              {!adsenseConn?.isConnected ? (
                <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/30 rounded-lg">
                  <AlertTriangle className="h-8 w-8 text-amber-500 mb-2" />
                  <p className="text-sm font-medium">AdSense não está conectado.</p>
                  <p className="text-xs text-muted-foreground mt-1">Vá em configurações para ativar.</p>
                </div>
              ) : (
                <>
                  <div className="p-4 bg-primary/5 border rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Próxima atualização</p>
                        <p className="text-xs text-muted-foreground">
                          {adsenseConn.next_sync_at ? format(new Date(adsenseConn.next_sync_at), "HH:mm 'de' dd/MM", { locale: ptBR }) : "Não agendado"}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => testSync('adsense')} variant="ghost" className="h-8 px-2 text-xs">
                      Sincronizar Agora
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status Atual</h4>
                    <div className="bg-slate-900 rounded-md p-3 font-mono text-[11px] text-slate-300 min-h-[100px] overflow-y-auto">
                       {adsenseConn.isConnected ? (
                         <div className="space-y-1">
                           <div className="text-emerald-400 flex items-center gap-2">
                             <CheckCircle className="h-3 w-3" /> Conectado via ID: {adsenseConn.config.id}
                           </div>
                           <div className="text-slate-500">Intervalo: {adsenseConn.sync_interval_minutes} minutos</div>
                         </div>
                       ) : (
                         <div className="italic text-slate-500">Aguardando conexão...</div>
                       )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </AnalyticsCard>

          <AnalyticsCard title="Logs do Sistema (Console)">
            <div className="space-y-3">
               <div className="bg-slate-900 rounded-md p-4 font-mono text-[11px] text-slate-300 h-[300px] overflow-y-auto border border-slate-800">
                 {logs.length > 0 ? (
                   logs.map((log, i) => (
                     <div key={i} className={cn(
                       "mb-2 pb-2 border-b border-slate-800 last:border-0",
                       log.type === "error" ? "text-rose-400" : "text-amber-400"
                     )}>
                       <div className="flex justify-between items-center mb-1">
                         <span className={cn(
                           "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase",
                           log.type === "error" ? "bg-rose-500/20 text-rose-400" : "bg-amber-500/20 text-amber-400"
                         )}>
                           {log.type}
                         </span>
                         <span className="text-slate-500">{log.time}</span>
                       </div>
                       <div className="break-all whitespace-pre-wrap">{log.msg}</div>
                     </div>
                   ))
                 ) : (
                   <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2">
                     <CheckCircle className="h-8 w-8 text-emerald-500/50" />
                     <p>Nenhum alerta detectado até agora.</p>
                   </div>
                 )}
               </div>
               <p className="text-[10px] text-muted-foreground italic">
                 *Nota: Somente mensagens geradas após carregar esta página são exibidas.
               </p>
            </div>
          </AnalyticsCard>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Diagnostics;
