import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { AnalyticsCard } from "@/components/analytics/AnalyticsCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  TrendingUp,
  Rocket,
  Sparkles,
  Loader2,
  Trash2,
  Calendar,
  Target,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Plus,
  CheckCircle2,
  Circle,
  AlertCircle,
  PauseCircle,
  Save,
  Route,
} from "lucide-react";

type SavedStudy = {
  id: string;
  niche: string;
  created_at: string;
  updated_at: string;
  result: any;
};

type FunnelStatus = "draft" | "active" | "paused" | "completed";
type StageStatus = "pending" | "in_progress" | "completed" | "blocked";

type FunnelStage = {
  id: string;
  funnel_id: string;
  title: string;
  stage_type: string;
  position: number;
  objective: string | null;
  channels: string[];
  content: string | null;
  offer: string | null;
  copy: string | null;
  kpi: string | null;
  status: StageStatus;
  owner: string | null;
  due_date: string | null;
  notes: string | null;
  updated_at: string;
};

type StrategyFunnel = {
  id: string;
  user_id: string;
  market_analysis_id: string | null;
  name: string;
  description: string | null;
  status: FunnelStatus;
  source_snapshot: any;
  created_at: string;
  updated_at: string;
  strategy_funnel_stages?: FunnelStage[];
};

const DEFAULT_STAGES = [
  { key: "topo", title: "Atração", type: "awareness" },
  { key: "meio", title: "Consideração", type: "consideration" },
  { key: "fundo", title: "Conversão", type: "conversion" },
  { key: "posVenda", title: "Retenção", type: "retention" },
];

const db = supabase as any;

