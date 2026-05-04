import DashboardLayout from "@/components/DashboardLayout";
import { AnalyticsCard } from "@/components/analytics/AnalyticsCard";
import { 
  Globe, 
  Search, 
  Users, 
  MousePointer2, 
  Clock,
  ArrowUp
} from "lucide-react";

const BlogAnalytics = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Globe className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Blog Analytics</h1>
            <p className="text-slate-500 mt-1">Monitore o desempenho do seu site ou WordPress.</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          {[
            { label: "Sessões Ativas", value: "1,240", icon: Users, color: "text-blue-600" },
            { label: "Cliques (Google)", value: "845", icon: MousePointer2, color: "text-orange-600" },
            { label: "Tempo Médio", value: "2:45", icon: Clock, color: "text-emerald-600" },
            { label: "Posição Média", value: "4.2", icon: Search, color: "text-indigo-600" },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-5 rounded-xl border shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-slate-50 rounded-lg">
                  <stat.icon className={stat.color + " h-5 w-5"} />
                </div>
                <div className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                  <ArrowUp className="h-3 w-3 mr-1" /> 12%
                </div>
              </div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <AnalyticsCard title="Palavras-chave em Alta" className="lg:col-span-2">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs font-semibold text-slate-500 uppercase tracking-wider border-b">
                    <th className="pb-3 px-2">Palavra-chave</th>
                    <th className="pb-3 px-2">Cliques</th>
                    <th className="pb-3 px-2">Impressões</th>
                    <th className="pb-3 px-2">CTR</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {[
                    { kw: "estratégias de marketing 2024", clicks: "450", imp: "5.2k", ctr: "8.6%" },
                    { kw: "como crescer blog rápido", clicks: "320", imp: "4.1k", ctr: "7.8%" },
                    { kw: "melhores plugins wordpress", clicks: "280", imp: "3.8k", ctr: "7.3%" },
                    { kw: "seo para youtube guia", clicks: "150", imp: "2.5k", ctr: "6.0%" },
                  ].map((row, i) => (
                    <tr key={i} className="text-sm hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-2 font-medium text-slate-700">{row.kw}</td>
                      <td className="py-4 px-2 text-slate-600">{row.clicks}</td>
                      <td className="py-4 px-2 text-slate-600">{row.imp}</td>
                      <td className="py-4 px-2 font-semibold text-blue-600">{row.ctr}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AnalyticsCard>

          <AnalyticsCard title="Origens de Tráfego">
            <div className="space-y-6 mt-2">
              {[
                { label: "Orgânico (Google)", value: 65, color: "bg-blue-500" },
                { label: "Redes Sociais", value: 20, color: "bg-emerald-500" },
                { label: "Direto", value: 10, color: "bg-orange-500" },
                { label: "Outros", value: 5, color: "bg-slate-300" },
              ].map((origin, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-slate-600">{origin.label}</span>
                    <span className="text-slate-900">{origin.value}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={origin.color + " h-full transition-all duration-500"} 
                      style={{ width: `${origin.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </AnalyticsCard>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BlogAnalytics;
