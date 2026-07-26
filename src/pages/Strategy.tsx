import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { AnalyticsCard } from "@/components/analytics/AnalyticsCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { TrendingUp, Rocket, Sparkles, Loader2, Trash2, Calendar, Target, ArrowRight } from "lucide-react";

type SavedStudy = {
  id: string;
  niche: string;
  created_at: string;
  updated_at: string;
  result: any;
};

const Strategy = () => {
  const navigate = useNavigate();
  const [studies, setStudies] = useState<SavedStudy[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('market_analyses')
      .select('id, niche, created_at, updated_at, result')
      .order('updated_at', { ascending: false });
    if (error) {
      toast({ title: 'Erro ao carregar', description: error.message, variant: 'destructive' });
    } else {
      setStudies((data as any[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta estratégia?')) return;
    const { error } = await supabase.from('market_analyses').delete().eq('id', id);
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Excluído' }); load(); }
  };

  const handleExecute = (id: string) => {
    navigate(`/market-analysis?studyId=${id}#creatives-panel`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 rounded-xl">
              <TrendingUp className="h-8 w-8 text-emerald-500" />
            </div>
            <div>
              <h1 className="text-3xl font-extralight text-foreground tracking-tight">Estratégias de Negócio</h1>
              <p className="text-muted-foreground mt-1 font-light italic opacity-80">Todos os seus estudos de mercado salvos, prontos para execução.</p>
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
                  Vá para <span className="text-emerald-400">Estudo de Mercado</span>, gere uma análise e clique em <span className="text-emerald-400">Salvar Estratégia</span>.
                </p>
              </div>
              <Link to="/market-analysis">
                <Button className="bg-emerald-600 hover:bg-emerald-700">Criar Primeira Estratégia</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {studies.map((s) => {
                const r = s.result || {};
                return (
                  <div key={s.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col md:flex-row md:items-center gap-4 hover:border-emerald-500/30 transition">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-medium text-foreground truncate">{s.niche}</h3>
                        {r.marketSize && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300">
                            {String(r.marketSize).slice(0, 40)}
                          </span>
                        )}
                        {r.competitiveness && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300">
                            Competitividade: {String(r.competitiveness).slice(0, 30)}
                          </span>
                        )}
                      </div>
                      {r.opportunity && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{r.opportunity}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(s.updated_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(s.id)}
                        className="text-muted-foreground hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleExecute(s.id)}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        <Rocket className="mr-2 h-4 w-4" />
                        Iniciar Execução da Estratégia
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
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

export default Strategy;
