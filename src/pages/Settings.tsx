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

const Settings = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-100 rounded-xl">
            <SettingsIcon className="h-8 w-8 text-slate-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Configurações</h1>
            <p className="text-slate-500 mt-1">Gerencie sua conta e conexões de plataforma.</p>
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
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${item.active ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-100"}`}
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
                  <label className="text-sm font-medium text-slate-700">Nome Completo</label>
                  <input type="text" className="w-full p-2 border rounded-md" defaultValue="Admin User" />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-slate-700">Email</label>
                  <input type="email" className="w-full p-2 border rounded-md" defaultValue="admin@growthsuite.pro" />
                </div>
                <Button className="mt-2">Salvar Alterações</Button>
              </div>
            </AnalyticsCard>

            <AnalyticsCard title="Plataformas Conectadas">
              <div className="space-y-4">
                {[
                  { name: "YouTube", status: "Conectado", date: "Há 2 meses", icon: "🔴" },
                  { name: "WordPress", status: "Conectado", date: "Há 1 mês", icon: "🌐" },
                  { name: "Facebook", status: "Conectado", date: "Há 3 meses", icon: "🔵" },
                ].map((conn, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{conn.icon}</span>
                      <div>
                        <p className="font-bold text-slate-900">{conn.name}</p>
                        <p className="text-xs text-slate-500">Sincronizado {conn.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded">{conn.status}</span>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">Desconectar</Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full border-dashed">
                  + Conectar Nova Plataforma
                </Button>
              </div>
            </AnalyticsCard>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