const Strategy = () => {
  const navigate = useNavigate();
  const [studies, setStudies] = useState<SavedStudy[]>([]);
  const [funnels, setFunnels] = useState<StrategyFunnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [studiesRes, funnelsRes] = await Promise.all([
      supabase
        .from("market_analyses")
        .select("id, niche, created_at, updated_at, result")
        .order("updated_at", { ascending: false }),
      db
        .from("strategy_funnels")
        .select("*, strategy_funnel_stages(*)")
        .order("updated_at", { ascending: false }),
    ]);

    if (studiesRes.error) {
      toast({ title: "Erro ao carregar estudos", description: studiesRes.error.message, variant: "destructive" });
    } else {
      setStudies((studiesRes.data as any[]) || []);
    }

    if (funnelsRes.error) {
      console.warn("Funis ainda não disponíveis no banco:", funnelsRes.error.message);
      setFunnels([]);
    } else {
      const normalized = ((funnelsRes.data as StrategyFunnel[]) || []).map((f) => ({
        ...f,
        strategy_funnel_stages: [...(f.strategy_funnel_stages || [])].sort((a, b) => a.position - b.position),
      }));
      setFunnels(normalized);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const funnelsByStudy = useMemo(() => {
    const map = new Map<string, StrategyFunnel>();
    funnels.forEach((f) => {
      if (f.market_analysis_id) map.set(f.market_analysis_id, f);
    });
    return map;
  }, [funnels]);

  const buildStagesFromStudy = (study: SavedStudy) => {
    const salesFunnel = study.result?.salesFunnel || {};
    return DEFAULT_STAGES.map((def, index) => {
      const src = salesFunnel?.[def.key] || {};
      return {
        title: def.title,
        stage_type: def.type,
        position: index,
        objective: src.objetivo || "",
        channels: Array.isArray(src.canais) ? src.canais : [],
        content: src.conteudo || "",
        offer: src.oferta || "",
        copy: src.copy || "",
        kpi: src.kpi || "",
        status: "pending" as StageStatus,
        owner: "",
        due_date: null,
        notes: "",
      };
    });
  };

  const createFunnel = async (study: SavedStudy) => {
    const existing = funnelsByStudy.get(study.id);
    if (existing) {
      setExpandedId(existing.id);
      return existing;
    }

    setWorkingId(study.id);
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) throw new Error("Faça login para criar e salvar a estratégia.");

      const { data: funnel, error: funnelError } = await db
        .from("strategy_funnels")
        .insert({
          user_id: authData.user.id,
          market_analysis_id: study.id,
          name: study.niche || "Nova Estratégia",
          description: study.result?.opportunity || null,
          status: "draft",
          source_snapshot: study.result || {},
        })
        .select()
        .single();

      if (funnelError) throw funnelError;

      const stages = buildStagesFromStudy(study).map((stage) => ({ ...stage, funnel_id: funnel.id }));
      const { error: stagesError } = await db.from("strategy_funnel_stages").insert(stages);
      if (stagesError) throw stagesError;

      toast({ title: "Funil criado", description: "A estratégia e todas as etapas foram salvas no banco de dados." });
      await load();
      setExpandedId(funnel.id);
      return funnel;
    } catch (error: any) {
      toast({ title: "Erro ao criar funil", description: error?.message || "Falha inesperada", variant: "destructive" });
      return null;
    } finally {
      setWorkingId(null);
    }
  };

  const updateFunnel = async (funnelId: string, patch: Partial<StrategyFunnel>) => {
    setFunnels((prev) => prev.map((f) => (f.id === funnelId ? { ...f, ...patch } : f)));
    const { error } = await db
      .from("strategy_funnels")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", funnelId);
    if (error) toast({ title: "Erro ao salvar estratégia", description: error.message, variant: "destructive" });
  };

  const updateStage = async (funnelId: string, stageId: string, patch: Partial<FunnelStage>) => {
    setFunnels((prev) =>
      prev.map((f) =>
        f.id !== funnelId
          ? f
          : {
              ...f,
              strategy_funnel_stages: (f.strategy_funnel_stages || []).map((s) =>
                s.id === stageId ? { ...s, ...patch } : s,
              ),
            },
      ),
    );

    const { error } = await db
      .from("strategy_funnel_stages")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", stageId);

    if (error) toast({ title: "Erro ao salvar etapa", description: error.message, variant: "destructive" });
  };

  const addStage = async (funnel: StrategyFunnel) => {
    const stages = funnel.strategy_funnel_stages || [];
    const position = stages.length ? Math.max(...stages.map((s) => s.position)) + 1 : 0;
    const { data, error } = await db
      .from("strategy_funnel_stages")
      .insert({
        funnel_id: funnel.id,
        title: `Etapa ${position + 1}`,
        stage_type: "custom",
        position,
        status: "pending",
        channels: [],
      })
      .select()
      .single();

    if (error) {
      toast({ title: "Erro ao adicionar etapa", description: error.message, variant: "destructive" });
      return;
    }

    setFunnels((prev) => prev.map((f) =>
      f.id === funnel.id
        ? { ...f, strategy_funnel_stages: [...(f.strategy_funnel_stages || []), data] }
        : f,
    ));
  };

  const deleteStage = async (funnelId: string, stageId: string) => {
    if (!confirm("Excluir esta etapa do funil?")) return;
    const { error } = await db.from("strategy_funnel_stages").delete().eq("id", stageId);
    if (error) {
      toast({ title: "Erro ao excluir etapa", description: error.message, variant: "destructive" });
      return;
    }
    setFunnels((prev) => prev.map((f) =>
      f.id === funnelId
        ? { ...f, strategy_funnel_stages: (f.strategy_funnel_stages || []).filter((s) => s.id !== stageId) }
        : f,
    ));
  };

  const handleDeleteStudy = async (study: SavedStudy) => {
    const funnel = funnelsByStudy.get(study.id);
    const message = funnel
      ? "Excluir este estudo e o funil de execução vinculado?"
      : "Excluir esta estratégia?";
    if (!confirm(message)) return;

    if (funnel) {
      const { error: funnelError } = await db.from("strategy_funnels").delete().eq("id", funnel.id);
      if (funnelError) {
        toast({ title: "Erro", description: funnelError.message, variant: "destructive" });
        return;
      }
    }

    const { error } = await supabase.from("market_analyses").delete().eq("id", study.id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Estratégia excluída" });
      load();
    }
  };

  const handleExecute = async (study: SavedStudy) => {
    const funnel = funnelsByStudy.get(study.id) || (await createFunnel(study));
    if (!funnel) return;
    setExpandedId(funnel.id);
    if (funnel.status === "draft") await updateFunnel(funnel.id, { status: "active" });
  };

  const stageStatusMeta: Record<StageStatus, { label: string; icon: any; className: string }> = {
    pending: { label: "Pendente", icon: Circle, className: "text-slate-400" },
    in_progress: { label: "Em andamento", icon: Rocket, className: "text-cyan-400" },
    completed: { label: "Concluída", icon: CheckCircle2, className: "text-emerald-400" },
    blocked: { label: "Bloqueada", icon: AlertCircle, className: "text-red-400" },
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 rounded-xl">
              <Route className="h-8 w-8 text-emerald-500" />
            </div>
            <div>
              <h1 className="text-3xl font-extralight text-foreground tracking-tight">Estratégias & Funis</h1>
              <p className="text-muted-foreground mt-1 font-light italic opacity-80">
                Planeje, execute e acompanhe cada etapa da estratégia com dados persistidos no banco.
              </p>
            </div>
          </div>
          <Link to="/market-analysis">
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Sparkles className="mr-2 h-4 w-4" /> Novo Estudo
            </Button>
          </Link>
        </div>

        <AnalyticsCard title="Estratégias Salvas">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Carregando...
            </div>
          ) : studies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="p-3 bg-emerald-500/10 rounded-full">
                <Target className="h-8 w-8 text-emerald-500" />
              </div>
              <div>
                <h3 className="font-medium">Nenhuma estratégia salva ainda</h3>
                <p className="text-sm text-muted-foreground max-w-sm mt-1">
                  Gere um Estudo de Mercado e salve para transformar automaticamente o funil sugerido em um plano de execução.
                </p>
              </div>
              <Link to="/market-analysis">
                <Button className="bg-emerald-600 hover:bg-emerald-700">Criar Primeira Estratégia</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {studies.map((study) => {
                const result = study.result || {};
                const funnel = funnelsByStudy.get(study.id);
                const stages = funnel?.strategy_funnel_stages || [];
                const completed = stages.filter((s) => s.status === "completed").length;
                const progress = stages.length ? Math.round((completed / stages.length) * 100) : 0;
                const expanded = funnel && expandedId === funnel.id;

                return (
                  <div key={study.id} className="rounded-2xl border border-white/10 bg-white/[0.025] overflow-hidden">
                    <div className="p-5 flex flex-col xl:flex-row xl:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-medium text-foreground truncate">
                            {funnel?.name || study.niche}
                          </h3>
                          {funnel && (
                            <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 uppercase tracking-wider">
                              {funnel.status === "draft" ? "Rascunho" : funnel.status === "active" ? "Em execução" : funnel.status === "paused" ? "Pausada" : "Concluída"}
                            </span>
                          )}
                        </div>
                        {result.opportunity && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{result.opportunity}</p>
                        )}
                        <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {new Date(study.updated_at).toLocaleDateString("pt-BR")}
                          </span>
                          {funnel && <span>{stages.length} etapas</span>}
                          {funnel && <span>{progress}% concluído</span>}
                        </div>
                        {funnel && (
                          <div className="mt-3 h-2 rounded-full bg-white/5 overflow-hidden max-w-xl">
                            <div className="h-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteStudy(study)}
                          className="text-muted-foreground hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>

                        {!funnel ? (
                          <Button
                            onClick={() => createFunnel(study)}
                            disabled={workingId === study.id}
                            variant="outline"
                            className="border-emerald-500/30 text-emerald-300"
                          >
                            {workingId === study.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Route className="mr-2 h-4 w-4" />}
                            Criar Funil Visual
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            onClick={() => setExpandedId(expanded ? null : funnel.id)}
                            className="border-white/10"
                          >
                            {expanded ? <ChevronUp className="mr-2 h-4 w-4" /> : <ChevronDown className="mr-2 h-4 w-4" />}
                            {expanded ? "Fechar Funil" : "Abrir Funil"}
                          </Button>
                        )}

                        <Button onClick={() => handleExecute(study)} className="bg-emerald-600 hover:bg-emerald-700">
                          <Rocket className="mr-2 h-4 w-4" /> Executar
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>

                        <Button variant="ghost" size="sm" onClick={() => navigate(`/market-analysis?studyId=${study.id}`)}>
                          Ver estudo
                        </Button>
                      </div>
                    </div>

                    {funnel && expanded && (
                      <div className="border-t border-white/10 p-5 space-y-6 bg-black/10">
                        <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
                          <div>
                            <label className="text-xs uppercase tracking-wider text-muted-foreground">Nome da Estratégia</label>
                            <Input
                              value={funnel.name}
                              onChange={(e) => setFunnels((prev) => prev.map((f) => f.id === funnel.id ? { ...f, name: e.target.value } : f))}
                              onBlur={(e) => updateFunnel(funnel.id, { name: e.target.value.trim() || study.niche })}
                              className="mt-2 bg-background/60"
                            />
                          </div>
                          <div>
                            <label className="text-xs uppercase tracking-wider text-muted-foreground">Status da Estratégia</label>
                            <select
                              value={funnel.status}
                              onChange={(e) => updateFunnel(funnel.id, { status: e.target.value as FunnelStatus })}
                              className="mt-2 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                            >
                              <option value="draft">Rascunho</option>
                              <option value="active">Em execução</option>
                              <option value="paused">Pausada</option>
                              <option value="completed">Concluída</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="text-xs uppercase tracking-wider text-muted-foreground">Descrição / Objetivo Geral</label>
                          <Textarea
                            defaultValue={funnel.description || ""}
                            onBlur={(e) => updateFunnel(funnel.id, { description: e.target.value })}
                            className="mt-2 min-h-20 bg-background/60"
                            placeholder="Descreva o objetivo central desta estratégia..."
                          />
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <h4 className="font-medium">Funil Visual de Execução</h4>
                              <p className="text-xs text-muted-foreground">Cada etapa abaixo é um registro independente salvo no Supabase.</p>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => addStage(funnel)}>
                              <Plus className="mr-2 h-4 w-4" /> Adicionar Etapa
                            </Button>
                          </div>

                          <div className="grid gap-3 xl:grid-cols-4">
                            {stages.map((stage, index) => {
                              const meta = stageStatusMeta[stage.status];
                              const StatusIcon = meta.icon;
                              return (
                                <div key={stage.id} className="relative rounded-2xl border border-white/10 bg-background/70 p-4 space-y-4">
                                  {index < stages.length - 1 && (
                                    <div className="hidden xl:block absolute top-8 -right-3 z-10 h-px w-3 bg-emerald-500/40" />
                                  )}

                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <div className="h-8 w-8 shrink-0 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xs text-emerald-300">
                                        {index + 1}
                                      </div>
                                      <Input
                                        value={stage.title}
                                        onChange={(e) => setFunnels((prev) => prev.map((f) => f.id !== funnel.id ? f : {
                                          ...f,
                                          strategy_funnel_stages: (f.strategy_funnel_stages || []).map((s) => s.id === stage.id ? { ...s, title: e.target.value } : s),
                                        }))}
                                        onBlur={(e) => updateStage(funnel.id, stage.id, { title: e.target.value.trim() || `Etapa ${index + 1}` })}
                                        className="h-8 border-0 bg-transparent px-1 font-medium focus-visible:ring-1"
                                      />
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => deleteStage(funnel.id, stage.id)} className="h-8 w-8 p-0 text-muted-foreground hover:text-red-400">
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>

                                  <div className={`flex items-center gap-2 text-xs ${meta.className}`}>
                                    <StatusIcon className="h-4 w-4" />
                                    <select
                                      value={stage.status}
                                      onChange={(e) => updateStage(funnel.id, stage.id, { status: e.target.value as StageStatus })}
                                      className="flex-1 bg-transparent border-0 text-xs outline-none text-foreground"
                                    >
                                      <option value="pending">Pendente</option>
                                      <option value="in_progress">Em andamento</option>
                                      <option value="completed">Concluída</option>
                                      <option value="blocked">Bloqueada</option>
                                    </select>
                                  </div>

                                  <div className="space-y-3">
                                    <StageField label="Objetivo" value={stage.objective || ""} onSave={(value) => updateStage(funnel.id, stage.id, { objective: value })} />
                                    <StageField label="Canais" value={(stage.channels || []).join(", ")} onSave={(value) => updateStage(funnel.id, stage.id, { channels: value.split(",").map((v) => v.trim()).filter(Boolean) })} />
                                    <StageField label="Conteúdo" value={stage.content || ""} onSave={(value) => updateStage(funnel.id, stage.id, { content: value })} multiline />
                                    <StageField label="Oferta" value={stage.offer || ""} onSave={(value) => updateStage(funnel.id, stage.id, { offer: value })} multiline />
                                    <StageField label="Copy / Mensagem" value={stage.copy || ""} onSave={(value) => updateStage(funnel.id, stage.id, { copy: value })} multiline />
                                    <StageField label="KPI" value={stage.kpi || ""} onSave={(value) => updateStage(funnel.id, stage.id, { kpi: value })} />
                                    <StageField label="Responsável" value={stage.owner || ""} onSave={(value) => updateStage(funnel.id, stage.id, { owner: value })} />
                                    <div>
                                      <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Prazo</label>
                                      <input
                                        type="date"
                                        value={stage.due_date || ""}
                                        onChange={(e) => updateStage(funnel.id, stage.id, { due_date: e.target.value || null })}
                                        className="mt-1 w-full rounded-lg border border-white/10 bg-background px-2 py-2 text-xs"
                                      />
                                    </div>
                                    <StageField label="Notas" value={stage.notes || ""} onSave={(value) => updateStage(funnel.id, stage.id, { notes: value })} multiline />
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {stages.length === 0 && (
                            <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-muted-foreground">
                              Este funil ainda não possui etapas. Clique em “Adicionar Etapa”.
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Save className="h-4 w-4 text-emerald-400" />
                          Alterações são persistidas no banco ao sair de cada campo ou alterar um status.
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </AnalyticsCard>
      </div>
    </DashboardLayout>
  );
};

const StageField = ({
  label,
  value,
  onSave,
  multiline = false,
}: {
  label: string;
  value: string;
  onSave: (value: string) => void;
  multiline?: boolean;
}) => (
  <div>
    <label className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</label>
    {multiline ? (
      <Textarea
        defaultValue={value}
        onBlur={(e) => onSave(e.target.value)}
        className="mt-1 min-h-16 bg-white/[0.02] border-white/10 text-xs"
      />
    ) : (
      <Input
        defaultValue={value}
        onBlur={(e) => onSave(e.target.value)}
        className="mt-1 h-9 bg-white/[0.02] border-white/10 text-xs"
      />
    )}
  </div>
);

export default Strategy;
