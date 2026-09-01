import DashboardLayout from "@/components/DashboardLayout";
import ContactsOverview from "@/components/ContactsOverview";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell } from 'recharts';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { useState, useEffect, useCallback } from "react";
import { useConnections, Connection } from "@/hooks/use-connections";
import { supabase } from "@/integrations/supabase/client";
import { fetchWordPressData, WordPressStats } from "@/lib/wordpress";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Users, 
  Eye, 
  MousePointer2, 
  Globe, 
   DollarSign,
   FileText,
   TrendingUp,
   Activity,
   Target,
   Zap,
   BarChart3,
   Clock,
   Percent,
   PlayCircle
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

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";

const StatsCard = ({ title, value, change, trend, icon: Icon, accent = "primary" }: any) => (
  <Card className="glass-card border-white/5 hover:border-primary/20 transition-all duration-300 group">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-[11px] font-light uppercase tracking-widest text-muted-foreground">{title}</CardTitle>
      <div className={cn(
        "p-2 rounded-full border transition-all group-hover:scale-110",
        accent === "red" && "bg-red-500/5 border-red-500/20 text-red-400",
        accent === "blue" && "bg-blue-500/5 border-blue-500/20 text-blue-400",
        accent === "amber" && "bg-amber-500/5 border-amber-500/20 text-amber-400",
        accent === "emerald" && "bg-emerald-500/5 border-emerald-500/20 text-emerald-400",
        accent === "indigo" && "bg-indigo-500/5 border-indigo-500/20 text-indigo-400",
        accent === "primary" && "bg-primary/5 border-primary/10 text-primary",
      )}>
        <Icon className="h-4 w-4" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-extralight tracking-tight">{value}</div>
      {change && (
        <div className={cn(
          "text-[10px] mt-2 flex items-center px-2 py-0.5 rounded-full w-fit font-light tracking-wide",
          trend === "up" ? "bg-emerald-500/5 text-emerald-500/80 border border-emerald-500/10" :
          trend === "down" ? "bg-rose-500/5 text-rose-500/80 border border-rose-500/10" :
          "bg-white/5 text-muted-foreground border border-white/10"
        )}>
          {trend === "up" ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : trend === "down" ? <ArrowDownRight className="h-3 w-3 mr-0.5" /> : null}
          {change}
        </div>
      )}
    </CardContent>
  </Card>
);

const PlatformBlock = ({ title, icon: Icon, accent, isConnected, children, href }: any) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={cn(
          "p-2.5 rounded-xl border",
          accent === "red" && "bg-red-500/10 border-red-500/20 text-red-400",
          accent === "blue" && "bg-blue-500/10 border-blue-500/20 text-blue-400",
          accent === "amber" && "bg-amber-500/10 border-amber-500/20 text-amber-400",
          accent === "indigo" && "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
        )}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-light tracking-tight">{title}</h2>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            {isConnected ? "Conectado • Dados em tempo real" : "Não conectado"}
          </p>
        </div>
      </div>
      {href && (
        <Link to={href}>
          <Button variant="ghost" size="sm" className="text-xs font-light gap-1 hover:text-primary">
            Ver detalhes <ArrowUpRight className="h-3 w-3" />
          </Button>
        </Link>
      )}
    </div>
    {isConnected ? children : (
      <Card className="glass-card border-dashed border-white/10">
        <CardContent className="py-10 text-center">
          <p className="text-sm text-muted-foreground font-light">Conecte esta plataforma para visualizar métricas.</p>
          <Link to="/settings"><Button variant="ghost" size="sm" className="mt-3 text-xs">Configurar</Button></Link>
        </CardContent>
      </Card>
    )}
  </div>
);

