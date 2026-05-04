 import { useState, useEffect, useMemo } from "react";
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
  Settings,
  RefreshCw,
  Download,
  FileText,
  Table
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
 import { Calendar as CalendarComponent } from "@/components/ui/calendar";
 import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
 import { format, subDays, isAfter, isBefore, startOfDay, endOfDay } from "date-fns";
 import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Papa from "papaparse";

const AdSenseAnalytics = () => {
  const { getConnection } = useConnections();
  const adsenseConn = getConnection('adsense');
  const { testSync } = useConnections();
  const [period, setPeriod] = useState("7d");
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 6),
    to: new Date(),
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);

  // Mock data for AdSense revenue
  const allData = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 90; i >= 0; i--) {
      const date = subDays(now, i);
      days.push({
        date,
        name: format(date, 'eee', { locale: ptBR }),
        revenue: Math.random() * 50 + 20,
      });
    }
    return days;
  }, []);

  const revenueData = useMemo(() => {
    let start: Date;
    let end = endOfDay(new Date());

    if (period === '7d') start = startOfDay(subDays(new Date(), 6));
    else if (period === '30d') start = startOfDay(subDays(new Date(), 29));
    else if (period === '90d') start = startOfDay(subDays(new Date(), 89));
    else {
      start = startOfDay(dateRange.from);
      end = endOfDay(dateRange.to);
    }

    return allData.filter(d => 
      (isAfter(d.date, start) || d.date.getTime() === start.getTime()) && 
      (isBefore(d.date, end) || d.date.getTime() === end.getTime())
    );
  }, [period, dateRange, allData]);

  const totals = useMemo(() => {
    return revenueData.reduce((acc, curr) => acc + curr.revenue, 0);
  }, [revenueData]);

  const handleSyncNow = async () => {
    setIsSyncing(true);
    setSyncLogs(prev => [`[${new Date().toLocaleTimeString()}] Iniciando sincronização...`, ...prev]);
    toast.info("Iniciando sincronização com Google AdSense...");
    try {
      const result = await testSync('adsense');
      if (result.success) {
        setSyncLogs(prev => [`[${new Date().toLocaleTimeString()}] SUCESSO: Dados atualizados.`, ...prev]);
        toast.success("Sincronização concluída com sucesso!");
      } else {
        setSyncLogs(prev => [`[${new Date().toLocaleTimeString()}] ERRO: ${result.log}`, ...prev]);
        toast.error("Erro na sincronização. Verifique os logs.");
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const exportToCSV = () => {
    const csv = Papa.unparse(revenueData.map(d => ({ 'Dia': d.name, 'Receita (R$)': d.revenue.toFixed(2) })));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `adsense-report-${format(dateRange.from, 'yyyy-MM-dd')}-to-${format(dateRange.to, 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV exportado com sucesso!");
  };

  const exportToPDF = () => {
    const doc = new jsPDF() as any;
    const dateStr = `${format(revenueData[0]?.date || new Date(), 'dd/MM/yyyy')} até ${format(revenueData[revenueData.length-1]?.date || new Date(), 'dd/MM/yyyy')}`;
    
    // Header
    doc.setFontSize(18);
    doc.text("Relatório de Receita Google AdSense", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Período: ${dateStr}`, 14, 30);
    doc.text(`Total Acumulado: R$ ${totals.toFixed(2)}`, 14, 37);

    doc.autoTable({
      head: [['Dia', 'Receita (R$)']],
      body: revenueData.map(d => [format(d.date, 'dd/MM/yyyy'), `R$ ${d.revenue.toFixed(2)}`]),
      startY: 45,
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}`, 14, doc.internal.pageSize.height - 10);
    }

    doc.save(`adsense-report-${period}.pdf`);
    toast.success("PDF exportado com sucesso!");
  };

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
        
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={exportToCSV}
            className="gap-2"
          >
            <Table className="h-4 w-4" /> Exportar CSV
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={exportToPDF}
            className="gap-2"
          >
            <FileText className="h-4 w-4" /> Exportar PDF
          </Button>
          <Button 
            size="sm" 
            onClick={handleSyncNow} 
            disabled={isSyncing}
            className="gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", isSyncing && "animate-spin")} />
            {isSyncing ? "Sincronizando..." : "Sincronizar Agora"}
          </Button>
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
