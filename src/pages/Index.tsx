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
  Facebook,
  DollarSign
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
  const adsenseConn = getConnection('adsense');

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
            <Link to="/settings">
              <Button className="px-6 py-2">Configurar Conexões</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
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
                title={
                  <Link to="/adsense" className="hover:text-primary transition-colors flex items-center gap-1">AdSense <ArrowUpRight className="h-3 w-3" /></Link>
                }
                value={adsenseConn?.isConnected ? "Ativo" : "---"} 
                change={adsenseConn?.isConnected ? "R$ 0,00" : "0%"} 
                trend="up" 
                icon={DollarSign} 
              />
              <StatsCard 
                title="Sincronização" 
                value={isAnyConnected ? "Real-time" : "---"} 
                change="Status OK" 
                trend="up" 
                icon={Users} 
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-6">
              <Card className="lg:col-span-4 shadow-sm border-muted/20">
                <CardHeader>
                  <CardTitle>Crescimento de Canais</CardTitle>
                  <CardDescription>Análise comparativa de crescimento por plataforma.</CardDescription>
                </CardHeader>
                <CardContent className="h-[350px] p-6 pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { name: 'Seg', yt: ytConn?.isConnected ? 4000 : 0, blog: wpConn?.isConnected ? 2400 : 0, fb: fbConn?.isConnected ? 2400 : 0 },
                      { name: 'Ter', yt: ytConn?.isConnected ? 3000 : 0, blog: wpConn?.isConnected ? 1398 : 0, fb: fbConn?.isConnected ? 2210 : 0 },
                      { name: 'Qua', yt: ytConn?.isConnected ? 2000 : 0, blog: wpConn?.isConnected ? 9800 : 0, fb: fbConn?.isConnected ? 2290 : 0 },
                      { name: 'Qui', yt: ytConn?.isConnected ? 2780 : 0, blog: wpConn?.isConnected ? 3908 : 0, fb: fbConn?.isConnected ? 2000 : 0 },
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
                  <CardDescription>Eventos recentes sincronizados.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                     {wpData?.latestPosts.slice(0, 3).map((post, i) => (
                       <div key={i} className="flex items-center">
                         <div className={cn("p-2 rounded-lg mr-4 bg-blue-500/10")}>
                           <Globe className={cn("h-4 w-4 text-blue-500")} />
                         </div>
                         <div className="flex-1">
                           <p className="text-sm font-medium text-foreground line-clamp-1" dangerouslySetInnerHTML={{ __html: post.title?.rendered || "Sem título" }}></p>
                           <p className="text-xs text-muted-foreground">Postado no Blog</p>
                         </div>
                       </div>
                     ))}
                     {!wpData && (
                       <p className="text-sm text-muted-foreground text-center py-8">Nenhuma atualização recente encontrada.</p>
                     )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Index;
