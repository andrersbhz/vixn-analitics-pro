import DashboardLayout from "@/components/DashboardLayout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Users, 
  Eye, 
  MousePointer2, 
  Youtube, 
  Globe, 
  Facebook 
} from "lucide-react";
import { cn } from "@/lib/utils";

const StatsCard = ({ title, value, change, trend, icon: Icon }: any) => (
  <Card>
     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
       <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
       <Icon className="h-4 w-4 text-muted-foreground" />
     </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className={cn(
         "text-xs mt-1 flex items-center",
         trend === "up" ? "text-emerald-500" : "text-rose-500"
       )}>
        {trend === "up" ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
        {change} em relação ao mês anterior
      </p>
    </CardContent>
  </Card>
);

const Index = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8">
         <div>
           <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
           <p className="text-muted-foreground mt-2">Visão geral do seu crescimento em todas as plataformas.</p>
         </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard 
            title="Visualizações Totais" 
            value="128.432" 
            change="+12.5%" 
            trend="up" 
            icon={Eye} 
          />
          <StatsCard 
            title="Inscritos/Seguidores" 
            value="12.245" 
            change="+4.3%" 
            trend="up" 
            icon={Users} 
          />
          <StatsCard 
            title="Taxa de Cliques" 
            value="8.2%" 
            change="-0.5%" 
            trend="down" 
            icon={MousePointer2} 
          />
          <StatsCard 
            title="Tempo de Exibição" 
            value="4.5k hrs" 
            change="+22.1%" 
            trend="up" 
            icon={Youtube} 
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Crescimento de Canais</CardTitle>
              <CardDescription>
                Análise comparativa de crescimento por plataforma.
              </CardDescription>
            </CardHeader>
             <CardContent className="h-[300px] flex items-center justify-center border-2 border-dashed border-muted rounded-lg m-6 text-muted-foreground bg-accent/5">
              Gráfico de Performance em Tempo Real
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Últimas Atualizações</CardTitle>
              <CardDescription>Eventos recentes em suas redes.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                 {[
                   { icon: Youtube, color: "text-red-500", bg: "bg-red-500/10", title: "Vídeo 'Dicas de SEO' atingiu 10k views", time: "2 horas atrás" },
                   { icon: Globe, color: "text-blue-500", bg: "bg-blue-500/10", title: "Novo post publicado no WordPress", time: "5 horas atrás" },
                   { icon: Facebook, color: "text-indigo-500", bg: "bg-indigo-500/10", title: "Página Facebook cresceu 200 seguidores", time: "1 dia atrás" },
                 ].map((event, i) => (
                   <div key={i} className="flex items-center">
                     <div className={cn("p-2 rounded-lg mr-4", event.bg)}>
                       <event.icon className={cn("h-4 w-4", event.color)} />
                     </div>
                     <div className="flex-1">
                       <p className="text-sm font-medium text-foreground">{event.title}</p>
                       <p className="text-xs text-muted-foreground">{event.time}</p>
                     </div>
                   </div>
                 ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
