import DashboardLayout from "@/components/DashboardLayout";
import { AnalyticsCard } from "@/components/analytics/AnalyticsCard";
import { useState, useEffect } from "react";
import { useConnections } from "@/hooks/use-connections";
import { fetchWordPressData, WordPressStats } from "@/lib/wordpress";
import { 
  Globe, 
  Search, 
  Users, 
  MousePointer2, 
  Clock,
  ArrowUp,
  ExternalLink,
  AlertCircle,
  FileText,
  MessageSquare,
  Tag,
  FolderOpen,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const BlogAnalytics = () => {
  const { getConnection } = useConnections();
  const wpConn = getConnection('wordpress');
  const [data, setData] = useState<WordPressStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (wpConn?.isConnected) {
        setLoading(true);
        try {
          const stats = await fetchWordPressData(
            wpConn.config.url,
            wpConn.config.user,
            wpConn.config.password
          );
          setData(stats);
          setError(null);
        } catch (err: any) {
          setError(err.message || "Erro ao carregar dados do WordPress");
          toast.error("Erro ao sincronizar com o Blog");
        } finally {
          setLoading(false);
        }
      }
    };

    loadData();
  }, [wpConn]);

  if (!wpConn?.isConnected) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="p-4 bg-accent/50 rounded-full">
            <Globe className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold">Blog não conectado</h2>
          <p className="text-muted-foreground text-center max-w-md">
            Conecte seu site WordPress nas configurações para visualizar dados reais e métricas de desempenho.
          </p>
          <Link to="/settings">
            <Button>Ir para Configurações</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center gap-3">
           <div className="p-3 bg-blue-500/10 rounded-xl">
             <Globe className="h-8 w-8 text-blue-500" />
           </div>
           <div>
             <h1 className="text-3xl font-extralight text-foreground tracking-tight">Blog Analytics</h1>
             <p className="text-muted-foreground mt-1">Monitore o desempenho do seu site ou WordPress.</p>
           </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
           {[
            { label: "Total de Posts", value: loading ? "..." : data?.postCount || "0", icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10" },
            { label: "Comentários", value: loading ? "..." : data?.totalComments || "0", icon: MessageSquare, color: "text-emerald-500", bg: "bg-emerald-500/10" },
            { label: "Categorias", value: loading ? "..." : data?.categoriesCount || "0", icon: FolderOpen, color: "text-orange-500", bg: "bg-orange-500/10" },
            { label: "Tags Ativas", value: loading ? "..." : data?.tagsCount || "0", icon: Tag, color: "text-purple-500", bg: "bg-purple-500/10" },
          ].map((stat, i) => (
              <div key={i} className="glass-card p-6 rounded-2xl border border-white/10 shadow-xl">
                <div className="flex items-center gap-4">
                  <div className={`p-3 ${stat.bg} rounded-xl`}>
                    <stat.icon className={`${stat.color} h-6 w-6`} />
                  </div>
                  <div>
                    <p className="text-xs font-light uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-extralight text-foreground">{stat.value}</p>
                  </div>
                </div>
              </div>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
           {[
            { label: "Usuários", value: loading ? "..." : data?.usersCount || "0", icon: Users, color: "text-cyan-500", bg: "bg-cyan-500/10" },
            { label: "Site", value: loading ? "..." : data?.siteName || "N/A", icon: Globe, color: "text-indigo-500", bg: "bg-indigo-500/10" },
            { label: "Status API", value: error ? "Erro" : "Ativo", icon: AlertCircle, color: error ? "text-rose-500" : "text-emerald-500", bg: error ? "bg-rose-500/10" : "bg-emerald-500/10" },
            { label: "Sincronização", value: "Real-time", icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
          ].map((stat, i) => (
              <div key={i} className="glass-card p-6 rounded-2xl border border-white/10 shadow-xl">
                <div className="flex items-center gap-4">
                  <div className={`p-3 ${stat.bg} rounded-xl`}>
                    <stat.icon className={`${stat.color} h-6 w-6`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                </div>
              </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <AnalyticsCard title="Categorias Mais Postadas">
               {loading ? (
                  <div className="py-8 text-center text-muted-foreground">Carregando categorias...</div>
               ) : (
                 <div className="space-y-4">
                    {data?.topCategories.map((cat, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{cat.name}</span>
                          <span className="text-muted-foreground">{cat.count} posts</span>
                        </div>
                        <div className="h-2 bg-accent/30 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                            style={{ width: `${(cat.count / (data?.postCount || 1)) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                 </div>
               )}
            </AnalyticsCard>

            <AnalyticsCard title="Últimas Publicações">
            {loading ? (
               <div className="py-8 text-center text-muted-foreground">Carregando posts...</div>
            ) : error ? (
               <div className="py-8 text-center text-rose-500">{error}</div>
            ) : data?.latestPosts.length === 0 ? (
               <div className="py-8 text-center text-muted-foreground">Nenhum post encontrado.</div>
            ) : (
              <div className="space-y-4">
                {data?.latestPosts.map((post) => (
                  <div key={post.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-accent/30 transition-all">
                    <div className="space-y-1">
                      <h3 className="font-medium text-foreground line-clamp-1" dangerouslySetInnerHTML={{ __html: post.title.rendered }}></h3>
                      <p className="text-xs text-muted-foreground">
                        Publicado em: {new Date(post.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <a href={post.link} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </AnalyticsCard>
          </div>

          <div className="space-y-6">
            <AnalyticsCard title="Resumo Geral">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-accent/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-blue-500" />
                    <span className="text-sm font-medium">Média de Posts/Mês</span>
                  </div>
                  <span className="font-bold">{(data?.postCount || 0) > 0 ? Math.round(data!.postCount / 12) : 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-accent/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-emerald-500" />
                    <span className="text-sm font-medium">Autores Ativos</span>
                  </div>
                  <span className="font-bold">{data?.usersCount || 0}</span>
                </div>
              </div>
            </AnalyticsCard>

            <AnalyticsCard title="Configuração da Conexão">
              <div className="space-y-4">
                 <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                   <p className="text-sm font-medium text-primary mb-1">Status da URL</p>
                   <p className="text-xs text-muted-foreground truncate">{wpConn.config.url}</p>
                 </div>
                 <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                   <p className="text-sm font-medium text-emerald-500 mb-1">Usuário Autenticado</p>
                   <p className="text-xs text-muted-foreground">{wpConn.config.user}</p>
                 </div>
                 <Link to="/settings" className="block w-full">
                   <Button variant="outline" className="w-full">Alterar Conexão</Button>
                 </Link>
              </div>
            </AnalyticsCard>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BlogAnalytics;
