import DashboardLayout from "@/components/DashboardLayout";
import { AnalyticsCard } from "@/components/analytics/AnalyticsCard";
import { 
  Facebook, 
  Users, 
  MessageCircle, 
  Share2, 
  Heart,
  BarChart2
} from "lucide-react";

const FacebookPages = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center gap-3">
           <div className="p-3 bg-indigo-500/10 rounded-xl">
             <Facebook className="h-8 w-8 text-indigo-500" />
           </div>
           <div>
             <h1 className="text-3xl font-bold text-foreground">Facebook Pages</h1>
             <p className="text-muted-foreground mt-1">Gerencie e analise o engajamento de suas páginas.</p>
           </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
           <AnalyticsCard title="Alcance da Página">
             <div className="flex items-end gap-2">
               <span className="text-4xl font-bold text-foreground">24.5k</span>
               <span className="text-emerald-500 text-sm font-semibold mb-1">+15.2%</span>
             </div>
             <p className="text-muted-foreground text-sm mt-2">Pessoas alcançadas nos últimos 28 dias.</p>
           </AnalyticsCard>
 
           <AnalyticsCard title="Engajamento Total">
             <div className="flex items-end gap-2">
               <span className="text-4xl font-bold text-foreground">8.2k</span>
               <span className="text-emerald-500 text-sm font-semibold mb-1">+8.4%</span>
             </div>
             <p className="text-muted-foreground text-sm mt-2">Reações, comentários e compartilhamentos.</p>
           </AnalyticsCard>
 
           <AnalyticsCard title="Novos Seguidores">
             <div className="flex items-end gap-2">
               <span className="text-4xl font-bold text-foreground">452</span>
               <span className="text-rose-500 text-sm font-semibold mb-1">-2.1%</span>
             </div>
             <p className="text-muted-foreground text-sm mt-2">Seguidores líquidos ganhos recentemente.</p>
           </AnalyticsCard>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <AnalyticsCard title="Postagens de Maior Sucesso">
            <div className="space-y-6">
              {[
                { text: "10 ferramentas indispensáveis para marketing digital...", reach: "12.4k", eng: "1.2k", icon: Heart },
                { text: "Guia completo: Como configurar seu primeiro blog...", reach: "8.1k", eng: "840", icon: Share2 },
                { text: "O segredo para um canal de sucesso no YouTube...", reach: "5.6k", eng: "520", icon: MessageCircle },
              ].map((post, i) => (
                <div key={i} className="flex gap-4 items-start pb-4 border-b last:border-0 last:pb-0">
                   <div className="h-12 w-12 rounded bg-accent/50 flex items-center justify-center shrink-0">
                     <BarChart2 className="h-6 w-6 text-muted-foreground" />
                   </div>
                   <div className="flex-1 min-w-0">
                     <p className="text-sm font-medium text-foreground line-clamp-2">{post.text}</p>
                     <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                       <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {post.reach} alcance</span>
                       <span className="flex items-center gap-1"><post.icon className="h-3 w-3" /> {post.eng} engajamento</span>
                     </div>
                   </div>
                </div>
              ))}
            </div>
          </AnalyticsCard>

          <AnalyticsCard title="Melhor Horário para Postar">
             <div className="h-[200px] flex items-center justify-center border-2 border-dashed border-muted rounded-lg text-muted-foreground bg-accent/5">
               Mapa de Calor de Engajamento por Hora
             </div>
             <div className="mt-6 p-4 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
               <p className="text-sm text-indigo-500 font-medium">Insights da IA:</p>
               <p className="text-sm text-indigo-400 mt-1">Seu maior engajamento ocorre às **Terças-feiras entre 19:00 e 21:00**. Considere agendar conteúdos importantes para este período.</p>
             </div>
          </AnalyticsCard>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FacebookPages;
