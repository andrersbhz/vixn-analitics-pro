import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { AnalyticsCard } from "@/components/analytics/AnalyticsCard";
import { Search, Briefcase, TrendingUp, Users, Target, Rocket, Loader2, Sparkles, Globe, AlertCircle, BarChart3, PieChart, Info, ArrowUpRight, MessageCircle, Play, Share2, Megaphone, Filter, DollarSign, Zap, FileText } from "lucide-react";
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
      const systemPrompt = `Você é um especialista sênior em marketing digital, growth e copywriting de resposta direta.
      Realize uma análise de mercado PROFUNDA e ACIONÁVEL para o nicho ou empresa: ${query}.
      Sua resposta DEVE ser um objeto JSON puro (sem markdown, sem comentários) com ESTA estrutura EXATA:
      {
        "marketSize": "string",
        "competitiveness": "string",
        "avgCac": "string",
        "opportunity": "string",
        "trends": "string",
        "projections": [{"name":"Mês 1","value":number}, ... 6 meses],
        "distribution": [{"name":"Orgânico","value":number},{"name":"Pago","value":number},{"name":"Social","value":number}],
        "channels": "string",
        "googleAds": {"strategy":"string","objective":"string","audience":"string","keywords":["string"],"headlines":["string","string","string"],"descriptions":["string","string"],"budget":"string","kpi":"string"},
        "instagramAds": {"strategy":"string","objective":"string","audience":"string","creative":"string","hook":"string","caption":"string","cta":"string","budget":"string","kpi":"string"},
        "tiktokAds": {"strategy":"string","objective":"string","audience":"string","creative":"string","hook":"string","script":"string","cta":"string","budget":"string","kpi":"string"},
        "linkedinAds": {"strategy":"string","objective":"string","audience":"string","format":"string","headline":"string","body":"string","cta":"string","budget":"string","kpi":"string"},
        "copyModels": [
          {"framework":"AIDA","headline":"string","body":"string","cta":"string"},
          {"framework":"PAS (Problema-Agitação-Solução)","headline":"string","body":"string","cta":"string"},
          {"framework":"BAB (Antes-Depois-Ponte)","headline":"string","body":"string","cta":"string"},
          {"framework":"4Ps (Promessa-Prova-Proposta-Push)","headline":"string","body":"string","cta":"string"}
        ],
        "salesFunnel": {
          "topo": {"objetivo":"string","canais":["string"],"conteudo":"string","oferta":"string","kpi":"string","copy":"string"},
          "meio": {"objetivo":"string","canais":["string"],"conteudo":"string","oferta":"string","kpi":"string","copy":"string"},
          "fundo": {"objetivo":"string","canais":["string"],"conteudo":"string","oferta":"string","kpi":"string","copy":"string"},
          "posVenda": {"objetivo":"string","canais":["string"],"conteudo":"string","oferta":"string","kpi":"string","copy":"string"}
        }
      }
      Escreva em português do Brasil, tom persuasivo e específico ao nicho. Responda APENAS o JSON.`;

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
      if (!result.instagramAds && result.facebookAds) result.instagramAds = result.facebookAds;
      if (!result.copyModels) result.copyModels = [];
      if (!result.salesFunnel) result.salesFunnel = {};
      
      setAnalysisResult(result);
      setAnalyzed(true);

      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          await supabase.from('market_analyses').insert({
            user_id: userData.user.id,
            niche: query,
            prompt: systemPrompt,
            model: 'gemini',
            result,
          });
        }
      } catch (e) {
        console.warn('Falha ao salvar análise:', e);
      }
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
                        <Search className="h-4 w-4 text-blue-400" />
                        <span className="text-[10px] font-bold text-blue-400 uppercase">Google Ads</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{analysisResult?.googleAds?.budget}</span>
                    </div>
                    <p className="text-foreground/80 text-[0.85rem] leading-tight">{analysisResult?.googleAds?.strategy}</p>
                  </div>

                  <div className="p-3 bg-blue-600/5 rounded-xl border border-blue-600/10 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Share2 className="h-4 w-4 text-blue-600" />
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
                        <Briefcase className="h-4 w-4 text-indigo-400" />
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

            {/* Estratégias detalhadas por plataforma */}
            <AnalyticsCard title="Estratégias Detalhadas de Ads por Plataforma">
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  { key: 'googleAds', label: 'Google Ads', color: 'blue', icon: Search },
                  { key: 'instagramAds', label: 'Instagram / Facebook Ads', color: 'pink', icon: Share2 },
                  { key: 'tiktokAds', label: 'TikTok Ads', color: 'fuchsia', icon: Play },
                  { key: 'linkedinAds', label: 'LinkedIn Ads', color: 'indigo', icon: Briefcase },
                ].map(({ key, label, color, icon: Icon }) => {
                  const d = analysisResult?.[key] || {};
                  return (
                    <div key={key} className={`p-4 rounded-xl bg-${color}-500/5 border border-${color}-500/10 flex flex-col gap-3`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 text-${color}-400`} />
                          <span className={`text-[11px] font-bold uppercase tracking-wider text-${color}-400`}>{label}</span>
                        </div>
                        {d.budget && <span className="text-[10px] text-muted-foreground flex items-center gap-1"><DollarSign className="h-3 w-3" />{d.budget}</span>}
                      </div>
                      {d.objective && <div className="text-[0.8rem]"><span className="text-muted-foreground/70 uppercase text-[9px] tracking-wider">Objetivo · </span><span className="text-foreground/80">{d.objective}</span></div>}
                      {d.audience && <div className="text-[0.8rem]"><span className="text-muted-foreground/70 uppercase text-[9px] tracking-wider">Público · </span><span className="text-foreground/80">{d.audience}</span></div>}
                      {d.strategy && <p className="text-foreground/80 text-[0.85rem] leading-snug">{d.strategy}</p>}
                      {Array.isArray(d.keywords) && d.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {d.keywords.slice(0, 8).map((k: string, i: number) => (
                            <span key={i} className={`text-[10px] px-2 py-0.5 rounded-full bg-${color}-500/10 text-${color}-300 border border-${color}-500/20`}>{k}</span>
                          ))}
                        </div>
                      )}
                      {Array.isArray(d.headlines) && d.headlines.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase tracking-wider text-muted-foreground/70">Títulos</span>
                          {d.headlines.map((h: string, i: number) => (
                            <div key={i} className="text-[0.8rem] text-foreground/80 border-l-2 border-white/10 pl-2">{h}</div>
                          ))}
                        </div>
                      )}
                      {(d.hook || d.script || d.body || d.caption) && (
                        <div className="space-y-1">
                          {d.hook && <div className="text-[0.8rem]"><span className="text-muted-foreground/70 uppercase text-[9px] tracking-wider">Hook · </span><span className="text-foreground/80 italic">"{d.hook}"</span></div>}
                          {(d.script || d.body || d.caption) && <p className="text-[0.8rem] text-foreground/70 leading-snug">{d.script || d.body || d.caption}</p>}
                        </div>
                      )}
                      {d.creative && <div className="text-[0.8rem]"><span className="text-muted-foreground/70 uppercase text-[9px] tracking-wider">Criativo · </span><span className="text-foreground/80">{d.creative}</span></div>}
                      {d.format && <div className="text-[0.8rem]"><span className="text-muted-foreground/70 uppercase text-[9px] tracking-wider">Formato · </span><span className="text-foreground/80">{d.format}</span></div>}
                      {d.cta && <div className="text-[0.8rem]"><span className="text-muted-foreground/70 uppercase text-[9px] tracking-wider">CTA · </span><span className="text-foreground/80 font-medium">{d.cta}</span></div>}
                      {d.kpi && <div className="text-[0.75rem] text-emerald-400/80 flex items-center gap-1"><Target className="h-3 w-3" />{d.kpi}</div>}
                    </div>
                  );
                })}
              </div>
            </AnalyticsCard>

            {/* Modelos de Copy */}
            {Array.isArray(analysisResult?.copyModels) && analysisResult.copyModels.length > 0 && (
              <AnalyticsCard title="Modelos de Copy Prontos">
                <div className="grid gap-4 md:grid-cols-2">
                  {analysisResult.copyModels.map((c: any, i: number) => (
                    <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-purple-400" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300">{c.framework}</span>
                      </div>
                      {c.headline && <div className="text-[0.9rem] font-medium text-foreground">{c.headline}</div>}
                      {c.body && <p className="text-[0.82rem] text-muted-foreground leading-relaxed whitespace-pre-line">{c.body}</p>}
                      {c.cta && (
                        <div className="mt-1 inline-flex self-start items-center gap-1 text-[0.75rem] px-3 py-1 rounded-full bg-purple-500/15 text-purple-200 border border-purple-500/30">
                          <Zap className="h-3 w-3" /> {c.cta}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </AnalyticsCard>
            )}

            {/* Funil de Vendas */}
            {analysisResult?.salesFunnel && Object.keys(analysisResult.salesFunnel).length > 0 && (
              <AnalyticsCard title="Funil de Vendas Matador">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {[
                    { key: 'topo', label: 'Topo · Atração', color: 'cyan', icon: Users },
                    { key: 'meio', label: 'Meio · Consideração', color: 'purple', icon: Filter },
                    { key: 'fundo', label: 'Fundo · Conversão', color: 'emerald', icon: Target },
                    { key: 'posVenda', label: 'Pós-Venda · Retenção', color: 'amber', icon: Rocket },
                  ].map(({ key, label, color, icon: Icon }) => {
                    const s = analysisResult.salesFunnel[key];
                    if (!s) return null;
                    return (
                      <div key={key} className={`p-4 rounded-2xl bg-gradient-to-b from-${color}-500/10 to-transparent border border-${color}-500/20 flex flex-col gap-3`}>
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 text-${color}-400`} />
                          <span className={`text-[10px] font-bold uppercase tracking-wider text-${color}-300`}>{label}</span>
                        </div>
                        {s.objetivo && <div className="text-[0.82rem] text-foreground/85"><span className="text-muted-foreground/70 uppercase text-[9px] tracking-wider block mb-0.5">Objetivo</span>{s.objetivo}</div>}
                        {Array.isArray(s.canais) && s.canais.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {s.canais.map((c: string, i: number) => (
                              <span key={i} className={`text-[9px] px-2 py-0.5 rounded-full bg-${color}-500/10 text-${color}-200 border border-${color}-500/20`}>{c}</span>
                            ))}
                          </div>
                        )}
                        {s.conteudo && <div className="text-[0.8rem] text-muted-foreground"><span className="text-muted-foreground/60 uppercase text-[9px] tracking-wider block mb-0.5">Conteúdo</span>{s.conteudo}</div>}
                        {s.oferta && <div className="text-[0.8rem] text-muted-foreground"><span className="text-muted-foreground/60 uppercase text-[9px] tracking-wider block mb-0.5">Oferta</span>{s.oferta}</div>}
                        {s.copy && <div className="text-[0.78rem] italic text-foreground/70 border-l-2 border-white/10 pl-2">"{s.copy}"</div>}
                        {s.kpi && <div className={`text-[0.72rem] text-${color}-300 flex items-center gap-1 mt-auto`}><Target className="h-3 w-3" />{s.kpi}</div>}
                      </div>
                    );
                  })}
                </div>
              </AnalyticsCard>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MarketAnalysis;
