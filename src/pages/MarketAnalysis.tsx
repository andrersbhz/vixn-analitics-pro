import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { AnalyticsCard } from "@/components/analytics/AnalyticsCard";
import { Search, Briefcase, TrendingUp, Users, Target, Rocket, Loader2, Sparkles, Globe, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useConnections } from "@/hooks/use-connections";

const MarketAnalysis = () => {
  const { connections } = useConnections();
  const isAnyConnected = connections.some(c => c.isConnected);

  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [query, setQuery] = useState("");
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { 
          prompt: `Realize uma análise de mercado detalhada para: ${query}. 
          Retorne um JSON com os seguintes campos:
          marketSize (string), competitiveness (string), avgCac (string),
          opportunity (string), trends (string), adsStrategy (string), channels (string).
          Responda apenas o JSON puro, sem markdown.`,
          model: 'gemini'
        }
      });

      if (error) throw error;
      
      // Try to parse JSON from AI response
      let result;
      try {
        result = JSON.parse(data.text.replace(/```json|```/g, ''));
      } catch (e) {
        result = {
          marketSize: "Análise concluída",
          competitiveness: "Alta",
          avgCac: "Variável",
          opportunity: data.text.substring(0, 200),
          trends: "Crescimento constante",
          adsStrategy: "Focar em autoridade",
          channels: "Google e Facebook"
        };
      }
      
      setAnalysisResult(result);
      setAnalyzed(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/10 rounded-xl">
            <Globe className="h-8 w-8 text-purple-500" />
          </div>
          <div>
            <h1 className="text-3xl font-extralight text-foreground tracking-tight">Estudo de Mercado</h1>
            <p className="text-muted-foreground mt-1 font-light italic opacity-80">Análise completa de nichos e empresas para estratégias vencedoras.</p>
          </div>
        </div>

        <AnalyticsCard title="Nova Pesquisa de Mercado">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Ex: Nicho de Pets de Luxo ou Nome da Empresa Concorrente" 
                className="pl-10 h-12 bg-accent/20 border-accent"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
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
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-5 rounded-2xl bg-background/40 backdrop-blur-xl border border-white/10 shadow-glass flex flex-col gap-2">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-purple-400/80">Tamanho do Mercado</span>
                  <span className="text-xl font-light text-foreground" style={{ fontSize: '0.9rem' }}>{analysisResult?.marketSize}</span>
                </div>
                <div className="p-5 rounded-2xl bg-background/40 backdrop-blur-xl border border-white/10 shadow-glass flex flex-col gap-2">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-purple-400/80">Competitividade</span>
                  <span className="text-xl font-light text-foreground" style={{ fontSize: '0.9rem' }}>{analysisResult?.competitiveness}</span>
                </div>
                <div className="p-5 rounded-2xl bg-background/40 backdrop-blur-xl border border-white/10 shadow-glass flex flex-col gap-2">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-purple-400/80">CAC Médio</span>
                  <span className="text-xl font-light text-foreground" style={{ fontSize: '0.9rem' }}>{analysisResult?.avgCac}</span>
                </div>
              </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <AnalyticsCard title="Análise Estratégica Completa">
                <div className="space-y-6">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <h4 className="text-[11px] font-semibold flex items-center gap-2 text-purple-400 uppercase tracking-widest mb-3">
                      <Target className="h-4 w-4" /> Oportunidade
                    </h4>
                    <p className="text-muted-foreground leading-relaxed" style={{ fontSize: '0.9rem' }}>
                      {analysisResult?.opportunity}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <h4 className="text-[11px] font-semibold flex items-center gap-2 text-purple-400 uppercase tracking-widest mb-3">
                      <TrendingUp className="h-4 w-4" /> Tendências
                    </h4>
                    <p className="text-muted-foreground leading-relaxed" style={{ fontSize: '0.9rem' }}>
                      {analysisResult?.trends}
                    </p>
                  </div>
                </div>
              </AnalyticsCard>

              <AnalyticsCard title="Plano de Ação para Performance">
                <div className="space-y-4">
                  <div className="p-4 bg-purple-500/5 rounded-xl border border-purple-500/10">
                    <h5 className="font-medium text-[11px] text-purple-400 uppercase tracking-widest mb-2">Estratégia de Anúncios</h5>
                    <p className="text-foreground/80 leading-relaxed" style={{ fontSize: '0.9rem' }}>{analysisResult?.adsStrategy}</p>
                  </div>
                  <div className="p-4 bg-purple-500/5 rounded-xl border border-purple-500/10">
                    <h5 className="font-medium text-[11px] text-purple-400 uppercase tracking-widest mb-2">Canais Recomendados</h5>
                    <p className="text-foreground/80 leading-relaxed" style={{ fontSize: '0.9rem' }}>{analysisResult?.channels}</p>
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
