import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { AnalyticsCard } from "@/components/analytics/AnalyticsCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { AlertTriangle, BarChart3, CalendarDays, CheckCircle2, Clock3, RefreshCw, ShieldAlert, Target, UserRound } from "lucide-react";

const db = supabase as any;

type Funnel = { id:string; name:string; status:string; updated_at:string };
type Task = { id:string; funnel_id:string; title:string; status:string; priority:string; owner:string|null; due_date:string|null; updated_at:string };

const StrategyCockpit = () => {
  const [funnels,setFunnels] = useState<Funnel[]>([]);
  const [tasks,setTasks] = useState<Task[]>([]);
  const [loading,setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [funnelRes,taskRes] = await Promise.all([
      db.from("strategy_funnels").select("id,name,status,updated_at").order("updated_at",{ascending:false}),
      db.from("strategy_tasks").select("id,funnel_id,title,status,priority,owner,due_date,updated_at").order("updated_at",{ascending:false}),
    ]);
    if (funnelRes.error || taskRes.error) toast({title:"Erro ao carregar cockpit",description:funnelRes.error?.message || taskRes.error?.message,variant:"destructive"});
    else { setFunnels(funnelRes.data || []); setTasks(taskRes.data || []); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);
  const open = tasks.filter(t => t.status !== "done");
  const done = tasks.filter(t => t.status === "done");
  const overdue = open.filter(t => t.due_date && new Date(`${t.due_date}T00:00:00`) < today);
  const critical = open.filter(t => t.priority === "urgent" || t.priority === "high");
  const completion = tasks.length ? Math.round((done.length/tasks.length)*100) : 0;

  const funnelStats = useMemo(() => funnels.map(f => {
    const ft = tasks.filter(t => t.funnel_id === f.id);
    const fd = ft.filter(t => t.status === "done").length;
    const fo = ft.filter(t => t.status !== "done" && t.due_date && new Date(`${t.due_date}T00:00:00`) < today).length;
    const fb = ft.filter(t => t.status === "blocked").length;
    const progress = ft.length ? Math.round((fd/ft.length)*100) : 0;
    const inactiveDays = Math.floor((Date.now()-new Date(f.updated_at).getTime())/86400000);
    return {...f,total:ft.length,done:fd,overdue:fo,blocked:fb,progress,inactiveDays,stalled:f.status==="active" && progress<100 && inactiveDays>=7};
  }),[funnels,tasks,today]);

  const owners = useMemo(() => {
    const map = new Map<string,{owner:string;open:number;done:number;overdue:number;critical:number}>();
    tasks.forEach(t => {
      const owner=t.owner?.trim() || "Sem responsável";
      const r=map.get(owner) || {owner,open:0,done:0,overdue:0,critical:0};
      t.status==="done" ? r.done++ : r.open++;
      if(t.status!=="done" && t.due_date && new Date(`${t.due_date}T00:00:00`)<today) r.overdue++;
      if(t.status!=="done" && (t.priority==="urgent" || t.priority==="high")) r.critical++;
      map.set(owner,r);
    });
    return Array.from(map.values()).sort((a,b)=>(b.open+b.overdue*2+b.critical*2)-(a.open+a.overdue*2+a.critical*2));
  },[tasks,today]);

  const upcoming = useMemo(() => open.filter(t=>t.due_date).sort((a,b)=>String(a.due_date).localeCompare(String(b.due_date))).slice(0,12),[open]);
  const funnelName=(id:string)=>funnels.find(f=>f.id===id)?.name || "Estratégia";

  return <DashboardLayout><div className="space-y-8">
    <div className="flex items-center justify-between gap-4 flex-wrap"><div className="flex items-center gap-3"><div className="p-3 bg-primary/10 rounded-xl"><BarChart3 className="h-8 w-8 text-primary" /></div><div><h1 className="text-3xl font-extralight tracking-tight">Cockpit de Estratégias</h1><p className="text-muted-foreground mt-1 font-light italic opacity-80">Progresso, gargalos, responsáveis e prazos em uma visão executiva.</p></div></div><Button variant="outline" onClick={load} disabled={loading}><RefreshCw className="h-4 w-4 mr-2"/>Atualizar</Button></div>

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"><Metric label="Progresso global" value={`${completion}%`} note={`${done.length} de ${tasks.length} tarefas`} /><Metric label="Em aberto" value={String(open.length)} note="tarefas em execução"/><Metric label="Vencidas" value={String(overdue.length)} note="exigem atenção"/><Metric label="Alta prioridade" value={String(critical.length)} note="high + urgent"/><Metric label="Estratégias paradas" value={String(funnelStats.filter(f=>f.stalled).length)} note="7+ dias sem avanço"/></div>

    <AnalyticsCard title="Saúde das Estratégias"><div className="space-y-3">{funnelStats.map(f=><div key={f.id} className="rounded-xl border p-4 bg-card/40"><div className="flex items-center justify-between gap-3 flex-wrap"><div><div className="flex items-center gap-2 flex-wrap"><h3 className="font-medium">{f.name}</h3>{f.stalled&&<span className="text-xs text-amber-400 inline-flex items-center gap-1"><Clock3 className="h-3 w-3"/>Parada</span>}{f.blocked>0&&<span className="text-xs text-red-400 inline-flex items-center gap-1"><ShieldAlert className="h-3 w-3"/>{f.blocked} bloqueada(s)</span>}</div><p className="text-xs text-muted-foreground mt-1">{f.done}/{f.total} concluídas · {f.overdue} vencidas · atualizado há {f.inactiveDays} dia(s)</p></div><div className="text-2xl font-light">{f.progress}%</div></div><div className="mt-3 h-2 rounded-full bg-muted overflow-hidden"><div className="h-full bg-primary" style={{width:`${f.progress}%`}}/></div></div>)}</div></AnalyticsCard>

    <div className="grid gap-6 xl:grid-cols-2"><AnalyticsCard title="Carga por Responsável"><div className="space-y-3">{owners.map(o=><div key={o.owner} className="rounded-xl border p-4 flex items-center justify-between gap-3"><div><p className="font-medium flex items-center gap-2"><UserRound className="h-4 w-4"/>{o.owner}</p><p className="text-xs text-muted-foreground mt-1">{o.open} abertas · {o.done} concluídas</p></div><div className="text-right text-xs"><div className={o.overdue?"text-red-400":"text-muted-foreground"}>{o.overdue} vencidas</div><div className={o.critical?"text-amber-400":"text-muted-foreground"}>{o.critical} críticas</div></div></div>)}</div></AnalyticsCard>

    <AnalyticsCard title="Próximos Prazos"><div className="space-y-3">{upcoming.map(t=>{const late=!!t.due_date&&new Date(`${t.due_date}T00:00:00`)<today;return <div key={t.id} className="rounded-xl border p-4 flex items-start justify-between gap-3"><div><p className="font-medium text-sm">{t.title}</p><p className="text-xs text-muted-foreground mt-1">{funnelName(t.funnel_id)}{t.owner?` · ${t.owner}`:""}</p></div><div className={`text-xs inline-flex items-center gap-1 ${late?"text-red-400":"text-muted-foreground"}`}>{late?<AlertTriangle className="h-3 w-3"/>:<CalendarDays className="h-3 w-3"/>}{new Date(`${t.due_date}T00:00:00`).toLocaleDateString("pt-BR")}</div></div>})}</div></AnalyticsCard></div>

    <AnalyticsCard title="Foco Executivo"><div className="grid gap-3 md:grid-cols-3"><Focus icon={AlertTriangle} title="Atrasos" text={overdue.length?`${overdue.length} tarefa(s) vencida(s) precisam ser tratadas.`:"Nenhum atraso crítico."}/><Focus icon={Target} title="Prioridades" text={critical.length?`${critical.length} tarefa(s) de alta prioridade ainda estão abertas.`:"Nenhuma tarefa crítica pendente."}/><Focus icon={CheckCircle2} title="Execução" text={`${completion}% do trabalho planejado já foi concluído.`}/></div></AnalyticsCard>
  </div></DashboardLayout>;
};

const Metric=({label,value,note}:{label:string;value:string;note:string})=><div className="p-5 rounded-2xl border bg-card/50"><p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p><p className="text-3xl font-light mt-2">{value}</p><p className="text-xs text-muted-foreground mt-1">{note}</p></div>;
const Focus=({icon:Icon,title,text}:{icon:any;title:string;text:string})=><div className="rounded-xl border p-4"><div className="flex items-center gap-2"><Icon className="h-4 w-4 text-primary"/><h3 className="font-medium text-sm">{title}</h3></div><p className="text-xs text-muted-foreground mt-2 leading-relaxed">{text}</p></div>;

export default StrategyCockpit;
