import DashboardLayout from "@/components/DashboardLayout";
import { AnalyticsCard } from "@/components/analytics/AnalyticsCard";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Cell } from 'recharts';
import { useConnections } from "@/hooks/use-connections";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Clock, 
  ThumbsUp, 
  MessageSquare, 
  Share2 
} from "lucide-react";

const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);


 const YouTubeStats = () => {
   const { getConnection, items, loading } = useConnections();
   const ytConn = getConnection('youtube');
   const ytVideos = items.filter(item => item.platform_id === 'youtube');

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
        <div className="flex items-center gap-3">
           <div className="p-3 bg-red-500/10 rounded-xl">
             <YoutubeIcon className="h-8 w-8 text-red-500" />
           </div>
           <div>
             <h1 className="text-3xl font-bold text-foreground">YouTube Stats</h1>
             <p className="text-muted-foreground mt-1">Análise detalhada do seu canal e vídeos.</p>
           </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            { label: "Taxa de Retenção", value: "64%", icon: Clock, color: "text-blue-600" },
            { label: "Engajamento", value: "12.4%", icon: ThumbsUp, color: "text-emerald-600" },
            { label: "Compartilhamentos", value: "842", icon: Share2, color: "text-purple-600" },
          ].map((stat, i) => (
             <div key={i} className="bg-card p-6 rounded-xl border flex items-center gap-4 shadow-sm">
               <div className="p-3 bg-accent/50 rounded-lg">
                 <stat.icon className={stat.color + " h-6 w-6"} />
               </div>
               <div>
                 <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                 <p className="text-2xl font-bold text-foreground">{stat.value}</p>
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

          <AnalyticsCard title="Sugestões de Crescimento">
            <div className="space-y-4">
              {[
                "Otimize os títulos dos seus 3 últimos vídeos para aumentar o CTR.",
                "Crie uma nova playlist para o conteúdo de 'Tutoriais'.",
                "Responda aos comentários mais curtidos do vídeo mais recente.",
                "Analise o pico de retenção aos 2:15 do último vídeo."
              ].map((tip, i) => (
               <div key={i} className="flex gap-3 p-3 bg-accent/50 rounded-lg border border-border">
                 <TrendingUp className="h-5 w-5 text-primary shrink-0" />
                 <p className="text-sm text-foreground">{tip}</p>
               </div>
              ))}
            </div>
          </AnalyticsCard>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default YouTubeStats;
