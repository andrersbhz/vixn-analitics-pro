import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { AnalyticsCard } from "@/components/analytics/AnalyticsCard";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Cell } from 'recharts';
import { useConnections } from "@/hooks/use-connections";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  TrendingUp, 
  Clock, 
  ThumbsUp, 
  MessageSquare, 
   Share2,
   RefreshCw,
   Loader2,
   ChevronDown
 } from "lucide-react";
 import {
   Accordion,
   AccordionContent,
   AccordionItem,
   AccordionTrigger,
 } from "@/components/ui/accordion";

const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);


  const YouTubeStats = () => {
    const { getConnection, items, loading, testSync } = useConnections();
   const ytConn = getConnection('youtube');
   const ytVideos = items.filter(item => item.platform_id === 'youtube');
    const [syncing, setSyncing] = useState(false);

    const handleSync = async () => {
      if (syncing) return;
      setSyncing(true);
      const result = await testSync('youtube');
      setSyncing(false);
      if (result.success) {
        toast.success(result.log);
      } else {
        toast.error(result.log);
      }
    };

    // Auto-sync if connected but no videos
    useEffect(() => {
      if (ytConn?.isConnected && ytVideos.length === 0 && !loading && !syncing) {
        handleSync();
      }
    }, [ytConn?.isConnected, ytVideos.length, loading]);

  if (!ytConn?.isConnected) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="p-4 bg-red-500/10 rounded-full">
            <YoutubeIcon className="h-12 w-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold">YouTube não conectado</h2>
          <p className="text-muted-foreground text-center max-w-md">
            Insira o ID do seu canal nas configurações para sincronizar seus dados reais.
          </p>
          <Link to="/settings">
            <Button>Configurar Canal</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-red-500/10 rounded-xl">
               <YoutubeIcon className="h-8 w-8 text-red-500" />
             </div>
             <div>
               <h1 className="text-3xl font-extralight text-foreground tracking-tight">YouTube Stats</h1>
               <p className="text-muted-foreground mt-1 font-light italic opacity-80">Análise detalhada do seu canal e vídeos.</p>
             </div>
          </div>
          <Button 
            variant="outline" 
            className="gap-2 border-red-500/20 hover:bg-red-500/10 glass-card"
            onClick={handleSync}
            disabled={syncing}
          >
            {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {syncing ? "Sincronizando..." : "Sincronizar Agora"}
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            { label: "Taxa de Retenção", value: "64%", icon: Clock, color: "text-blue-600" },
            { label: "Engajamento", value: "12.4%", icon: ThumbsUp, color: "text-emerald-600" },
            { label: "Compartilhamentos", value: "842", icon: Share2, color: "text-purple-600" },
          ].map((stat, i) => (
             <div key={i} className="glass-card p-6 flex items-center gap-4">
               <div className="p-3 bg-accent/30 rounded-full border border-white/10">
                 <stat.icon className={stat.color + " h-6 w-6"} />
               </div>
               <div>
                 <p className="text-[10px] font-light uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                 <p className="text-2xl font-extralight text-foreground">{stat.value}</p>
               </div>
             </div>
          ))}
        </div>

         <div className="grid gap-6 lg:grid-cols-1">
           <AnalyticsCard title="Vídeos Sincronizados">
             {loading ? (
               <div className="py-8 text-center text-muted-foreground">Carregando vídeos...</div>
             ) : ytVideos.length === 0 ? (
               <div className="py-12 text-center text-muted-foreground">
                 Nenhum vídeo sincronizado ainda. Clique em sincronizar nas configurações.
               </div>
             ) : (
               <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                 {ytVideos.map((video) => (
                   <div key={video.id} className="p-4 border rounded-xl hover:bg-accent/30 transition-all flex flex-col gap-3">
                     <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                        <YoutubeIcon className="h-8 w-8 text-red-500/20" />
                     </div>
                     <div>
                       <h3 className="font-medium text-foreground line-clamp-2 min-h-[3rem]">{video.title}</h3>
                       <p className="text-xs text-muted-foreground mt-2">
                         Sincronizado em: {new Date(video.created_at).toLocaleDateString('pt-BR')}
                       </p>
                     </div>
                     <a href={video.link} target="_blank" rel="noopener noreferrer" className="mt-auto">
                       <Button variant="outline" size="sm" className="w-full">Ver no YouTube</Button>
                     </a>
                   </div>
                 ))}
               </div>
             )}
           </AnalyticsCard>

           <div className="glass-card p-0 overflow-hidden">
             <Accordion type="single" collapsible className="w-full">
               <AccordionItem value="suggestions" className="border-none">
                 <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-white/5 transition-colors">
                   <div className="flex items-center gap-2">
                     <TrendingUp className="h-5 w-5 text-red-500" />
                     <span className="text-lg font-light tracking-tight">Sugestões de Crescimento</span>
                   </div>
                 </AccordionTrigger>
                 <AccordionContent className="px-6 pb-6 pt-2">
                   <div className="space-y-4">
                     {[
                       {
                         title: "Otimização de CTR",
                         description: "Otimize os títulos e miniaturas dos seus 3 últimos vídeos para aumentar o CTR. Títulos com perguntas tendem a performar 15% melhor."
                       },
                       {
                         title: "Organização de Conteúdo",
                         description: "Crie uma nova playlist para o conteúdo de 'Tutoriais'. Isso aumenta o tempo de sessão do usuário no seu canal."
                       },
                       {
                         title: "Engajamento com Comunidade",
                         description: "Responda aos comentários mais curtidos do vídeo mais recente. Isso sinaliza ao algoritmo que seu canal é ativo."
                       },
                       {
                         title: "Retenção de Audiência",
                         description: "Analise o pico de retenção aos 2:15 do último vídeo. Tente replicar o elemento visual ou tópico abordado nesse momento."
                       }
                     ].map((suggestion, i) => (
                       <div key={i} className="flex flex-col gap-1 p-3 bg-accent/30 rounded-lg border border-white/5">
                         <h4 className="text-sm font-medium text-foreground/90">{suggestion.title}</h4>
                         <p className="text-foreground/70 leading-relaxed font-light" style={{ fontSize: '0.9rem' }}>
                           {suggestion.description}
                         </p>
                       </div>
                     ))}
                   </div>
                 </AccordionContent>
               </AccordionItem>
             </Accordion>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default YouTubeStats;
