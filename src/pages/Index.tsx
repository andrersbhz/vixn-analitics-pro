import DashboardLayout from "@/components/DashboardLayout";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell } from 'recharts';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useConnections } from "@/hooks/use-connections";
import { fetchWordPressData, WordPressStats } from "@/lib/wordpress";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Users, 
  Eye, 
  MousePointer2, 
  Globe, 
  DollarSign
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

} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const StatsCard = ({ title, value, change, trend, icon: Icon }: any) => (
  <Card>
     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
       <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
       <Icon className="h-4 w-4 text-muted-foreground" />
     </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className={cn(
         "text-xs mt-1 flex items-center",
         trend === "up" ? "text-emerald-500" : "text-rose-500"
       )}>
        {trend === "up" ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
        {change} em relação ao mês anterior
      </p>
    </CardContent>
  </Card>
);

const Index = () => {
   const { connections, getConnection, items, loading } = useConnections();
   const wpConn = getConnection('wordpress');
   const ytConn = getConnection('youtube');
   const fbConn = getConnection('facebook');
   const adsenseConn = getConnection('adsense');
 
   const ytCount = items.filter(i => i.platform_id === 'youtube').length;
   const wpCount = items.filter(i => i.platform_id === 'wordpress').length;
   const fbCount = items.filter(i => i.platform_id === 'facebook').length;

  const isAnyConnected = connections.some(c => c.isConnected);

  return (
    <DashboardLayout>
      <div className="space-y-8">
         <div>
           <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
           <p className="text-muted-foreground mt-2">Visão geral do seu crescimento em todas as plataformas.</p>
         </div>

        {!isAnyConnected ? (
          <div className="p-12 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center text-center space-y-4 bg-accent/20">
            <div className="p-4 bg-primary/10 rounded-full">
              <Globe className="h-10 w-10 text-primary" />
            </div>
            <div className="max-w-md">
              <h2 className="text-xl font-bold">Nenhuma plataforma conectada</h2>
              <p className="text-muted-foreground mt-1">Conecte seu YouTube, Blog ou Facebook Ads para ver seus dados reais aqui.</p>
            </div>
            <Link to="/settings">
              <Button className="px-6 py-2">Configurar Conexões</Button>
            </Link>
          </div>
        ) : (
          <>
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
               <StatsCard 
                 title="Posts no Blog" 
                 value={wpConn?.isConnected ? wpCount : "---"} 
                 change={wpConn?.isConnected ? "Posts reais" : "0%"} 
                 trend="up" 
                 icon={Globe} 
               />
               <StatsCard 
                 title="Vídeos YouTube" 
                 value={ytConn?.isConnected ? ytCount : "---"} 
                 change={ytConn?.isConnected ? "Vídeos sincronizados" : "0%"} 
                 trend="up" 
                 icon={Youtube} 
               />
               <StatsCard 
                 title="Facebook Ads" 
                 value={fbConn?.isConnected ? "Monitorando" : "---"} 
                 change={fbConn?.isConnected ? "Conta: " + fbConn.config.id : "0%"} 
                 trend="up" 
                 icon={Facebook} 
               />
               <StatsCard 
                 title="Google AdSense"
                 value={adsenseConn?.isConnected ? "Ativo" : "---"} 
                 change={adsenseConn?.isConnected ? "ID: " + adsenseConn.config.id : "0%"} 
                 trend="up" 
                 icon={DollarSign} 
               />
             </div>

             <div className="grid gap-6">
               <Card className="shadow-sm border-muted/20">
                 <CardHeader>
                   <CardTitle>Atividades Recentes</CardTitle>
                   <CardDescription>Últimos itens sincronizados de todas as plataformas.</CardDescription>
                 </CardHeader>
                 <CardContent>
                   {loading ? (
                     <div className="py-8 text-center text-muted-foreground">Carregando atividades...</div>
                   ) : items.length === 0 ? (
                     <div className="py-12 text-center text-muted-foreground">
                       Nenhuma atividade real sincronizada ainda. 
                       <Link to="/settings" className="text-primary ml-1 hover:underline">Vá para configurações para sincronizar.</Link>
                     </div>
                   ) : (
                     <div className="space-y-4">
                       {items.slice(0, 6).map((item) => (
                         <div key={item.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-accent/30 transition-all">
                           <div className="flex items-center gap-4">
                             <div className={cn(
                               "p-2 rounded-lg",
                               item.platform_id === 'youtube' ? "bg-red-500/10 text-red-500" :
                               item.platform_id === 'wordpress' ? "bg-blue-500/10 text-blue-500" :
                               "bg-indigo-500/10 text-indigo-500"
                             )}>
                               {item.platform_id === 'youtube' ? <Youtube className="h-5 w-5" /> : 
                                item.platform_id === 'wordpress' ? <Globe className="h-5 w-5" /> : 
                                <Facebook className="h-5 w-5" />}
                             </div>
                             <div>
                               <p className="font-medium text-foreground line-clamp-1" dangerouslySetInnerHTML={{ __html: item.title }}></p>
                               <p className="text-xs text-muted-foreground">
                                 {item.platform_id === 'youtube' ? 'Vídeo no YouTube' : 
                                  item.platform_id === 'wordpress' ? 'Post no Blog' : 'Facebook Page'}
                               </p>
                             </div>
                           </div>
                           <a href={item.link} target="_blank" rel="noopener noreferrer">
                             <Button variant="ghost" size="sm">
                               <ArrowUpRight className="h-4 w-4" />
                             </Button>
                           </a>
                         </div>
                       ))}
                     </div>
                   )}
                 </CardContent>
               </Card>
             </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Index;
