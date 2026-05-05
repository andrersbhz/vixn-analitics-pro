import DashboardLayout from "@/components/DashboardLayout";
import { AnalyticsCard } from "@/components/analytics/AnalyticsCard";
import { BarChart3, Target, ArrowUpRight, Megaphone, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const FacebookAds = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 rounded-xl">
            <Megaphone className="h-8 w-8 text-indigo-500" />
          </div>
          <div>
            <h1 className="text-3xl font-extralight text-foreground tracking-tight">Campanhas Facebook</h1>
            <p className="text-muted-foreground mt-1 font-light italic opacity-80">Análise de performance e insights de IA para seus anúncios.</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <AnalyticsCard title="Investimento Total">
            <div className="flex flex-col">
              <span className="text-3xl font-extralight text-foreground tracking-tight">R$ 12.450</span>
              <span className="text-emerald-500 text-[10px] font-light uppercase tracking-wider mt-1">+5.2% no período</span>
            </div>
          </AnalyticsCard>
          <AnalyticsCard title="Cliques">
            <div className="flex flex-col">
              <span className="text-3xl font-extralight text-foreground tracking-tight">8.420</span>
              <span className="text-emerald-500 text-[10px] font-light uppercase tracking-wider mt-1">+12.1% no período</span>
            </div>
          </AnalyticsCard>
          <AnalyticsCard title="CPA Médio">
            <div className="flex flex-col">
              <span className="text-3xl font-extralight text-foreground tracking-tight">R$ 1,48</span>
              <span className="text-emerald-500 text-[10px] font-light uppercase tracking-wider mt-1">-2.4% melhora</span>
            </div>
          </AnalyticsCard>
          <AnalyticsCard title="ROAS">
            <div className="flex flex-col">
              <span className="text-3xl font-extralight text-foreground tracking-tight">4.2x</span>
              <span className="text-emerald-500 text-[10px] font-light uppercase tracking-wider mt-1">Acima da meta</span>
            </div>
          </AnalyticsCard>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <AnalyticsCard title="Performance das Campanhas">
              <div className="space-y-6">
                {[
                  { name: "Black Friday 2024", spend: "R$ 4.200", cpa: "R$ 1.10", status: "Ativa", roas: "5.1x" },
                  { name: "Remarketing Site", spend: "R$ 1.800", cpa: "R$ 0.85", status: "Ativa", roas: "6.8x" },
                  { name: "Topo de Funil - Frio", spend: "R$ 6.450", cpa: "R$ 2.40", status: "Em Pausa", roas: "2.3x" },
                ].map((camp, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/5 transition-colors">
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">{camp.name}</span>
                      <span className="text-xs text-muted-foreground">Gasto: {camp.spend} | ROAS: {camp.roas}</span>
                    </div>
                    <div className="flex items-center gap-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-medium">CPA: {camp.cpa}</span>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${camp.status === 'Ativa' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>{camp.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </AnalyticsCard>
          </div>
          <div className="space-y-6">
            <AnalyticsCard title="Insights de IA para Performance">
              <div className="space-y-4">
                <div className="p-4 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                  <div className="flex gap-2 text-indigo-500 mb-2">
                    <Target className="h-5 w-5" />
                    <span className="font-semibold text-sm">Otimização de Público</span>
                  </div>
                  <p className="text-sm text-foreground">Sua campanha "Conversão - Vendas" está performando 32% melhor com o público 25-34 anos. Aumente o orçamento nesta segmentação para maximizar ROAS.</p>
                </div>
                <div className="p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                  <div className="flex gap-2 text-emerald-500 mb-2">
                    <Sparkles className="h-5 w-5" />
                    <span className="font-semibold text-sm">Criativo Vencedor</span>
                  </div>
                  <p className="text-sm text-foreground">O anúncio em vídeo superou o carrossel em engajamento. Recomendamos criar 3 variações do vídeo para escalar a escala.</p>
                </div>
                <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                  <div className="flex gap-2 text-amber-500 mb-2">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-semibold text-sm">Aviso de Saturação</span>
                  </div>
                  <p className="text-sm text-foreground">A frequência do anúncio "Oferta de Natal" atingiu 3.8. O CTR está caindo. Hora de trocar o criativo.</p>
                </div>
              </div>
            </AnalyticsCard>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FacebookAds;
