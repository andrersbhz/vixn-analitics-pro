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
             <h1 className="text-3xl font-bold text-foreground">Blog Analytics</h1>
             <p className="text-muted-foreground mt-1">Monitore o desempenho do seu site ou WordPress.</p>
           </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
           {[
            { label: "Total de Posts", value: loading ? "..." : data?.postCount || "0", icon: FileText, color: "text-blue-600" },
            { label: "Site", value: loading ? "..." : data?.siteName || "N/A", icon: Globe, color: "text-emerald-600" },
            { label: "Status API", value: error ? "Erro" : "Ativo", icon: AlertCircle, color: error ? "text-rose-600" : "text-emerald-600" },
            { label: "Última Sinc.", value: "Agora", icon: Clock, color: "text-indigo-600" },
          ].map((stat, i) => (
             <div key={i} className="bg-card p-5 rounded-xl border shadow-sm">
               <div className="flex justify-between items-start mb-4">
                 <div className="p-2 bg-accent/50 rounded-lg">
                   <stat.icon className={stat.color + " h-5 w-5"} />
                 </div>
                 {!loading && !error && (
                   <div className="flex items-center text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">
                     Sincronizado
                   </div>
                 )}
               </div>
               <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
               <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
             </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <AnalyticsCard title="Últimas Publicações" className="lg:col-span-2">
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
    </DashboardLayout>
  );
};

export default BlogAnalytics;
