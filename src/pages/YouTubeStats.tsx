import DashboardLayout from "@/components/DashboardLayout";
import { AnalyticsCard } from "@/components/analytics/AnalyticsCard";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Cell } from 'recharts';
import { 
  Youtube, 
  TrendingUp, 
  Clock, 
  ThumbsUp, 
  MessageSquare, 
  Share2 
} from "lucide-react";

const YouTubeStats = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center gap-3">
           <div className="p-3 bg-red-500/10 rounded-xl">
             <Youtube className="h-8 w-8 text-red-500" />
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

        <div className="grid gap-6 lg:grid-cols-3">
          <AnalyticsCard title="Retenção por Vídeo" className="lg:col-span-2">
            <div className="h-[300px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Vídeo A', retention: 75 },
                  { name: 'Vídeo B', retention: 62 },
                  { name: 'Vídeo C', retention: 88 },
                  { name: 'Vídeo D', retention: 54 },
                  { name: 'Vídeo E', retention: 68 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} />
                  <RechartsTooltip cursor={{fill: 'hsl(var(--accent)/0.5)'}} contentStyle={{backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px'}} />
                  <Bar dataKey="retention" radius={[4, 4, 0, 0]}>
                    {[0, 1, 2, 3, 4].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 2 ? 'hsl(var(--primary))' : 'hsl(var(--primary)/0.6)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </AnalyticsCard>

          <AnalyticsCard title="Vídeos Mais Populares">
            <div className="space-y-5">
              {[
                { title: "Como crescer no YouTube em 2024", views: "45.2k", watchTime: "2.1k hrs", ctr: "12.4%" },
                { title: "Review: Melhores Câmeras para Vlogs", views: "32.1k", watchTime: "1.8k hrs", ctr: "9.2%" },
                { title: "Setup de Iluminação Barato", views: "28.5k", watchTime: "1.4k hrs", ctr: "8.7%" },
              ].map((video, i) => (
                <div key={i} className="flex items-center justify-between group cursor-pointer border-b pb-4 last:border-0 last:pb-0">
                   <div className="flex-1 min-w-0">
                     <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">{video.title}</p>
                     <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                       <span>{video.views} visualizações</span>
                       <span>{video.watchTime} tempo de exibição</span>
                     </div>
                   </div>
                   <div className="text-right">
                     <p className="text-sm font-semibold text-emerald-500">{video.ctr} CTR</p>
                   </div>
                </div>
              ))}
            </div>
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
