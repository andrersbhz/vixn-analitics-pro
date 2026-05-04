 import { useState, useEffect } from 'react';
 import { supabase } from '@/integrations/supabase/client';
 import { toast } from 'sonner';

 export interface Connection {
   id: string;
   name: string;
   isConnected: boolean;
   config: Record<string, string>;
 }

 export const useConnections = () => {
   const [connections, setConnections] = useState<Connection[]>([
     { id: 'youtube', name: 'YouTube', isConnected: false, config: {} },
     { id: 'wordpress', name: 'WordPress', isConnected: false, config: {} },
     { id: 'facebook', name: 'Facebook Ads', isConnected: false, config: {} },
   ]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
     const fetchConnections = async () => {
       try {
         const { data, error } = await supabase
           .from('platform_connections')
           .select('*');

         if (error) throw error;

         if (data && data.length > 0) {
           const formattedData = data.map(item => ({
             id: item.id,
             name: item.name,
             isConnected: item.is_connected,
             config: item.config
           }));
           setConnections(formattedData);
         }
       } catch (error) {
         console.error('Error fetching connections:', error);
       } finally {
         setLoading(false);
       }
     };

     fetchConnections();
   }, []);

   const updateConnection = async (id: string, config: Record<string, string>, isConnected: boolean) => {
     try {
       const { error } = await supabase
         .from('platform_connections')
         .update({ config, is_connected: isConnected, updated_at: new Date().toISOString() })
         .eq('id', id);

       if (error) throw error;

       setConnections(prev => prev.map(conn => 
         conn.id === id ? { ...conn, config, isConnected } : conn
       ));
     } catch (error) {
       console.error('Error updating connection:', error);
       toast.error('Erro ao salvar no banco de dados');
     }
   };

   const getConnection = (id: string) => connections.find(c => c.id === id);

   return { connections, updateConnection, getConnection, loading };
 };