import DashboardLayout from "@/components/DashboardLayout";
import { AnalyticsCard } from "@/components/analytics/AnalyticsCard";
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Lock, 
  Link as LinkIcon,
  Palette,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useConnections } from "@/hooks/use-connections";
import { 
  Youtube as YoutubeIcon, 
  Facebook as FacebookIcon, 
  Globe as WordPressIcon, 
  ExternalLink, 
  Info,
  CheckCircle2,
  XCircle,
  DollarSign
} from "lucide-react";

const ConnectionItem = ({ conn, onUpdate, onTestSync }: { conn: any, onUpdate: any, onTestSync: any }) => {
  const [config, setConfig] = useState(conn.config || {});
  const [isTesting, setIsTesting] = useState(false);
  const [syncLog, setSyncLog] = useState<string | null>(null);
  
  const handleConnect = () => {
    if (conn.id === 'wordpress') {
      if (!config.url || !config.user || !config.password) {
        toast.error("Por favor, preencha todos os campos do WordPress");
        return;
      }
    } else if (!config.id) {
      toast.error(`Por favor, insira o identificador do ${conn.name}`);
      return;
    }
    onUpdate(conn.id, config, true);
    toast.success(`${conn.name} conectado com sucesso!`);
  };

  const handleDisconnect = () => {
    onUpdate(conn.id, {}, false);
    setConfig({});
    toast.info(`${conn.name} desconectado.`);
  };

  const updateConfig = (key: string, value: string) => {
    setConfig((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleTestSync = async () => {
    setIsTesting(true);
    setSyncLog("Iniciando teste...");
    try {
      const result = await onTestSync(conn.id);
      setSyncLog(result.log);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="p-5 border rounded-2xl bg-card/50 space-y-4 transition-all hover:border-primary/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-background rounded-lg border">
            {conn.icon}
          </div>
          <div>
            <p className="font-bold text-foreground text-lg">{conn.name}</p>
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${conn.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
              <span className="text-xs font-medium text-muted-foreground">
                {conn.isConnected ? (
                  <>Conectado • <span className="opacity-70">Sincronizado {conn.last_sync_at ? new Date(conn.last_sync_at).toLocaleTimeString() : 'Recentemente'}</span></>
                ) : (
                  "Desconectado"
                )}
              </span>
            </div>
          </div>
        </div>
        {conn.isConnected ? (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDisconnect}
            className="text-destructive border-destructive/20 hover:bg-destructive/10"
          >
            <XCircle className="h-4 w-4 mr-2" /> Desconectar
          </Button>
        ) : (
          <a href={conn.link} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="sm" className="text-primary">
              <ExternalLink className="h-4 w-4 mr-2" /> Obter Info
            </Button>
          </a>
        )}
      </div>

      {!conn.isConnected && (
        <div className="space-y-3 pt-2">
          <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg border border-primary/10">
            <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              {conn.instructions}
            </p>
          </div>
          
          <div className="grid gap-3">
            {conn.id === 'wordpress' ? (
              <>
                <input 
                  type="text" 
                  value={config.url || ""}
                  onChange={(e) => updateConfig('url', e.target.value)}
                  placeholder="URL do Blog (ex: https://meusite.com)"
                  className="bg-background border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="text" 
                    value={config.user || ""}
                    onChange={(e) => updateConfig('user', e.target.value)}
                    placeholder="Usuário"
                    className="bg-background border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                  <input 
                    type="password" 
                    value={config.password || ""}
                    onChange={(e) => updateConfig('password', e.target.value)}
                    placeholder="Senha de Aplicativo"
                    className="bg-background border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
              </>
            ) : (
              <input 
                type="text" 
                value={config.id || ""}
                onChange={(e) => updateConfig('id', e.target.value)}
                placeholder={conn.placeholder}
                className="bg-background border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            )}
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={handleConnect} className="flex-1">
                Conectar com ID
              </Button>
            </div>
          </div>
        </div>
      )}

      {conn.isConnected && (
        <div className="flex items-center gap-2 p-2 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <span className="text-xs text-emerald-600 font-medium">Conectado e validado.</span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-auto text-[10px] h-6 px-2 bg-emerald-500/10 hover:bg-emerald-500/20"
            onClick={handleTestSync}
            disabled={isTesting}
          >
            {isTesting ? "Testando..." : "Testar Sincronização"}
          </Button>
        </div>
      )}

      {syncLog && (
        <div className="mt-3 p-3 bg-slate-900 rounded-lg border border-slate-800 font-mono text-[10px] text-slate-300 overflow-x-auto">
          <div className="flex justify-between items-center mb-1 pb-1 border-b border-slate-800">
            <span className="text-slate-500 uppercase">Logs de Sincronização</span>
            <button onClick={() => setSyncLog(null)} className="hover:text-white">Fechar</button>
          </div>
          <pre className="whitespace-pre-wrap">
            {syncLog}
          </pre>
        </div>
      )}
    </div>
  );
};

const Settings = () => {
  const { connections, updateConnection, testSync, loading } = useConnections();

  const connectionDetails = [
    { 
      id: "youtube",
      name: "YouTube", 
      icon: <YoutubeIcon className="h-6 w-6 text-red-500" />, 
      link: "https://studio.youtube.com",
      instructions: "Para conectar, vá ao YouTube Studio, acesse 'Estatísticas' e copie o ID do seu Canal nas configurações avançadas.",
      placeholder: "Ex: UCxxxxxxxxxxxxxxxxxxxx"
    },
    { 
      id: "wordpress",
      name: "WordPress / Blog", 
      icon: <WordPressIcon className="h-6 w-6 text-blue-500" />, 
      link: "https://wordpress.org/support/article/application-passwords/",
      instructions: "Vá em Usuários > Perfil no seu WordPress. Role até 'Senhas de Aplicativo', dê um nome e gere uma senha.",
      placeholder: "https://seu-site.com"
    },
    { 
      id: "facebook",
      name: "Facebook Ads", 
      icon: <FacebookIcon className="h-6 w-6 text-indigo-500" />, 
      link: "https://adsmanager.facebook.com",
      instructions: "Acesse o Gerenciador de Anúncios, vá em 'Configurações do Negócio' > 'Contas de Anúncios' e copie o ID da conta.",
      placeholder: "Ex: 123456789012345"
    },
    { 
      id: "adsense",
      name: "Google AdSense", 
      icon: <DollarSign className="h-6 w-6 text-yellow-600" />, 
      link: "https://adsense.google.com/start/management-api/",
      instructions: "Insira seu ID de publicador do AdSense para identificação e acompanhamento de ganhos.",
      placeholder: "Ex: pub-xxxxxxxxxxxxxxxx"
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center gap-3">
           <div className="p-3 bg-accent/50 rounded-xl">
             <SettingsIcon className="h-8 w-8 text-muted-foreground" />
           </div>
           <div>
             <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
             <p className="text-muted-foreground mt-1">Gerencie sua conta e conexões de plataforma.</p>
           </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-4">
          <div className="lg:col-span-1 space-y-1">
            {[
              { label: "Perfil", icon: User, active: true },
              { label: "Notificações", icon: Bell },
              { label: "Segurança", icon: Lock },
              { label: "Conexões", icon: LinkIcon },
              { label: "Aparência", icon: Palette },
              { label: "Idioma", icon: Globe },
            ].map((item, i) => (
              <button 
                key={i} 
               className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${item.active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
             >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </div>

          <div className="lg:col-span-3 space-y-6">
            {loading && (
              <div className="flex items-center justify-center p-12 bg-card rounded-2xl border animate-pulse">
                <p className="text-muted-foreground">Carregando conexões do banco...</p>
              </div>
            )}
            {!loading && (
              <>
            <AnalyticsCard title="Informações Pessoais">
              <div className="space-y-4 max-w-xl">
                 <div className="grid gap-2">
                   <label className="text-sm font-medium text-foreground">Nome Completo</label>
                   <input type="text" className="w-full p-2 border rounded-md bg-background text-foreground" defaultValue="Admin User" />
                 </div>
                 <div className="grid gap-2">
                   <label className="text-sm font-medium text-foreground">Email</label>
                   <input type="email" className="w-full p-2 border rounded-md bg-background text-foreground" defaultValue="admin@growthsuite.pro" />
                 </div>
                <Button className="mt-2">Salvar Alterações</Button>
              </div>
            </AnalyticsCard>

            <AnalyticsCard title="Plataformas Conectadas">
              <div className="space-y-6">
                {connectionDetails.map((detail) => {
                  const conn = connections.find(c => c.id === detail.id) || { ...detail, isConnected: false, config: {} };
                  return (
                    <ConnectionItem 
                      key={detail.id} 
                      conn={{ ...detail, ...conn }} 
                      onUpdate={updateConnection} 
                      onTestSync={testSync}
                    />
                  );
                })}
              </div>
            </AnalyticsCard>
            </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
