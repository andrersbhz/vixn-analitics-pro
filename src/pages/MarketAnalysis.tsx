import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { AnalyticsCard } from "@/components/analytics/AnalyticsCard";
import { Search, Briefcase, TrendingUp, Users, Target, Rocket, Loader2, Sparkles, Globe, AlertCircle, BarChart3, PieChart, Info, ArrowUpRight, Facebook, Instagram, Linkedin, MessageCircle, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart as RePieChart, Pie, Cell 
} from 'recharts';

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
      const systemPrompt = `Você é um especialista em marketing digital e análise estratégica. 
      Realize uma análise de mercado detalhada para o nicho ou empresa: ${query}.
      Sua resposta DEVE ser um objeto JSON puro, sem markdown, contendo:
      {
        "marketSize": "string",
        "competitiveness": "string",
        "avgCac": "string",
        "opportunity": "string",
        "trends": "string",
        "projections": [{"name": "Mês 1", "value": number}, ...6 meses],
        "googleAds": {"strategy": "string", "keywords": ["string"], "budget": "string"},
        "facebookAds": {"strategy": "string", "creative": "string", "budget": "string"},
        "tiktokAds": {"strategy": "string", "creative": "string", "budget": "string"},
        "linkedinAds": {"strategy": "string", "audience": "string", "budget": "string"},
        "channels": "string",
        "distribution": [{"name": "Orgânico", "value": number}, {"name": "Pago", "value": number}, {"name": "Social", "value": number}]
      }
      Responda APENAS o JSON.`;

      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { 
          prompt: systemPrompt,
          model: 'gemini',
          system_prompt: "Você é um analista de marketing sênior que fornece dados em JSON puro."
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
      
      // Fallback for missing nested objects
      if (!result.googleAds) result.googleAds = { strategy: result.adsStrategy || "Focar em pesquisa", keywords: [], budget: "R$ 50/dia" };
      if (!result.facebookAds) result.facebookAds = { strategy: "Remarketing e Lookalike", creative: "Vídeos curtos", budget: "R$ 30/dia" };
      if (!result.tiktokAds) result.tiktokAds = { strategy: "Trends e Influenciadores", creative: "UGC (User Generated Content)", budget: "R$ 20/dia" };
      if (!result.linkedinAds) result.linkedinAds = { strategy: "ABM e Conteúdo Educativo", audience: "Decisores B2B", budget: "R$ 100/dia" };
      
      setAnalysisResult(result);
      setAnalyzed(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B'];

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
                  <span className="font-light text-foreground" style={{ fontSize: '0.9rem' }}>{analysisResult?.marketSize}</span>
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

            <div className="grid gap-6 md:grid-cols-2">
              <AnalyticsCard title="Projeção de Crescimento (6 Meses)">
                <div className="h-[250px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analysisResult?.projections || []}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(23, 23, 23, 0.8)', border: 'none', borderRadius: '8px', fontSize: '10px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Area type="monotone" dataKey="value" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </AnalyticsCard>

              <AnalyticsCard title="Distribuição de Canais Sugerida">
                <div className="h-[250px] w-full mt-4 flex items-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={analysisResult?.distribution || []}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {(analysisResult?.distribution || []).map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(23, 23, 23, 0.8)', border: 'none', borderRadius: '8px', fontSize: '10px' }}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-col gap-2 ml-4">
                    {(analysisResult?.distribution || []).map((entry: any, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-[10px] text-muted-foreground">{entry.name}: {entry.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </AnalyticsCard>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <AnalyticsCard title="Análise Estratégica" className="h-full">
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
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <h4 className="text-[11px] font-semibold flex items-center gap-2 text-purple-400 uppercase tracking-widest mb-3">
                      <Info className="h-4 w-4" /> Canais Recomendados
                    </h4>
                    <p className="text-muted-foreground leading-relaxed" style={{ fontSize: '0.9rem' }}>
                      {analysisResult?.channels}
                    </p>
                  </div>
                </div>
              </AnalyticsCard>

              <AnalyticsCard title="Estratégias por Plataforma (Ads)">
                <div className="grid gap-4">
                  <div className="p-3 bg-blue-500/5 rounded-xl border border-blue-500/10 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-blue-400" />
                        <span className="text-[10px] font-bold text-blue-400 uppercase">Google Ads</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{analysisResult?.googleAds?.budget}</span>
                    </div>
                    <p className="text-foreground/80 text-[0.85rem] leading-tight">{analysisResult?.googleAds?.strategy}</p>
                  </div>

                  <div className="p-3 bg-blue-600/5 rounded-xl border border-blue-600/10 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Facebook className="h-4 w-4 text-blue-600" />
                        <span className="text-[10px] font-bold text-blue-600 uppercase">Facebook / Instagram</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{analysisResult?.facebookAds?.budget}</span>
                    </div>
                    <p className="text-foreground/80 text-[0.85rem] leading-tight">{analysisResult?.facebookAds?.strategy}</p>
                  </div>

                  <div className="p-3 bg-pink-500/5 rounded-xl border border-pink-500/10 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-pink-400" />
                        <span className="text-[10px] font-bold text-pink-400 uppercase">TikTok Ads</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{analysisResult?.tiktokAds?.budget}</span>
                    </div>
                    <p className="text-foreground/80 text-[0.85rem] leading-tight">{analysisResult?.tiktokAds?.strategy}</p>
                  </div>

                  <div className="p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Linkedin className="h-4 w-4 text-indigo-400" />
                        <span className="text-[10px] font-bold text-indigo-400 uppercase">LinkedIn Ads</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{analysisResult?.linkedinAds?.budget}</span>
                    </div>
                    <p className="text-foreground/80 text-[0.85rem] leading-tight">{analysisResult?.linkedinAds?.strategy}</p>
                  </div>
                </div>
                <Button className="w-full mt-6 bg-purple-600 hover:bg-purple-700">
                  Exportar Plano Completo <Briefcase className="ml-2 h-4 w-4" />
                </Button>
              </AnalyticsCard>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MarketAnalysis;
