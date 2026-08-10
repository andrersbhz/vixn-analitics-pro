import { useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { AnalyticsCard } from "@/components/analytics/AnalyticsCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, BarChart3, CheckCircle2, Loader2, Plus, Rocket, ShieldCheck, Sparkles, Target, Trash2, TrendingUp } from "lucide-react";

type Competitor = {
  url: string;
  loading: boolean;
  error?: string;
  data?: any;
};

const scoreLabel = (score: number) => {
  if (score >= 85) return "Excelente";
  if (score >= 70) return "Forte";
  if (score >= 55) return "Competitivo";
  if (score >= 40) return "Atenção";
  return "Crítico";
};

const MarketIntelligencePro = () => {
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [competitors, setCompetitors] = useState<Competitor[]>([
    { url: "", loading: false },
    { url: "", loading: false },
  ]);

  const validCompetitors = useMemo(
    () => competitors.filter((item) => item.data?.analysis),
    [competitors],
  );

  const runExecutiveAnalysis = async () => {
    if (!subject.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const prompt = `Você é um consultor sênior de estratégia, growth, CRO, aquisição e posicionamento.
Analise o negócio/nicho abaixo e retorne APENAS JSON puro válido.

NEGÓCIO/NICHO: ${subject.trim()}

Use esta estrutura exata:
{
  "executiveSummary":"string",
  "overallScore":0,
  "scores":{
    "market":0,
    "offer":0,
    "cro":0,
    "seo":0,
    "acquisition":0,
    "risk":0
  },
  "scoreRationale":{
    "market":"string",
    "offer":"string",
    "cro":"string",
    "seo":"string",
    "acquisition":"string",
    "risk":"string"
  },
  "swot":{
    "strengths":["string"],
    "weaknesses":["string"],
    "opportunities":["string"],
    "threats":["string"]
  },
  "priorities":[
    {"title":"string","impact":"alto|medio|baixo","effort":"alto|medio|baixo","why":"string"}
  ],
  "plan30": [{"action":"string","owner":"Marketing|Produto|Vendas|Operações","kpi":"string"}],
  "plan60": [{"action":"string","owner":"Marketing|Produto|Vendas|Operações","kpi":"string"}],
  "plan90": [{"action":"string","owner":"Marketing|Produto|Vendas|Operações","kpi":"string"}],
  "risks":[{"risk":"string","severity":"alta|media|baixa","mitigation":"string"}],
  "assumptions":["string"]
}

Regras:
- Score sempre entre 0 e 100.
- Não invente fontes, pesquisas ou dados de terceiros.
- Quando não houver dados verificáveis, trate números como estimativas ou hipóteses.
- Seja específico e acionável.
- Escreva em português do Brasil.`;

      const { data, error: invokeError } = await supabase.functions.invoke("ai-chat", {
        body: {
          prompt,
          model: "gemini",
          response_format: "json",
          fallback: true,
          temperature: 0.2,
          system_prompt: "Você produz análises executivas rigorosas em JSON estruturado, sem inventar evidências.",
        },
      });

      if (invokeError) throw invokeError;
      if (data?.error) throw new Error(data.error);
      const parsed = JSON.parse(String(data?.text || "{}").replace(/```json|```/g, "").trim());
      setResult(parsed);
    } catch (e: any) {
      setError(e?.message || "Falha ao gerar inteligência de mercado");
    } finally {
      setLoading(false);
    }
  };

  const analyzeCompetitor = async (index: number) => {
    const url = competitors[index]?.url?.trim();
    if (!url) return;
    setCompetitors((prev) => prev.map((item, i) => i === index ? { ...item, loading: true, error: undefined } : item));
    try {
      const { data, error: invokeError } = await supabase.functions.invoke("analyze-ecommerce", { body: { url } });
      if (invokeError) throw invokeError;
      if (data?.error) throw new Error(data.error);
      setCompetitors((prev) => prev.map((item, i) => i === index ? { ...item, loading: false, data } : item));
    } catch (e: any) {
      setCompetitors((prev) => prev.map((item, i) => i === index ? { ...item, loading: false, error: e?.message || "Falha na análise" } : item));
    }
  };

  const scoreEntries = result?.scores ? Object.entries(result.scores) as Array<[string, number]> : [];
  const scoreNames: Record<string, string> = {
    market: "Mercado",
    offer: "Oferta",
    cro: "CRO",
    seo: "SEO",
    acquisition: "Aquisição",
    risk: "Risco",
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-violet-500/10">
            <Sparkles className="h-8 w-8 text-violet-400" />
          </div>
          <div>
            <h1 className="text-3xl font-extralight tracking-tight">Market Intelligence Pro</h1>
            <p className="text-muted-foreground mt-1">Score executivo, concorrência e plano de execução em 30/60/90 dias.</p>
          </div>
        </div>

        <AnalyticsCard title="Diagnóstico Executivo">
          <div className="flex flex-col md:flex-row gap-3">
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ex: loja de cosméticos premium para mulheres no Brasil"
              className="h-11"
            />
            <Button onClick={runExecutiveAnalysis} disabled={loading || !subject.trim()} className="h-11 px-6">
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Target className="h-4 w-4 mr-2" />}
              {loading ? "Analisando..." : "Gerar Score Executivo"}
            </Button>
          </div>
          {error && <div className="mt-3 text-sm text-red-400 flex items-center gap-2"><AlertCircle className="h-4 w-4" />{error}</div>}
        </AnalyticsCard>

        {result && (
          <>
            <div className="grid gap-6 lg:grid-cols-3">
              <AnalyticsCard title="Score Geral">
                <div className="flex items-end gap-3">
                  <span className="text-6xl font-extralight">{Math.round(Number(result.overallScore || 0))}</span>
                  <span className="text-muted-foreground mb-2">/100 · {scoreLabel(Number(result.overallScore || 0))}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-4 leading-relaxed">{result.executiveSummary}</p>
              </AnalyticsCard>
              <div className="lg:col-span-2 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {scoreEntries.map(([key, score]) => (
                  <div key={key} className="rounded-2xl border bg-card/50 p-4">
                    <div className="flex justify-between gap-3">
                      <span className="text-xs uppercase tracking-widest text-muted-foreground">{scoreNames[key] || key}</span>
                      <span className="font-medium">{Math.round(Number(score || 0))}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted mt-3 overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${Math.max(0, Math.min(100, Number(score || 0)))}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{result.scoreRationale?.[key]}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <AnalyticsCard title="SWOT Executiva">
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    ["Forças", result.swot?.strengths],
                    ["Fraquezas", result.swot?.weaknesses],
                    ["Oportunidades", result.swot?.opportunities],
                    ["Ameaças", result.swot?.threats],
                  ].map(([label, items]: any) => (
                    <div key={label} className="rounded-xl border p-4">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">{label}</p>
                      <div className="space-y-2">
                        {(items || []).map((item: string, i: number) => (
                          <div key={i} className="text-sm flex gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />{item}</div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </AnalyticsCard>

              <AnalyticsCard title="Prioridades Impacto × Esforço">
                <div className="space-y-3">
                  {(result.priorities || []).map((item: any, i: number) => (
                    <div key={i} className="rounded-xl border p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium">{item.title}</p>
                        <span className="text-[10px] uppercase tracking-widest text-primary">{item.impact} impacto · {item.effort} esforço</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{item.why}</p>
                    </div>
                  ))}
                </div>
              </AnalyticsCard>
            </div>

            <AnalyticsCard title="Plano de Ação 30 / 60 / 90 Dias">
              <div className="grid gap-5 lg:grid-cols-3">
                {[
                  ["30 dias", result.plan30, Rocket],
                  ["60 dias", result.plan60, TrendingUp],
                  ["90 dias", result.plan90, BarChart3],
                ].map(([label, items, Icon]: any) => (
                  <div key={label} className="rounded-2xl border p-4 bg-card/40">
                    <div className="flex items-center gap-2 mb-4"><Icon className="h-4 w-4 text-primary" /><span className="font-medium">{label}</span></div>
                    <div className="space-y-4">
                      {(items || []).map((item: any, i: number) => (
                        <div key={i}>
                          <p className="text-sm">{item.action}</p>
                          <p className="text-[11px] text-muted-foreground mt-1">Responsável: {item.owner} · KPI: {item.kpi}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </AnalyticsCard>

            <AnalyticsCard title="Riscos e Mitigações">
              <div className="grid gap-3 md:grid-cols-2">
                {(result.risks || []).map((item: any, i: number) => (
                  <div key={i} className="rounded-xl border p-4">
                    <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-amber-400" /><span className="font-medium">{item.risk}</span></div>
                    <p className="text-xs text-muted-foreground mt-2">Severidade: {item.severity}</p>
                    <p className="text-sm mt-2">{item.mitigation}</p>
                  </div>
                ))}
              </div>
            </AnalyticsCard>
          </>
        )}

        <AnalyticsCard title="Comparação de Concorrentes">
          <div className="space-y-4">
            {competitors.map((competitor, index) => (
              <div key={index} className="rounded-xl border p-4 space-y-3">
                <div className="flex flex-col md:flex-row gap-2">
                  <Input
                    value={competitor.url}
                    onChange={(e) => setCompetitors((prev) => prev.map((item, i) => i === index ? { ...item, url: e.target.value, data: undefined, error: undefined } : item))}
                    placeholder="https://concorrente.com.br"
                  />
                  <Button variant="outline" onClick={() => analyzeCompetitor(index)} disabled={competitor.loading || !competitor.url.trim()}>
                    {competitor.loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}Analisar
                  </Button>
                  {competitors.length > 2 && (
                    <Button variant="ghost" size="icon" onClick={() => setCompetitors((prev) => prev.filter((_, i) => i !== index))}><Trash2 className="h-4 w-4" /></Button>
                  )}
                </div>
                {competitor.error && <p className="text-xs text-red-400">{competitor.error}</p>}
                {competitor.data?.analysis && (
                  <div className="grid gap-3 md:grid-cols-3 text-sm">
                    <div><span className="text-muted-foreground text-xs">Marca</span><p>{competitor.data.analysis.storeName || competitor.data.title || "-"}</p></div>
                    <div><span className="text-muted-foreground text-xs">Nicho</span><p>{competitor.data.analysis.niche || "-"}</p></div>
                    <div><span className="text-muted-foreground text-xs">Posicionamento</span><p>{competitor.data.analysis.positioning || "-"}</p></div>
                  </div>
                )}
              </div>
            ))}
            {competitors.length < 5 && (
              <Button variant="ghost" onClick={() => setCompetitors((prev) => [...prev, { url: "", loading: false }])}><Plus className="h-4 w-4 mr-2" />Adicionar concorrente</Button>
            )}
          </div>

          {validCompetitors.length >= 2 && (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead><tr className="border-b text-left text-muted-foreground"><th className="py-3">Concorrente</th><th>Forças</th><th>Fraquezas</th><th>Oportunidades</th><th>Quick Wins</th></tr></thead>
                <tbody>
                  {validCompetitors.map((item, i) => (
                    <tr key={i} className="border-b align-top">
                      <td className="py-4 pr-4 font-medium">{item.data.analysis.storeName || item.url}</td>
                      <td className="py-4 pr-4">{(item.data.analysis.strengths || []).slice(0, 3).join(" · ")}</td>
                      <td className="py-4 pr-4">{(item.data.analysis.weaknesses || []).slice(0, 3).join(" · ")}</td>
                      <td className="py-4 pr-4">{(item.data.analysis.opportunities || []).slice(0, 3).join(" · ")}</td>
                      <td className="py-4">{(item.data.analysis.quickWins || []).slice(0, 3).join(" · ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AnalyticsCard>
      </div>
    </DashboardLayout>
  );
};

export default MarketIntelligencePro;
