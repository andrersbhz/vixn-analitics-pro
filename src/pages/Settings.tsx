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
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useConnections } from "@/hooks/use-connections";
import { useBrand } from "@/hooks/use-brand";
import { 
  ExternalLink, 
  Info,
  CheckCircle2,
  XCircle,
  DollarSign
} from "lucide-react";

const WordPressIcon = Globe;
const JetpackIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.001 0C5.385 0 0 5.385 0 12.001c0 6.616 5.385 12 12.001 12 6.616 0 12-5.384 12-12C24.001 5.385 18.617 0 12.001 0zm.012 21.933l-4.464-12.44 2.894-.002 1.564 4.887 1.587-4.885 2.87-.002-4.451 12.442z"/>
  </svg>
);

const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const ADSENSE_CANONICAL_ORIGIN = "https://analitics.a3solucoesdigitais.com";
const getAdsenseCallbackUrl = () => `${ADSENSE_CANONICAL_ORIGIN}/adsense/oauth/callback`;

const ConnectionItem = ({ conn, onUpdate, onTestSync, autoSyncTrigger }: { conn: any, onUpdate: any, onTestSync: any, autoSyncTrigger?: boolean }) => {
  const [config, setConfig] = useState(conn.config || {});
  const [isTesting, setIsTesting] = useState(false);
  const [syncLog, setSyncLog] = useState<string | null>(null);
  const [oauthLoading, setOauthLoading] = useState(false);
  const hasAutoSynced = useRef(false);
  
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

  const handleAdsenseOAuth = async () => {
    setOauthLoading(true);
    const oauthWindow = window.open("about:blank", "_blank");
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const callbackUrl = getAdsenseCallbackUrl();
      const { data, error } = await supabase.functions.invoke("adsense-oauth-start", {
        body: {
          return_to: `${ADSENSE_CANONICAL_ORIGIN}/settings`,
          redirect_uri: callbackUrl
        }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.auth_url) {
        if (oauthWindow) {
          oauthWindow.location.href = data.auth_url;
          toast.info("Continue a autorização do Google na nova aba.");
        } else {
          window.location.href = data.auth_url;
        }
      }
    } catch (e: any) {
      oauthWindow?.close();
      toast.error(e.message || "Falha ao iniciar OAuth do AdSense");
    } finally {
      setOauthLoading(false);
    }
  };

  const copyAdsenseCallbackUrl = async () => {
    const callbackUrl = getAdsenseCallbackUrl();
    await navigator.clipboard.writeText(callbackUrl);
    toast.success("URL OAuth copiada");
  };

  useEffect(() => {
    if (autoSyncTrigger && conn.isConnected && !hasAutoSynced.current && !isTesting) {
      hasAutoSynced.current = true;
      handleTestSync();
    }
  }, [autoSyncTrigger, conn.isConnected]);

  return (
    <div className="p-5 border rounded-2xl bg-card/50 space-y-4 transition-all hover:border-primary/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-background rounded-lg border">
            {conn.icon}
          </div>
          <div>
            <p className="font-light text-foreground text-lg tracking-wide uppercase">{conn.name}</p>
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
          {conn.helpUrl && (
            <a
              href={conn.helpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[10px] text-primary/80 hover:text-primary underline underline-offset-2"
            >
              <ExternalLink className="h-3 w-3" /> Como fazer esta integração (passo a passo)
            </a>
          )}
          
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
            ) : conn.id === 'adsense' ? (
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">URL de redirecionamento OAuth2</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={getAdsenseCallbackUrl()}
                    readOnly
                    className="flex-1 bg-background border rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={copyAdsenseCallbackUrl} className="h-10">
                    Copiar URL
                  </Button>
                </div>
              </div>
            ) : (
              <input 
                type="text" 
                value={config.id || ""}
                onChange={(e) => updateConfig('id', e.target.value)}
                placeholder={conn.placeholder}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/40 outline-none transition-all focus:bg-white/10"
              />
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              {conn.id !== 'adsense' && (
                <Button onClick={handleConnect} className="flex-1 h-11">
                  {conn.id === 'wordpress' ? 'Conectar via API' : 'Conectar com ID'}
                </Button>
              )}
              {conn.id === 'wordpress' && (
                <Button 
                  variant="outline" 
                  className="flex-1 h-11 border-[#00AADC]/30 hover:bg-[#00AADC]/10 text-[#00AADC] font-bold gap-2"
                  onClick={() => {
                    toast.info("Iniciando conexão segura com Jetpack...");
                    // Simulação de fluxo OAuth Jetpack
                    setTimeout(() => {
                      onUpdate(conn.id, { method: 'jetpack', connected: 'true' }, true);
                      toast.success("Jetpack conectado com sucesso!");
                    }, 1500);
                  }}
                >
                  <JetpackIcon className="h-5 w-5" />
                  Conectar Jetpack
                </Button>
              )}
              {conn.id === 'adsense' && (
                <Button
                  variant="default"
                  className="flex-1 h-11 border-yellow-500/30 hover:bg-yellow-500/10 text-yellow-500 gap-2"
                  onClick={handleAdsenseOAuth}
                  disabled={oauthLoading}
                >
                  <DollarSign className="h-5 w-5" />
                  {oauthLoading ? "Abrindo Google..." : "Conectar via Google OAuth"}
                </Button>
              )}
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

      {conn.helpUrl && (
        <p className="text-[10px] text-muted-foreground/70 leading-relaxed">
          <span className="font-medium text-muted-foreground">Dica:</span> {conn.shortHelp}{" "}
          <a href={conn.helpUrl} target="_blank" rel="noopener noreferrer" className="text-primary/80 hover:text-primary underline underline-offset-2">
            ver instruções
          </a>
        </p>
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
  const { connections, updateConnection, testSync, loading, items } = useConnections();
  const hasNoVideos = items.filter(i => i.platform_id === 'youtube').length === 0;
  const { profile, save: saveBrand } = useBrand();
  const [form, setForm] = useState({ fullName: "", email: "", brandName: "", logoUrl: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  useEffect(() => {
    setForm({
      fullName: profile.fullName || "",
      email: profile.email || "",
      brandName: profile.brandName || "",
      logoUrl: profile.logoUrl || "",
    });
  }, [profile.fullName, profile.email, profile.brandName, profile.logoUrl]);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await saveBrand(form);
      if (res.ok) toast.success("Perfil salvo com sucesso!");
      else if (res.reason === "not_authenticated") toast.warning("Salvo localmente. Faça login para sincronizar na nuvem.");
      else toast.error(`Erro ao salvar: ${res.reason}`);
    } finally {
      setSavingProfile(false);
    }
  };

  const connectionDetails = [
    { 
      id: "youtube",
      name: "YouTube", 
      icon: <YoutubeIcon className="h-6 w-6 text-red-500" />, 
      link: "https://studio.youtube.com",
      instructions: "Para conectar, vá ao YouTube Studio, acesse 'Estatísticas' e copie o ID do seu Canal nas configurações avançadas.",
      placeholder: "Ex: UCxxxxxxxxxxxxxxxxxxxx",
      helpUrl: "https://support.google.com/youtube/answer/3250431",
      shortHelp: "Pegue seu Channel ID em YouTube Studio → Configurações → Canal → Avançado."
    },
    { 
      id: "wordpress",
      name: "WordPress / Blog", 
      icon: <WordPressIcon className="h-6 w-6 text-blue-500" />, 
      link: "https://wordpress.org/support/article/application-passwords/",
      instructions: "Vá em Usuários > Perfil no seu WordPress. Role até 'Senhas de Aplicativo', dê um nome e gere uma senha.",
      placeholder: "https://seu-site.com",
      helpUrl: "https://wordpress.org/documentation/article/application-passwords/",
      shortHelp: "Gere uma Senha de Aplicativo em Usuários → Perfil e use com seu usuário WP."
    },
    { 
      id: "facebook",
      name: "Facebook Ads", 
      icon: <FacebookIcon className="h-6 w-6 text-indigo-500" />, 
      link: "https://adsmanager.facebook.com",
      instructions: "Acesse o Gerenciador de Anúncios, vá em 'Configurações do Negócio' > 'Contas de Anúncios' e copie o ID da conta.",
      placeholder: "Ex: 123456789012345",
      helpUrl: "https://www.facebook.com/business/help/1492627900875762",
      shortHelp: "Copie o Ad Account ID em Business Settings → Contas de Anúncios."
    },
    { 
      id: "adsense",
      name: "Google AdSense", 
      icon: <DollarSign className="h-6 w-6 text-yellow-600" />, 
      link: "https://adsense.google.com/start/management-api/",
      instructions: "Use a URL OAuth2 oficial abaixo no Google Cloud, salve no Client ID e conecte para buscar ganhos reais.",
      placeholder: "Ex: pub-xxxxxxxxxxxxxxxx",
      helpUrl: "https://developers.google.com/adsense/management/getting-started",
      shortHelp: "Cadastre a URL de callback no Google Cloud. Se aparecer 403, deixe o consentimento como Externo e adicione seu e-mail como usuário de teste."
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
             <h1 className="text-3xl font-extralight text-foreground tracking-tight">Configurações</h1>
             <p className="text-muted-foreground mt-1 font-light italic opacity-80">Gerencie sua conta e conexões de plataforma.</p>
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
                   <input
                     type="text"
                     value={form.fullName}
                     onChange={(e) => setForm(f => ({ ...f, fullName: e.target.value }))}
                     className="w-full p-2 border rounded-md bg-background text-foreground"
                     placeholder="Seu nome"
                   />
                 </div>
                 <div className="grid gap-2">
                   <label className="text-sm font-medium text-foreground">Email</label>
                   <input
                     type="email"
                     value={form.email}
                     onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                     className="w-full p-2 border rounded-md bg-background text-foreground"
                     placeholder="voce@email.com"
                   />
                 </div>
                 <div className="grid gap-2 pt-2 border-t">
                   <label className="text-sm font-medium text-foreground">Nome do Sistema / Marca</label>
                   <input
                     type="text"
                     value={form.brandName}
                     onChange={(e) => setForm(f => ({ ...f, brandName: e.target.value }))}
                     className="w-full p-2 border rounded-md bg-background text-foreground"
                     placeholder="Ex: Minha Marca Pro"
                   />
                   <p className="text-[10px] text-muted-foreground">Aparece no topo da sidebar e no cabeçalho.</p>
                 </div>
                 <div className="grid gap-2">
                   <label className="text-sm font-medium text-foreground">URL do Logo</label>
                   <input
                     type="url"
                     value={form.logoUrl}
                     onChange={(e) => setForm(f => ({ ...f, logoUrl: e.target.value }))}
                     className="w-full p-2 border rounded-md bg-background text-foreground"
                     placeholder="https://.../logo.png"
                   />
                   {form.logoUrl && (
                     <img src={form.logoUrl} alt="Prévia do logo" className="h-10 w-10 rounded object-cover border" />
                   )}
                 </div>
                <Button className="mt-2" onClick={handleSaveProfile} disabled={savingProfile}>
                  {savingProfile ? "Salvando..." : "Salvar Alterações"}
                </Button>
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
                      autoSyncTrigger={detail.id === 'youtube' && hasNoVideos}
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
