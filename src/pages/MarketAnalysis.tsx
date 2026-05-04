import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { AnalyticsCard } from "@/components/analytics/AnalyticsCard";
import { Search, Briefcase, TrendingUp, Users, Target, Rocket, Loader2, Sparkles, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useConnections } from "@/hooks/use-connections";

const MarketAnalysis = () => {
  const { connections } = useConnections();
  const isAnyConnected = connections.some(c => c.isConnected);

  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);

  const handleAnalyze = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setAnalyzed(true);
    }, 2000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/10 rounded-xl">
            <Globe className="h-8 w-8 text-purple-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Estudo de Mercado</h1>
            <p className="text-muted-foreground mt-1">Análise completa de nichos e empresas para estratégias vencedoras.</p>
          </div>
        </div>

        <AnalyticsCard title="Nova Pesquisa de Mercado">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Ex: Nicho de Pets de Luxo ou Nome da Empresa Concorrente" 
                className="pl-10 h-12 bg-accent/20 border-accent"
              />
            </div>
            <Button 
              className="h-12 px-8 bg-purple-600 hover:bg-purple-700 font-semibold"
              onClick={handleAnalyze}
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
              {loading ? "Analisando..." : "Solicitar Estudo Completo"}
            </Button>
          </div>
        </AnalyticsCard>

        {analyzed && !isAnyConnected && (
           <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-3">
             <AlertCircle className="h-5 w-5 text-amber-500" />
             <p className="text-sm text-amber-600 font-medium">
               Aviso: Nenhuma plataforma conectada. A análise está sendo feita com base em dados genéricos de mercado.
             </p>
           </div>
        )}

        {analyzed && (
          <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid gap-6 md:grid-cols-3">
              <AnalyticsCard title="Tamanho do Mercado">
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-foreground">R$ 4.2 Bi</span>
                  <span className="text-emerald-500 text-sm font-semibold mt-1">+12% crescimento anual</span>
                </div>
              </AnalyticsCard>
              <AnalyticsCard title="Competitividade">
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-foreground">Alta</span>
                  <span className="text-amber-500 text-sm font-semibold mt-1">Saturação em 65%</span>
                </div>
              </AnalyticsCard>
              <AnalyticsCard title="CAC Médio do Nicho">
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-foreground">R$ 45,20</span>
                  <span className="text-muted-foreground text-sm mt-1">Referência do mercado</span>
                </div>
              </AnalyticsCard>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <AnalyticsCard title="Análise Estratégica Completa">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold flex items-center gap-2 text-foreground mb-3">
                      <Target className="h-5 w-5 text-purple-500" /> Oportunidade Identificada
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Existe um gap significativo no atendimento personalizado para o público sênior dentro deste nicho. 
                      Os concorrentes focam em automação em massa, deixando espaço para uma marca premium baseada em confiança.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold flex items-center gap-2 text-foreground mb-3">
                      <TrendingUp className="h-5 w-5 text-purple-500" /> Tendências de Busca
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      O volume de busca por termos relacionados cresceu 45% nos últimos 3 meses, 
                      impulsionado por novas regulamentações e interesse em sustentabilidade.
                    </p>
                  </div>
                </div>
              </AnalyticsCard>

              <AnalyticsCard title="Plano de Ação para Performance">
                <div className="space-y-4">
                  <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <h5 className="font-bold text-sm text-purple-500 mb-1">Estratégia de Anúncios</h5>
                    <p className="text-xs text-foreground">Focar criativos em "Prova Social" e "Benefício Imediato". O público deste nicho decide por autoridade percebida.</p>
                  </div>
                  <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <h5 className="font-bold text-sm text-purple-500 mb-1">Canais Recomendados</h5>
                    <p className="text-xs text-foreground">Facebook Ads (Lookalike de Clientes) + Google Search (Fundo de Funil). Evitar TikTok no momento inicial.</p>
                  </div>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    Exportar Relatório PDF <Briefcase className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </AnalyticsCard>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MarketAnalysis;
