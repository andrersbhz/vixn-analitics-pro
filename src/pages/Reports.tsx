 import DashboardLayout from "@/components/DashboardLayout";
 import { AnalyticsCard } from "@/components/analytics/AnalyticsCard";
 import { 
   FileText, 
   Download, 
   Calendar, 
   Filter,
   BarChart,
   PieChart as PieChartIcon,
   Table as TableIcon,
   TrendingUp,
   TrendingDown,
   DollarSign,
   Eye,
   MousePointer2,
   Users,
   ArrowRight
 } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { useConnections } from "@/hooks/use-connections";
 import { 
   ResponsiveContainer, 
   AreaChart, 
   Area, 
   XAxis, 
   YAxis, 
   CartesianGrid, 
   Tooltip as RechartsTooltip,
   BarChart as RechartsBarChart,
   Bar,
   Cell
 } from 'recharts';
 import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
 import { Badge } from "@/components/ui/badge";

const Reports = () => {
   const { items, loading } = useConnections();
 
   const totalEarnings = items.reduce((acc, curr) => acc + (curr.earnings || 0), 0);
   const totalViews = items.reduce((acc, curr) => acc + (curr.views || 0), 0);
   const totalClicks = items.reduce((acc, curr) => acc + (curr.clicks || 0), 0);
   const totalImpressions = items.reduce((acc, curr) => acc + (curr.impressions || 0), 0);
   
   const avgCTR = items.length > 0 ? items.reduce((acc, curr) => acc + (Number(curr.ctr) || 0), 0) / items.length : 0;
   const avgEngagement = items.length > 0 ? items.reduce((acc, curr) => acc + (Number(curr.engagement_rate) || 0), 0) / items.length : 0;
 
   const platformData = [
     { name: 'YouTube', value: items.filter(i => i.platform_id === 'youtube').length, color: '#EF4444' },
     { name: 'Blog', value: items.filter(i => i.platform_id === 'wordpress').length, color: '#10B981' },
     { name: 'AdSense', value: items.filter(i => i.platform_id === 'adsense').length, color: '#F59E0B' },
     { name: 'Facebook', value: items.filter(i => i.platform_id === 'facebook').length, color: '#3B82F6' },
   ];
 
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-accent/50 rounded-xl">
               <FileText className="h-8 w-8 text-muted-foreground" />
             </div>
             <div>
               <h1 className="text-3xl font-extralight text-foreground tracking-tight">Relatórios</h1>
               <p className="text-muted-foreground mt-1 font-light italic opacity-80">Gere e exporte dados detalhados de performance.</p>
             </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> Filtrar</Button>
            <Button className="bg-primary text-white"><Download className="mr-2 h-4 w-4" /> Exportar PDF</Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            { name: "Performance Mensal", date: "01/04 - 30/04", type: "Completo", icon: BarChart },
            { name: "SEO & Tráfego", date: "Abril 2024", type: "Blog", icon: TableIcon },
            { name: "Audiência Social", date: "Últimos 7 dias", type: "YouTube/FB", icon: PieChartIcon },
          ].map((report, i) => (
             <div key={i} className="bg-card p-6 rounded-xl border hover:shadow-md transition-shadow cursor-pointer group">
               <div className="flex justify-between items-start mb-4">
                 <div className="p-2 bg-accent/50 rounded-lg group-hover:bg-primary/10 transition-colors">
                   <report.icon className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                 </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
               <h3 className="font-light text-foreground uppercase tracking-wide">{report.name}</h3>
               <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                 <Calendar className="h-3 w-3" />
                 <span>{report.date}</span>
                 <span className="mx-1">•</span>
                 <span>{report.type}</span>
               </div>
            </div>
          ))}
        </div>

        <AnalyticsCard title="Atividade Recente de Dados">
          <div className="space-y-4">
            <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg text-slate-400">
              Gráfico de Tendência Histórica
            </div>
          </div>
        </AnalyticsCard>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
