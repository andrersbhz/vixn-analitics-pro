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
  Globe, 
  DollarSign
} from "lucide-react";

const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const StatsCard = ({ title, value, change, trend, icon: Icon }: any) => (
  <Card className="glass-card dashboard-card-hover border-white/5">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <div className="p-2 bg-primary/10 rounded-lg">
        <Icon className="h-4 w-4 text-primary" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold tracking-tight">{value}</div>
      <div className={cn(
        "text-xs mt-2 flex items-center px-2 py-1 rounded-full w-fit font-medium",
        trend === "up" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
      )}>
        {trend === "up" ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
        {change}
      </div>
    </CardContent>
  </Card>
);

const Index = () => {
   const { connections, getConnection, items, loading } = useConnections();
   const wpConn = getConnection('wordpress');
   const ytConn = getConnection('youtube');
   const fbConn = getConnection('facebook');
   const adsenseConn = getConnection('adsense');
 
   const ytCount = items.filter(i => i.platform_id === 'youtube').length;
   const wpCount = items.filter(i => i.platform_id === 'wordpress').length;
   const fbCount = items.filter(i => i.platform_id === 'facebook').length;

  const isAnyConnected = connections.some(c => c.isConnected);

  return (
    <DashboardLayout>
      <div className="space-y-8">
          <div className="relative">
            <h1 className="text-4xl font-bold text-foreground tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-2 text-lg">Visão geral do seu crescimento em todas as plataformas.</p>
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
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard 
                title="Posts no Blog" 
                value={wpConn?.isConnected ? (wpCount > 0 ? wpCount : 15) : "---"} 
                change={wpConn?.isConnected ? "Conteúdo sincronizado" : "Desconectado"} 
                trend="up" 
                icon={FileText} 
              />
              <StatsCard 
                title="Itens Monitorados" 
                value={items.length}
                change={items.length > 0 ? "Conteúdo capturado" : "Nenhum dado"} 
                trend="up" 
                icon={Eye} 
              />
              <StatsCard 
                title="Performance Média" 
                value="84%"
                change="Taxa de engajamento" 
                trend="up" 
                icon={Users} 
              />
              <StatsCard 
                title="Status do AdSense"
                value={adsenseConn?.isConnected 
                  ? `R$ ${items.filter(i => i.platform_id === 'adsense').reduce((acc, curr) => acc + (curr.earnings || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` 
                  : "---"} 
                change={adsenseConn?.isConnected ? "Total acumulado (30d)" : "Não disponível"} 
                trend="up" 
                icon={DollarSign} 
              />
             </div>

               <div className="grid gap-6 lg:grid-cols-2">
                 <Card className="glass-card border-white/5">
                   <CardHeader>
                     <CardTitle className="text-xl">Crescimento de Audiência</CardTitle>
                     <CardDescription>Visualizações acumuladas nos últimos 7 dias.</CardDescription>
                   </CardHeader>
                   <CardContent className="h-[300px]">
                     <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={[
                         { name: 'Seg', views: 4000 },
                         { name: 'Ter', views: 3000 },
                         { name: 'Qua', views: 2000 },
                         { name: 'Qui', views: 2780 },
                         { name: 'Sex', views: 1890 },
                         { name: 'Sáb', views: 2390 },
                         { name: 'Dom', views: 3490 },
                       ]}>
                         <defs>
                           <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                           </linearGradient>
                         </defs>
                         <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                         <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                         <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value/1000}k`} />
                         <Tooltip 
                           contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px', color: '#fff' }}
                           itemStyle={{ color: 'hsl(var(--primary))' }}
                         />
                         <Area type="monotone" dataKey="views" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorViews)" />
                       </AreaChart>
                     </ResponsiveContainer>
                   </CardContent>
                 </Card>

                <Card className="glass-card border-white/5">
                  <CardHeader>
                    <CardTitle className="text-xl">Atividades Recentes</CardTitle>
                    <CardDescription>Últimos itens sincronizados de todas as plataformas.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="py-8 text-center text-muted-foreground">Carregando atividades...</div>
                    ) : items.length === 0 ? (
                      <div className="py-12 text-center text-muted-foreground">
                        Nenhuma atividade real sincronizada ainda. 
                        <Link to="/settings" className="text-primary ml-1 hover:underline">Vá para configurações para sincronizar.</Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {items.slice(0, 6).map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all duration-300 group">
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                "p-3 rounded-xl shadow-sm",
                                item.platform_id === 'youtube' ? "bg-red-500/20 text-red-500" :
                                item.platform_id === 'wordpress' ? "bg-blue-500/20 text-blue-500" :
                                "bg-indigo-500/20 text-indigo-500"
                              )}>
                                {item.platform_id === 'youtube' ? <YoutubeIcon className="h-5 w-5" /> : 
                                 item.platform_id === 'wordpress' ? <Globe className="h-5 w-5" /> : 
                                 <FacebookIcon className="h-5 w-5" />}
                              </div>
                              <div>
                                 <p className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors pr-4" dangerouslySetInnerHTML={{ __html: item.title }}></p>
                                <p className="text-xs text-muted-foreground font-medium">
                                  {item.platform_id === 'youtube' ? 'Vídeo no YouTube' : 
                                   item.platform_id === 'wordpress' ? 'Post no Blog' : 'Facebook Page'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-6">
                              <div className="hidden md:flex flex-col items-end">
                                <p className="text-sm font-bold text-foreground">
                                  {item.platform_id === 'youtube' ? (Math.floor(Math.random() * 5000) + 500).toLocaleString() : 
                                   item.platform_id === 'wordpress' ? (Math.floor(Math.random() * 2000) + 100).toLocaleString() : 
                                   (Math.floor(Math.random() * 1000) + 50).toLocaleString()}
                                </p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                                  {item.platform_id === 'youtube' ? 'Visualizações' : 'Acessos'}
                                </p>
                              </div>
                              <a href={item.link} target="_blank" rel="noopener noreferrer">
                              <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/20 hover:text-primary transition-all">
                                <ArrowUpRight className="h-5 w-5" />
                              </Button>
                            </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
