import DashboardLayout from "@/components/DashboardLayout";
import { AnalyticsCard } from "@/components/analytics/AnalyticsCard";
import { 
  TrendingUp, 
  CheckCircle2, 
  Circle, 
   Target, 
   Zap,
   ArrowRight,
   Youtube
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { useConnections } from "@/hooks/use-connections";
import { Link } from "react-router-dom";

const Strategy = () => {
  const { getConnection } = useConnections();
  const wpConn = getConnection('wordpress');
  const ytConn = getConnection('youtube');
  const fbConn = getConnection('facebook');
  const isAnyConnected = [wpConn, ytConn, fbConn].some(c => c?.isConnected);

  if (!isAnyConnected) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
          <div className="p-4 bg-emerald-500/10 rounded-full">
            <TrendingUp className="h-12 w-12 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold">Estratégia requer dados</h2>
          <p className="text-muted-foreground max-w-md">
            Conecte suas plataformas para que a IA possa gerar um roadmap real baseado na sua performance atual.
          </p>
          <Link to="/settings">
            <Button>Conectar Agora</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-emerald-500/10 rounded-xl">
               <TrendingUp className="h-8 w-8 text-emerald-500" />
             </div>
             <div>
               <h1 className="text-3xl font-bold text-foreground">Estratégia de Crescimento</h1>
               <p className="text-muted-foreground mt-1">Seu roadmap personalizado para dominar o mercado.</p>
             </div>
          </div>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            Gerar Nova Estratégia <Zap className="ml-2 h-4 w-4 fill-white" />
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <AnalyticsCard title="Objetivos Ativos">
              <div className="space-y-6">
                {[
                  { title: "Alcançar 15k inscritos no YouTube", progress: 82, current: "12,245", target: "15,000", deadline: "30 dias" },
                  { title: "Aumentar tráfego orgânico do blog em 20%", progress: 45, current: "1,240", target: "1,500", deadline: "15 dias" },
                  { title: "Melhorar engajamento no Facebook", progress: 60, current: "8.2k", target: "10k", deadline: "20 dias" },
                ].map((goal, i) => (
                  <div key={i} className="space-y-3">
                    <div className="flex justify-between items-center">
                       <h4 className="font-semibold text-foreground">{goal.title}</h4>
                       <span className="text-xs font-medium bg-muted px-2 py-1 rounded text-muted-foreground">Faltam {goal.deadline}</span>
                     </div>
                     <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 transition-all duration-1000" 
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                     <div className="flex justify-between text-xs text-muted-foreground">
                       <span>Atual: {goal.current}</span>
                       <span>Meta: {goal.target}</span>
                     </div>
                  </div>
                ))}
              </div>
            </AnalyticsCard>

            <AnalyticsCard title="Plano de Ação Semanal">
              <div className="space-y-4">
                {[
                  { text: "Publicar 2 vídeos de 'How-to' no canal principal", done: true },
                  { text: "Otimizar as meta-tags dos posts mais antigos do blog", done: true },
                  { text: "Criar sequência de 5 posts para o Facebook focado em leads", done: false },
                  { text: "Analisar as métricas de retenção da última semana", done: false },
                  { text: "Configurar automação de newsletter para novos inscritos", done: false },
                ].map((item, i) => (
                   <div key={i} className="flex items-center gap-3 p-3 hover:bg-accent/50 rounded-lg transition-colors cursor-pointer group">
                    {item.done ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                    ) : (
                       <Circle className="h-5 w-5 text-muted-foreground/30 shrink-0 group-hover:text-primary transition-colors" />
                     )}
                     <span className={item.done ? "text-muted-foreground/50 line-through text-sm" : "text-foreground text-sm font-medium"}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </AnalyticsCard>
          </div>

          <div className="space-y-6">
             <AnalyticsCard title="Insights da GrowthSuite" className="bg-slate-900 dark:bg-slate-950 border-slate-800 text-white">
               <div className="space-y-6">
                <div className="flex gap-4">
                  <Target className="h-8 w-8 text-emerald-400 shrink-0" />
                  <div>
                    <p className="font-semibold text-emerald-400">Oportunidade SEO</p>
                    <p className="text-sm text-slate-300 mt-1">Detectamos uma baixa competição para a palavra-chave "Marketing para SaaS". Você deve criar um post sobre isso.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Youtube className="h-8 w-8 text-red-400 shrink-0" />
                  <div>
                    <p className="font-semibold text-red-400">Padrão Identificado</p>
                    <p className="text-sm text-slate-300 mt-1">Seus vídeos com duração entre 8-12 minutos têm 40% mais retenção do que os vídeos mais longos.</p>
                  </div>
                </div>
                <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white border-slate-700">
                  Ver Todos os Insights <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </AnalyticsCard>

            <AnalyticsCard title="Rank de Nicho">
              <div className="flex flex-col items-center py-4">
                <div className="relative h-32 w-32 flex items-center justify-center">
                   <svg className="h-full w-full rotate-[-90deg]">
                     <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-muted/30" />
                     <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray="364.4" strokeDashoffset="91.1" className="text-primary" />
                   </svg>
                   <div className="absolute flex flex-col items-center">
                     <span className="text-3xl font-bold text-foreground">#4</span>
                     <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">No Nicho</span>
                   </div>
                 </div>
                 <p className="text-sm text-muted-foreground text-center mt-6">
                   Você está entre os **5% canais que mais crescem** no segmento de Marketing Digital.
                 </p>
              </div>
            </AnalyticsCard>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Strategy;
