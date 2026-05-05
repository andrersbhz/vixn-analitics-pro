 import DashboardLayout from "@/components/DashboardLayout";
 import { AnalyticsCard } from "@/components/analytics/AnalyticsCard";
 import { useConnections } from "@/hooks/use-connections";
 import { Facebook, AlertCircle } from "lucide-react";
 import { Link } from "react-router-dom";
 import { Button } from "@/components/ui/button";
 
 const FacebookPages = () => {
   const { getConnection, items, loading } = useConnections();
   const fbConn = getConnection('facebook');
   const fbItems = items.filter(item => item.platform_id === 'facebook');
 
   if (!fbConn?.isConnected) {
     return (
       <DashboardLayout>
         <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
           <div className="p-4 bg-indigo-500/10 rounded-full">
             <Facebook className="h-12 w-12 text-indigo-500" />
           </div>
           <h2 className="text-2xl font-bold">Facebook não conectado</h2>
           <p className="text-muted-foreground text-center max-w-md">
             Insira o ID da sua conta de anúncios ou página nas configurações para monitorar dados reais.
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
            <div className="p-3 bg-indigo-500/10 rounded-xl">
              <Facebook className="h-8 w-8 text-indigo-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Facebook Analytics</h1>
              <p className="text-muted-foreground mt-1">Dados reais da sua conta: {fbConn.config.id}</p>
            </div>
         </div>
 
         <div className="grid gap-6">
            <AnalyticsCard title="Status da Conexão">
               <div className="flex items-center gap-4 p-6 bg-accent/20 rounded-2xl border border-dashed">
                 <div className="p-3 bg-emerald-500/10 rounded-full">
                   <AlertCircle className="h-6 w-6 text-emerald-500" />
                 </div>
                 <div>
                   <h3 className="font-bold">Pronto para Sincronização</h3>
                   <p className="text-sm text-muted-foreground">O ID foi validado. Os dados aparecerão aqui após a próxima sincronização automática ou manual.</p>
                 </div>
               </div>
            </AnalyticsCard>
         </div>
 
         {fbItems.length > 0 && (
           <div className="grid gap-6">
             <AnalyticsCard title="Páginas/Posts Encontrados">
               <div className="space-y-4">
                 {fbItems.map(item => (
                   <div key={item.id} className="p-4 border rounded-xl">
                     <p className="font-medium">{item.title}</p>
                     <p className="text-xs text-muted-foreground mt-1">ID Externo: {item.external_id}</p>
                   </div>
                 ))}
               </div>
             </AnalyticsCard>
           </div>
         )}
       </div>
     </DashboardLayout>
   );
 };

export default FacebookPages;