const Index = () => {
   const { connections, getConnection, items, loading, updateConnection } = useConnections();
   const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
   const [projectName, setProjectName] = useState("");
   const [projectPlatform, setProjectPlatform] = useState("");
   const [platformId, setPlatformId] = useState("");
   const [isCreating, setIsCreating] = useState(false);

   const handleCreateProject = async () => {
     if (!projectName || !projectPlatform || !platformId) {
       toast.error("Por favor, preencha todos os campos.");
       return;
     }

     setIsCreating(true);
     try {
       await updateConnection(projectPlatform, { id: platformId }, true);

        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          await supabase.from('projects').insert({
            user_id: userData.user.id,
            name: projectName,
            platform: projectPlatform,
            external_id: platformId,
          });
        }

        toast.success(`Projeto "${projectName}" salvo com sucesso!`);
       setIsNewProjectOpen(false);
       setProjectName("");
       setProjectPlatform("");
       setPlatformId("");
     } catch (error) {
       toast.error("Erro ao configurar projeto.");
     } finally {
       setIsCreating(false);
     }
   };

   const wpConn = getConnection('wordpress');
   const ytConn = getConnection('youtube');
   const fbConn = getConnection('facebook');
   const adsenseConn = getConnection('adsense');
 
   const ytItems = items.filter(i => i.platform_id === 'youtube');
   const wpItems = items.filter(i => i.platform_id === 'wordpress');
   const fbItems = items.filter(i => i.platform_id === 'facebook');
   const adsenseItems = items.filter(i => i.platform_id === 'adsense');

   const sum = (arr: any[], key: string) => arr.reduce((a, c) => a + (Number(c[key]) || 0), 0);
   const avg = (arr: any[], key: string) => arr.length ? sum(arr, key) / arr.length : 0;
   const fmt = (n: number) => n.toLocaleString('pt-BR');
   const fmtBRL = (n: number) => `R$ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
   const fmtUSD = (n: number) => `$ ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
   // Approximate USD → BRL conversion rate (AdSense reporta em USD)
   const USD_BRL = 5.4;
   const EarningsValue = ({ usd }: { usd: number }) => (
     <div className="flex flex-col">
       <span>{fmtUSD(usd)}</span>
       <span className="text-[10px] font-light text-muted-foreground mt-0.5">≈ {fmtBRL(usd * USD_BRL)}</span>
     </div>
   );

   // YouTube metrics
   const ytViews = sum(ytItems, 'views');
   const ytEngagement = avg(ytItems, 'engagement_rate');
   const ytAvgViews = ytItems.length ? ytViews / ytItems.length : 0;
   const ytTopVideos = [...ytItems].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);

   // WordPress metrics
   const wpViews = sum(wpItems, 'views');
   const wpAvgViews = wpItems.length ? wpViews / wpItems.length : 0;

   // AdSense metrics
   const adsEarnings = sum(adsenseItems, 'earnings');
   const adsClicks = sum(adsenseItems, 'clicks');
   const adsImpressions = sum(adsenseItems, 'impressions');
   const adsCTR = avg(adsenseItems, 'ctr');
   const adsRPM = avg(adsenseItems, 'rpm');
   const adsLast30 = [...adsenseItems]
     .sort((a, b) => (a.external_id > b.external_id ? 1 : -1))
     .slice(-30)
     .map(i => ({ name: i.external_id?.slice(5) || '', earnings: Number(i.earnings) || 0, clicks: Number(i.clicks) || 0 }));

   // Facebook metrics
   const fbImpressions = sum(fbItems, 'impressions');
   const fbClicks = sum(fbItems, 'clicks');
   const fbCTR = avg(fbItems, 'ctr');

   // Global totals
   const totalViews = sum(items, 'views');
   const totalImpressions = sum(items, 'impressions');
   const totalClicks = sum(items, 'clicks');
   const totalContent = ytItems.length + wpItems.length;

   // Content-mix distribution
   const platformMix = [
     { name: 'YouTube', value: ytItems.length, color: '#EF4444' },
     { name: 'Blog', value: wpItems.length, color: '#3B82F6' },
     { name: 'AdSense', value: adsenseItems.length, color: '#F59E0B' },
     { name: 'Facebook', value: fbItems.length, color: '#6366F1' },
   ].filter(p => p.value > 0);

  const isAnyConnected = connections.some(c => c.isConnected);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between relative">
          <div>
            <h1 className="text-4xl font-extralight text-foreground tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-2 text-lg font-light italic opacity-80">Visão geral do seu crescimento em todas as plataformas.</p>
          </div>
          <Button 
            onClick={() => setIsNewProjectOpen(true)}
            className="gap-2 bg-primary/20 text-primary hover:bg-primary/30 border border-primary/20 rounded-xl px-6"
          >
            <Plus className="h-4 w-4" />
            Novo Projeto
          </Button>
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
            {/* GLOBAL OVERVIEW */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-px flex-1 bg-gradient-to-r from-primary/40 to-transparent" />
                <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-light">Visão Geral</span>
                <div className="h-px flex-1 bg-gradient-to-l from-primary/40 to-transparent" />
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard title="Receita AdSense" value={adsenseConn?.isConnected ? <EarningsValue usd={adsEarnings} /> : "---"} change={adsenseConn?.isConnected ? `${adsenseItems.length} dias` : "Desconectado"} trend={adsenseConn?.isConnected ? "up" : "neutral"} icon={DollarSign} accent="amber" />
                <StatsCard title="Visualizações Totais" value={fmt(totalViews)} change={`${totalContent} conteúdos`} trend="up" icon={Eye} accent="primary" />
                <StatsCard title="Impressões" value={fmt(totalImpressions)} change={`${fmt(totalClicks)} cliques`} trend="up" icon={Target} accent="indigo" />
                <StatsCard title="Plataformas Ativas" value={connections.filter(c => c.isConnected).length} change={`de ${connections.length} disponíveis`} trend="neutral" icon={Zap} accent="emerald" />
              </div>
            </div>

            {/* YOUTUBE BLOCK */}
            <PlatformBlock title="YouTube" icon={YoutubeIcon} accent="red" isConnected={!!ytConn?.isConnected} href="/youtube">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard title="Inscritos" value={ytConn?.cached_data?.subscribers ? fmt(ytConn.cached_data.subscribers) : (ytConn?.cached_data?.subscribers_text || '---')} icon={Users} accent="red" />
                <StatsCard title="Vídeos" value={fmt(ytItems.length)} icon={PlayCircle} accent="red" />
                <StatsCard title="Views Totais" value={fmt(ytViews)} icon={Eye} accent="red" />
                <StatsCard title="Média por Vídeo" value={fmt(Math.round(ytAvgViews))} icon={BarChart3} accent="red" />
              </div>
              {ytTopVideos.length > 0 && (
                <Card className="glass-card border-white/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-light uppercase tracking-widest text-muted-foreground">Top 5 vídeos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {ytTopVideos.map((v, i) => (
                        <a key={v.id} href={v.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group">
                          <span className="text-xs font-light text-muted-foreground w-5">{String(i + 1).padStart(2, '0')}</span>
                          <p className="flex-1 text-sm font-light line-clamp-1 group-hover:text-primary transition-colors" dangerouslySetInnerHTML={{ __html: v.title }} />
                          <span className="text-xs text-muted-foreground tabular-nums">{fmt(v.views || 0)} views</span>
                        </a>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </PlatformBlock>

            {/* BLOG BLOCK */}
            <PlatformBlock title="Blog / WordPress" icon={Globe} accent="blue" isConnected={!!wpConn?.isConnected} href="/blog">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard title="Posts" value={fmt(wpItems.length)} icon={FileText} accent="blue" />
                <StatsCard title="Views Totais" value={fmt(wpViews)} icon={Eye} accent="blue" />
                <StatsCard title="Média por Post" value={fmt(Math.round(wpAvgViews))} icon={BarChart3} accent="blue" />
                <StatsCard title="Últ. Publicação" value={wpItems[0] ? new Date(wpItems[0].created_at).toLocaleDateString('pt-BR') : "---"} icon={Clock} accent="blue" />
              </div>
            </PlatformBlock>

            {/* ADSENSE BLOCK */}
            <PlatformBlock title="Google AdSense" icon={DollarSign} accent="amber" isConnected={!!adsenseConn?.isConnected} href="/adsense">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard title="Ganhos" value={<EarningsValue usd={adsEarnings} />} icon={DollarSign} accent="amber" />
                <StatsCard title="Cliques" value={fmt(adsClicks)} icon={MousePointer2} accent="amber" />
                <StatsCard title="Impressões" value={fmt(adsImpressions)} icon={Eye} accent="amber" />
                <StatsCard title="CTR / RPM" value={`${adsCTR.toFixed(2)}% • ${adsRPM.toFixed(2)}`} icon={Percent} accent="amber" />
              </div>
              {adsLast30.length > 0 && (
                <Card className="glass-card border-white/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-light uppercase tracking-widest text-muted-foreground">Ganhos — últimos {adsLast30.length} dias</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={adsLast30}>
                        <defs>
                          <linearGradient id="colorAds" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                        <Area type="monotone" dataKey="earnings" stroke="#F59E0B" strokeWidth={2} fill="url(#colorAds)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </PlatformBlock>

            {/* FACEBOOK BLOCK */}
            <PlatformBlock title="Facebook Ads" icon={FacebookIcon} accent="indigo" isConnected={!!fbConn?.isConnected} href="/facebook-ads">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard title="Campanhas" value={fmt(fbItems.length)} icon={Target} accent="indigo" />
                <StatsCard title="Impressões" value={fmt(fbImpressions)} icon={Eye} accent="indigo" />
                <StatsCard title="Cliques" value={fmt(fbClicks)} icon={MousePointer2} accent="indigo" />
                <StatsCard title="CTR" value={`${fbCTR.toFixed(2)}%`} icon={Percent} accent="indigo" />
              </div>
            </PlatformBlock>

            {/* RECENT ACTIVITY */}
            <Card className="glass-card border-white/5">
              <CardHeader>
                <CardTitle className="text-lg font-light tracking-tight">Atividades Recentes</CardTitle>
                <CardDescription className="font-light">Últimos itens sincronizados de todas as plataformas.</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="py-8 text-center text-muted-foreground font-light">Carregando...</div>
                ) : items.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground font-light">
                    Nenhuma atividade sincronizada.
                    <Link to="/settings" className="text-primary ml-1 hover:underline">Configurar</Link>
                  </div>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2">
                    {items.slice(0, 8).map((item) => (
                      <a key={item.id} href={item.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group">
                        <div className={cn(
                          "p-2 rounded-lg shrink-0",
                          item.platform_id === 'youtube' ? "bg-red-500/10 text-red-400" :
                          item.platform_id === 'wordpress' ? "bg-blue-500/10 text-blue-400" :
                          item.platform_id === 'adsense' ? "bg-amber-500/10 text-amber-400" :
                          "bg-indigo-500/10 text-indigo-400"
                        )}>
                          {item.platform_id === 'youtube' ? <YoutubeIcon className="h-4 w-4" /> :
                           item.platform_id === 'wordpress' ? <Globe className="h-4 w-4" /> :
                           item.platform_id === 'adsense' ? <DollarSign className="h-4 w-4" /> :
                           <FacebookIcon className="h-4 w-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-light line-clamp-1 group-hover:text-primary transition-colors" dangerouslySetInnerHTML={{ __html: item.title }} />
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                            {fmt(item.views || 0)} views {item.earnings ? `• ${fmtBRL(Number(item.earnings))}` : ''}
                          </p>
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                      </a>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        <ContactsOverview />
      </div>

      <Dialog open={isNewProjectOpen} onOpenChange={setIsNewProjectOpen}>
        <DialogContent className="glass-card border-white/10 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-light tracking-tight">Criar Novo Projeto</DialogTitle>
            <DialogDescription className="font-light">
              Adicione uma nova fonte de dados para monitorar sua performance.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-xs font-light uppercase tracking-widest text-muted-foreground">Nome do Projeto</Label>
              <Input
                id="name"
                placeholder="Ex: Meu Canal Principal"
                className="bg-white/5 border-white/10 focus:border-primary/50 transition-all rounded-xl"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="platform" className="text-xs font-light uppercase tracking-widest text-muted-foreground">Plataforma</Label>
              <Select onValueChange={setProjectPlatform} value={projectPlatform}>
                <SelectTrigger className="bg-white/5 border-white/10 focus:border-primary/50 transition-all rounded-xl">
                  <SelectValue placeholder="Selecione a plataforma" />
                </SelectTrigger>
                <SelectContent className="glass-card border-white/10">
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="wordpress">Blog (WordPress)</SelectItem>
                  <SelectItem value="facebook">Facebook Ads</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="platformId" className="text-xs font-light uppercase tracking-widest text-muted-foreground">ID da Plataforma</Label>
              <Input
                id="platformId"
                placeholder="ID do Canal ou URL do Site"
                className="bg-white/5 border-white/10 focus:border-primary/50 transition-all rounded-xl"
                value={platformId}
                onChange={(e) => setPlatformId(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              onClick={handleCreateProject} 
              disabled={isCreating}
              className="w-full rounded-xl bg-primary hover:bg-primary/90 transition-all"
            >
              {isCreating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Criar Projeto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Index;
