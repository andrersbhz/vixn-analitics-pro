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
import { useState } from "react";
import { toast } from "sonner";
import { 
  Youtube as YoutubeIcon, 
  Facebook as FacebookIcon, 
  Globe as WordPressIcon, 
  ExternalLink, 
  Info,
  CheckCircle2,
  XCircle
} from "lucide-react";

const Settings = () => {
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
                {[
                  { 
                    name: "YouTube", 
                    id: "youtube",
                    icon: <YoutubeIcon className="h-6 w-6 text-red-500" />, 
                    link: "https://studio.youtube.com",
                    instructions: "Para conectar, vá ao YouTube Studio, acesse 'Estatísticas' e copie o ID do seu Canal nas configurações avançadas.",
                    placeholder: "Ex: UCxxxxxxxxxxxxxxxxxxxx"
                  },
                  { 
                    name: "WordPress / Blog", 
                    id: "wordpress",
                    icon: <WordPressIcon className="h-6 w-6 text-blue-500" />, 
                    link: "https://wordpress.org/plugins/application-passwords/",
                    instructions: "Instale o plugin 'Application Passwords' ou use a função nativa do WP 5.6+. Gere uma senha de aplicativo para o seu usuário.",
                    placeholder: "https://seu-site.com"
                  },
                  { 
                    name: "Facebook Ads", 
                    id: "facebook",
                    icon: <FacebookIcon className="h-6 w-6 text-indigo-500" />, 
                    link: "https://adsmanager.facebook.com",
                    instructions: "Acesse o Gerenciador de Anúncios, vá em 'Configurações do Negócio' > 'Contas de Anúncios' e copie o ID da conta.",
                    placeholder: "Ex: 123456789012345"
                  },
                ].map((conn) => {
                  const [isConnected, setIsConnected] = useState(false);
                  const [value, setValue] = useState("");

                  const handleConnect = () => {
                    if (!value) {
                      toast.error(`Por favor, insira o identificador do ${conn.name}`);
                      return;
                    }
                    setIsConnected(true);
                    toast.success(`${conn.name} conectado com sucesso para testes!`);
                  };

                  const handleDisconnect = () => {
                    setIsConnected(false);
                    setValue("");
                    toast.info(`${conn.name} desconectado.`);
                  };

                  return (
                    <div key={conn.id} className="p-5 border rounded-2xl bg-card/50 space-y-4 transition-all hover:border-primary/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-background rounded-lg border">
                            {conn.icon}
                          </div>
                          <div>
                            <p className="font-bold text-foreground text-lg">{conn.name}</p>
                            <div className="flex items-center gap-2">
                              <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                              <span className="text-xs font-medium text-muted-foreground">
                                {isConnected ? "Conectado e Ativo" : "Desconectado"}
                              </span>
                            </div>
                          </div>
                        </div>
                        {isConnected ? (
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

                      {!isConnected && (
                        <div className="space-y-3 pt-2">
                          <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg border border-primary/10">
                            <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {conn.instructions}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              value={value}
                              onChange={(e) => setValue(e.target.value)}
                              placeholder={conn.placeholder}
                              className="flex-1 bg-background border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            />
                            <Button onClick={handleConnect}>Conectar</Button>
                          </div>
                        </div>
                      )}

                      {isConnected && (
                        <div className="flex items-center gap-2 p-2 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          <span className="text-xs text-emerald-600 font-medium">Dados de teste sincronizados com sucesso.</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </AnalyticsCard>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
