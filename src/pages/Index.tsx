import DashboardLayout from "@/components/DashboardLayout";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
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
            <CardContent className="h-[350px] p-6 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[
                  { name: 'Seg', yt: 4000, blog: 2400, fb: 2400 },
                  { name: 'Ter', yt: 3000, blog: 1398, fb: 2210 },
                  { name: 'Qua', yt: 2000, blog: 9800, fb: 2290 },
                  { name: 'Qui', yt: 2780, blog: 3908, fb: 2000 },
                  { name: 'Sex', yt: 1890, blog: 4800, fb: 2181 },
                  { name: 'Sáb', yt: 2390, blog: 3800, fb: 2500 },
                  { name: 'Dom', yt: 3490, blog: 4300, fb: 2100 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} />
                  <YAxis hide />
                  <Tooltip contentStyle={{backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))'}} />
                  <Area type="monotone" dataKey="yt" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                  <Area type="monotone" dataKey="blog" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
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
