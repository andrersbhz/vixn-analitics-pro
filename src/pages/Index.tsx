import DashboardLayout from "@/components/DashboardLayout";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell } from 'recharts';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useConnections } from "@/hooks/use-connections";
import { fetchWordPressData, WordPressStats } from "@/lib/wordpress";
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
  const { connections, getConnection } = useConnections();
  const [wpData, setWpData] = useState<WordPressStats | null>(null);
  const wpConn = getConnection('wordpress');
  const ytConn = getConnection('youtube');
  const fbConn = getConnection('facebook');

  useEffect(() => {
    if (wpConn?.isConnected && wpConn.config.url) {
      fetchWordPressData(wpConn.config.url, wpConn.config.user, wpConn.config.password)
        .then(setWpData)
        .catch(console.error);
    }
  }, [wpConn]);

  const isAnyConnected = connections.some(c => c.isConnected);

  return (
    <DashboardLayout>
      <div className="space-y-8">
         <div>
           <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
           <p className="text-muted-foreground mt-2">Visão geral do seu crescimento em todas as plataformas.</p>
         </div>

        {!isAnyConnected ? (
          <div className="p-12 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center text-center space-y-4 bg-accent/20">
            <div className="p-4 bg-primary/10 rounded-full">
              <Globe className="h-10 w-10 text-primary" />
            </div>
            <div className="max-w-md">
              <h2 className="text-xl font-bold">Nenhuma plataforma conectada</h2>
              <p className="text-muted-foreground mt-1">Conecte seu YouTube, Blog ou Facebook Ads para ver seus dados reais aqui.</p>
            </div>
            <a href="/settings">
              <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium">Configurar Conexões</button>
            </a>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard 
                title="Posts no Blog" 
                value={wpConn?.isConnected ? (wpData?.postCount || "...") : "---"} 
                change={wpConn?.isConnected ? "+0%" : "0%"} 
                trend="up" 
                icon={Globe} 
              />
              <StatsCard 
                title="Canal YouTube" 
                value={ytConn?.isConnected ? "Conectado" : "---"} 
                change={ytConn?.isConnected ? "ID: " + ytConn.config.id?.substring(0,8) + "..." : "0%"} 
                trend="up" 
                icon={Youtube} 
              />
              <StatsCard 
                title="Contas Facebook" 
                value={fbConn?.isConnected ? "Ativo" : "---"} 
                change={fbConn?.isConnected ? "Monitorando" : "0%"} 
                trend="up" 
                icon={Facebook} 
              />
              <StatsCard 
                title="Sincronização" 
                value={isAnyConnected ? "Real-time" : "---"} 
                change="Status OK" 
                trend="up" 
                icon={Users} 
              />
            </div>

            {/* Rest of the dashboard remains but showing connected indicators */}
          </>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-6">
          <Card className="lg:col-span-4 shadow-sm border-muted/20">
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
                  <Area type="monotone" dataKey="yt" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.1} strokeWidth={2} />
                  <Area type="monotone" dataKey="blog" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 shadow-sm border-muted/20">
            <CardHeader className="pb-2">
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

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="shadow-sm border-muted/20">
            <CardHeader>
              <CardTitle>Engajamento por Canal</CardTitle>
              <CardDescription>Distribuição de interações por plataforma.</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'YouTube', value: 45 },
                  { name: 'Blog', value: 30 },
                  { name: 'Facebook', value: 25 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{backgroundColor: 'hsl(var(--card))', borderRadius: '8px'}} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    <Cell fill="hsl(var(--primary))" />
                    <Cell fill="#3b82f6" />
                    <Cell fill="#6366f1" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-muted/20">
            <CardHeader>
              <CardTitle>Metas de Crescimento</CardTitle>
              <CardDescription>Progresso atual das suas metas principais.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: "15k Inscritos YT", progress: 82, color: "bg-primary" },
                  { label: "2k Views Blog/Dia", progress: 65, color: "bg-blue-500" },
                  { label: "10k Seguidores FB", progress: 45, color: "bg-indigo-500" },
                ].map((goal, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span>{goal.label}</span>
                      <span>{goal.progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className={cn("h-full transition-all duration-1000", goal.color)} style={{ width: `${goal.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-muted/20 bg-primary/5 border-primary/10">
            <CardHeader>
              <CardTitle className="text-primary">Dica da IA</CardTitle>
              <CardDescription>Otimize seu crescimento hoje.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-foreground/80">
                Seu engajamento no YouTube aumenta significativamente quando você posta às 18h. 
                <strong> Recomendação:</strong> Agende seu próximo vídeo sobre "Marketing Digital" para amanhã neste horário.
              </p>
              <button className="mt-4 w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                Ver mais insights
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
