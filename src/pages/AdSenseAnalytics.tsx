import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { AnalyticsCard } from "@/components/analytics/AnalyticsCard";
import { 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  History,
  Settings
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { useConnections } from "@/hooks/use-connections";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const AdSenseAnalytics = () => {
  const { getConnection } = useConnections();
  const adsenseConn = getConnection('adsense');
  const [period, setPeriod] = useState("7d");

  // Mock data for AdSense revenue
  const revenueData = [
    { name: 'Seg', revenue: 45.20 },
    { name: 'Ter', revenue: 52.15 },
    { name: 'Qua', revenue: 48.90 },
    { name: 'Qui', revenue: 61.30 },
    { name: 'Sex', revenue: 55.40 },
    { name: 'Sáb', revenue: 38.20 },
    { name: 'Dom', revenue: 42.10 },
  ];

  if (!adsenseConn?.isConnected) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="p-4 bg-yellow-500/10 rounded-full">
            <DollarSign className="h-12 w-12 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">AdSense não conectado</h2>
          <p className="text-muted-foreground text-center max-w-md">
            Conecte sua conta do Google AdSense para visualizar métricas de receita detalhadas.
          </p>
          <Link to="/settings">
            <Button>Configurar AdSense</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-500/10 rounded-xl">
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Google AdSense</h1>
              <p className="text-muted-foreground mt-1">Visão detalhada de ganhos e performance de monetização.</p>
            </div>
          </div>
          <div className="flex bg-card border rounded-lg p-1">
            {["7d", "30d", "90d"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                  period === p ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          {[
            { label: "Ganhos Estimados (Hoje)", value: "R$ 42,10", trend: "+12%", up: true },
            { label: "Ganhos Ontem", value: "R$ 38,20", trend: "-5%", up: false },
            { label: "Últimos 7 dias", value: "R$ 343,25", trend: "+8.2%", up: true },
            { label: "Saldo Atual", value: "R$ 1.250,40", trend: "Próximo pag.", up: true },
          ].map((stat, i) => (
            <div key={i} className="bg-card p-5 rounded-xl border shadow-sm">
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <span className={cn(
                  "text-xs font-semibold px-1.5 py-0.5 rounded",
                  stat.up ? "text-emerald-500 bg-emerald-500/10" : "text-rose-500 bg-rose-500/10"
                )}>
                  {stat.trend}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <AnalyticsCard title="Tendência de Receita" className="lg:col-span-2">
            <div className="h-[350px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ca8a04" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ca8a04" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} tickFormatter={(value) => `R$ ${value}`} />
                  <Tooltip 
                    contentStyle={{backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px'}}
                    formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Receita']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#ca8a04" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </AnalyticsCard>

          <div className="space-y-6">
            <AnalyticsCard title="Sincronização Automática">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Intervalo</span>
                  </div>
                  <select className="bg-transparent text-sm font-bold focus:outline-none">
                    <option>15 min</option>
                    <option selected>1 hora</option>
                    <option>6 horas</option>
                    <option>24 horas</option>
                  </select>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <History className="h-4 w-4" />
                    Histórico de Atualizações
                  </div>
                  <div className="space-y-2">
                    {[
                      { time: "Há 45 min", status: "Sucesso", detail: "24 novos registros" },
                      { time: "Há 2 horas", status: "Sucesso", detail: "Sincronização completa" },
                      { time: "Ontem, 23:15", status: "Aviso", detail: "Latência na API Google" },
                    ].map((log, i) => (
                      <div key={i} className="text-xs p-2 border-l-2 border-primary/30 bg-accent/30 rounded-r-md">
                        <div className="flex justify-between font-medium">
                          <span>{log.time}</span>
                          <span className={log.status === 'Sucesso' ? 'text-emerald-500' : 'text-amber-500'}>{log.status}</span>
                        </div>
                        <p className="text-muted-foreground mt-0.5">{log.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AnalyticsCard>

            <AnalyticsCard title="Dica de Otimização">
              <div className="flex gap-3 p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-xl">
                <TrendingUp className="h-5 w-5 text-yellow-600 shrink-0" />
                <p className="text-sm text-foreground leading-relaxed">
                  Seus anúncios no **Blog** estão com CTR 20% abaixo da média do nicho. Experimente mover o bloco superior para o meio do conteúdo.
                </p>
              </div>
            </AnalyticsCard>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdSenseAnalytics;
