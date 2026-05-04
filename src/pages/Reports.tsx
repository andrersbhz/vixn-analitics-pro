import DashboardLayout from "@/components/DashboardLayout";
import { AnalyticsCard } from "@/components/analytics/AnalyticsCard";
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter,
  BarChart,
  PieChart as PieChartIcon,
  Table as TableIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";

const Reports = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-accent/50 rounded-xl">
               <FileText className="h-8 w-8 text-muted-foreground" />
             </div>
             <div>
               <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
               <p className="text-muted-foreground mt-1">Gere e exporte dados detalhados de performance.</p>
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
               <h3 className="font-bold text-foreground">{report.name}</h3>
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
