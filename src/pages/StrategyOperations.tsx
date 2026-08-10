import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { AnalyticsCard } from "@/components/analytics/AnalyticsCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { AlertTriangle, CalendarDays, CheckCircle2, Clock3, LayoutDashboard, Loader2, Plus, RefreshCw, Trash2, UserRound } from "lucide-react";

type TaskStatus = "todo" | "doing" | "review" | "done" | "blocked";
type TaskPriority = "low" | "medium" | "high" | "urgent";

type Funnel = {
  id: string;
  name: string;
  status: string;
};

type Stage = {
  id: string;
  funnel_id: string;
  title: string;
  position: number;
};

type Task = {
  id: string;
  user_id: string;
  funnel_id: string;
  stage_id: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  owner: string | null;
  due_date: string | null;
  completed_at: string | null;
  position: number;
};

const db = supabase as any;

const columns: Array<{ key: TaskStatus; label: string }> = [
  { key: "todo", label: "A fazer" },
  { key: "doing", label: "Em andamento" },
  { key: "review", label: "Revisão" },
  { key: "blocked", label: "Bloqueadas" },
  { key: "done", label: "Concluídas" },
];

const priorityLabel: Record<TaskPriority, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  urgent: "Urgente",
};

const StrategyOperations = () => {
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFunnel, setSelectedFunnel] = useState<string>("all");
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newOwner, setNewOwner] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [newPriority, setNewPriority] = useState<TaskPriority>("medium");
  const [newStageId, setNewStageId] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const [funnelRes, stageRes, taskRes] = await Promise.all([
      db.from("strategy_funnels").select("id,name,status").order("updated_at", { ascending: false }),
      db.from("strategy_funnel_stages").select("id,funnel_id,title,position").order("position", { ascending: true }),
      db.from("strategy_tasks").select("*").order("position", { ascending: true }).order("created_at", { ascending: false }),
    ]);

    if (funnelRes.error || stageRes.error || taskRes.error) {
      const message = funnelRes.error?.message || stageRes.error?.message || taskRes.error?.message || "Falha ao carregar operações";
      toast({ title: "Operações ainda não disponíveis", description: message, variant: "destructive" });
    } else {
      setFunnels(funnelRes.data || []);
      setStages(stageRes.data || []);
      setTasks(taskRes.data || []);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const visibleTasks = useMemo(() => (
    selectedFunnel === "all" ? tasks : tasks.filter((t) => t.funnel_id === selectedFunnel)
  ), [tasks, selectedFunnel]);

  const visibleStages = useMemo(() => (
    selectedFunnel === "all" ? stages : stages.filter((s) => s.funnel_id === selectedFunnel)
  ), [stages, selectedFunnel]);

  useEffect(() => {
    if (selectedFunnel === "all") setNewStageId("");
    else {
      const first = stages.find((s) => s.funnel_id === selectedFunnel);
      setNewStageId(first?.id || "");
    }
  }, [selectedFunnel, stages]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdue = visibleTasks.filter((t) => t.due_date && t.status !== "done" && new Date(`${t.due_date}T00:00:00`) < today).length;
  const dueSoon = visibleTasks.filter((t) => {
    if (!t.due_date || t.status === "done") return false;
    const d = new Date(`${t.due_date}T00:00:00`);
    const diff = Math.ceil((d.getTime() - today.getTime()) / 86400000);
    return diff >= 0 && diff <= 7;
  }).length;
  const done = visibleTasks.filter((t) => t.status === "done").length;
  const completion = visibleTasks.length ? Math.round((done / visibleTasks.length) * 100) : 0;

  const createTask = async () => {
    if (!newTitle.trim()) return;
    if (selectedFunnel === "all") {
      toast({ title: "Selecione uma estratégia", description: "Escolha uma estratégia antes de criar a tarefa.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) throw new Error("Faça login para salvar tarefas.");
      const { data, error } = await db.from("strategy_tasks").insert({
        user_id: authData.user.id,
        funnel_id: selectedFunnel,
        stage_id: newStageId || null,
        title: newTitle.trim(),
        description: newDescription.trim() || null,
        owner: newOwner.trim() || null,
        due_date: newDueDate || null,
        priority: newPriority,
        status: "todo",
        position: 0,
      }).select().single();
      if (error) throw error;
      setTasks((prev) => [data, ...prev]);
      setNewTitle(""); setNewDescription(""); setNewOwner(""); setNewDueDate(""); setNewPriority("medium");
      toast({ title: "Tarefa criada", description: "A tarefa foi salva no banco e vinculada à estratégia." });
    } catch (e: any) {
      toast({ title: "Erro ao criar tarefa", description: e?.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const updateTask = async (task: Task, patch: Partial<Task>) => {
    const next = { ...task, ...patch };
    if (patch.status === "done" && task.status !== "done") next.completed_at = new Date().toISOString();
    if (patch.status && patch.status !== "done") next.completed_at = null;
    setTasks((prev) => prev.map((t) => t.id === task.id ? next : t));
    const { error } = await db.from("strategy_tasks").update({
      ...patch,
      completed_at: next.completed_at,
      updated_at: new Date().toISOString(),
    }).eq("id", task.id);
    if (error) {
      toast({ title: "Erro ao atualizar tarefa", description: error.message, variant: "destructive" });
      load();
    }
  };

  const deleteTask = async (task: Task) => {
    if (!confirm("Excluir esta tarefa?")) return;
    const { error } = await db.from("strategy_tasks").delete().eq("id", task.id);
    if (error) toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    else setTasks((prev) => prev.filter((t) => t.id !== task.id));
  };

  const stageName = (task: Task) => stages.find((s) => s.id === task.stage_id)?.title || "Sem etapa";
  const funnelName = (task: Task) => funnels.find((f) => f.id === task.funnel_id)?.name || "Estratégia";

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl"><LayoutDashboard className="h-8 w-8 text-primary" /></div>
            <div>
              <h1 className="text-3xl font-extralight text-foreground tracking-tight">Operações da Estratégia</h1>
              <p className="text-muted-foreground mt-1 font-light italic opacity-80">Kanban, responsáveis, prazos e alertas de execução das estratégias.</p>
            </div>
          </div>
          <Button variant="outline" onClick={load} disabled={loading}><RefreshCw className="h-4 w-4 mr-2" />Atualizar</Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="p-5 rounded-2xl border bg-card/50"><p className="text-xs text-muted-foreground uppercase tracking-wider">Progresso</p><p className="text-3xl font-light mt-2">{completion}%</p><p className="text-xs text-muted-foreground mt-1">{done} de {visibleTasks.length} tarefas concluídas</p></div>
          <div className="p-5 rounded-2xl border bg-card/50"><p className="text-xs text-muted-foreground uppercase tracking-wider">Em aberto</p><p className="text-3xl font-light mt-2">{visibleTasks.length - done}</p><p className="text-xs text-muted-foreground mt-1">tarefas para executar</p></div>
          <div className="p-5 rounded-2xl border bg-card/50"><p className="text-xs text-muted-foreground uppercase tracking-wider">Vencidas</p><p className="text-3xl font-light mt-2">{overdue}</p><p className="text-xs text-muted-foreground mt-1">exigem atenção imediata</p></div>
          <div className="p-5 rounded-2xl border bg-card/50"><p className="text-xs text-muted-foreground uppercase tracking-wider">Próximos 7 dias</p><p className="text-3xl font-light mt-2">{dueSoon}</p><p className="text-xs text-muted-foreground mt-1">prazos chegando</p></div>
        </div>

        <AnalyticsCard title="Filtro & Nova Tarefa">
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <label className="text-sm text-muted-foreground">Estratégia
                <select value={selectedFunnel} onChange={(e) => setSelectedFunnel(e.target.value)} className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-base">
                  <option value="all">Todas as estratégias</option>
                  {funnels.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </label>
              <label className="text-sm text-muted-foreground">Etapa
                <select value={newStageId} onChange={(e) => setNewStageId(e.target.value)} disabled={selectedFunnel === "all"} className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-base">
                  <option value="">Sem etapa específica</option>
                  {visibleStages.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
                </select>
              </label>
            </div>
            <div className="grid gap-3 lg:grid-cols-4">
              <Input placeholder="Título da tarefa" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
              <Input placeholder="Responsável" value={newOwner} onChange={(e) => setNewOwner(e.target.value)} />
              <div className="flex w-full min-w-0 rounded-xl border bg-background px-3 py-2"><input type="date" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} className="block w-full min-w-0 border-0 bg-transparent p-0 text-base" /></div>
              <select value={newPriority} onChange={(e) => setNewPriority(e.target.value as TaskPriority)} className="w-full rounded-xl border bg-background px-3 py-2 text-base"><option value="low">Prioridade baixa</option><option value="medium">Prioridade média</option><option value="high">Prioridade alta</option><option value="urgent">Urgente</option></select>
            </div>
            <Textarea placeholder="Descrição, briefing ou critérios de conclusão" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} />
            <Button onClick={createTask} disabled={saving || !newTitle.trim() || selectedFunnel === "all"}><Plus className="h-4 w-4 mr-2" />{saving ? "Salvando..." : "Adicionar tarefa"}</Button>
          </div>
        </AnalyticsCard>

        {loading ? (
          <div className="flex justify-center py-16 text-muted-foreground"><Loader2 className="h-5 w-5 mr-2 animate-spin" />Carregando operações...</div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-5">
            {columns.map((column) => {
              const columnTasks = visibleTasks.filter((t) => t.status === column.key);
              return (
                <section key={column.key} className="rounded-2xl border bg-card/30 p-3 min-h-[260px]">
                  <div className="flex items-center justify-between mb-3"><h2 className="font-medium text-sm">{column.label}</h2><span className="text-xs text-muted-foreground">{columnTasks.length}</span></div>
                  <div className="space-y-3">
                    {columnTasks.map((task) => {
                      const isOverdue = !!task.due_date && task.status !== "done" && new Date(`${task.due_date}T00:00:00`) < today;
                      return (
                        <article key={task.id} className="rounded-xl border bg-background/70 p-3 space-y-3">
                          <div className="flex items-start justify-between gap-2"><div><p className="font-medium text-sm leading-snug">{task.title}</p><p className="text-[11px] text-muted-foreground mt-1">{selectedFunnel === "all" ? `${funnelName(task)} · ` : ""}{stageName(task)}</p></div><button onClick={() => deleteTask(task)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button></div>
                          {task.description && <p className="text-xs text-muted-foreground line-clamp-3">{task.description}</p>}
                          <div className="flex flex-wrap gap-2 text-[10px]">
                            <span className="px-2 py-1 rounded-full border">{priorityLabel[task.priority]}</span>
                            {task.owner && <span className="inline-flex items-center gap-1"><UserRound className="h-3 w-3" />{task.owner}</span>}
                            {task.due_date && <span className={`inline-flex items-center gap-1 ${isOverdue ? "text-red-400" : "text-muted-foreground"}`}>{isOverdue ? <AlertTriangle className="h-3 w-3" /> : <CalendarDays className="h-3 w-3" />}{new Date(`${task.due_date}T00:00:00`).toLocaleDateString("pt-BR")}</span>}
                          </div>
                          <select value={task.status} onChange={(e) => updateTask(task, { status: e.target.value as TaskStatus })} className="w-full rounded-lg border bg-background px-2 py-2 text-xs"><option value="todo">A fazer</option><option value="doing">Em andamento</option><option value="review">Revisão</option><option value="blocked">Bloqueada</option><option value="done">Concluída</option></select>
                        </article>
                      );
                    })}
                    {columnTasks.length === 0 && <div className="py-10 text-center text-xs text-muted-foreground">Nenhuma tarefa</div>}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 rounded-xl border bg-card/40 flex items-center gap-3"><Clock3 className="h-5 w-5 text-primary" /><div><p className="text-sm font-medium">Acompanhamento contínuo</p><p className="text-xs text-muted-foreground">Prazos e status são calculados a partir do banco.</p></div></div>
          <div className="p-4 rounded-xl border bg-card/40 flex items-center gap-3"><AlertTriangle className="h-5 w-5 text-amber-400" /><div><p className="text-sm font-medium">Alertas de atraso</p><p className="text-xs text-muted-foreground">Tarefas vencidas aparecem destacadas automaticamente.</p></div></div>
          <div className="p-4 rounded-xl border bg-card/40 flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-400" /><div><p className="text-sm font-medium">Progresso consolidado</p><p className="text-xs text-muted-foreground">Conclusão calculada por estratégia ou visão geral.</p></div></div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StrategyOperations;
