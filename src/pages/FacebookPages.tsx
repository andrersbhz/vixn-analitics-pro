 import DashboardLayout from "@/components/DashboardLayout";
 import { AnalyticsCard } from "@/components/analytics/AnalyticsCard";
 import { useConnections } from "@/hooks/use-connections";
import { AlertCircle } from "lucide-react";

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);
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
              <FacebookIcon className="h-12 w-12 text-indigo-500" />
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
               <FacebookIcon className="h-8 w-8 text-indigo-500" />
            </div>
            <div>
               <h1 className="text-3xl font-extralight text-foreground tracking-tight">Facebook Analytics</h1>
               <p className="text-muted-foreground mt-1 font-light italic opacity-80">Dados reais da sua conta: {fbConn.config.id}</p>
            </div>
         </div>
 
         <div className="grid gap-6">
            <AnalyticsCard title="Status da Conexão">
               <div className="flex items-center gap-4 p-6 bg-accent/20 rounded-2xl border border-dashed">
                 <div className="p-3 bg-emerald-500/10 rounded-full">
                   <AlertCircle className="h-6 w-6 text-emerald-500" />
                 </div>
                 <div>
                    <h3 className="font-light text-foreground uppercase tracking-widest text-sm">Pronto para Sincronização</h3>
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
