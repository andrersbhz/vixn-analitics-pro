import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Connection {
  id: string;
  name: string;
  isConnected: boolean;
  config: Record<string, string>;
  sync_interval_minutes?: number;
  next_sync_at?: string;
}

export interface PlatformItem {
  id: string;
  platform_id: string;
  external_id: string;
  title: string;
  link: string;
  metadata: any;
  earnings?: number;
  views?: number;
  clicks?: number;
  rpm?: number;
  created_at: string;
}

export const useConnections = () => {
  const [connections, setConnections] = useState<Connection[]>([
    { id: 'youtube', name: 'YouTube', isConnected: false, config: {} },
    { id: 'wordpress', name: 'WordPress', isConnected: false, config: {} },
    { id: 'facebook', name: 'Facebook Ads', isConnected: false, config: {} },
    { id: 'adsense', name: 'Google AdSense', isConnected: false, config: {} },
  ]);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<PlatformItem[]>([]);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('platform_items')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

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
          config: (item.config as Record<string, string>) || {},
          sync_interval_minutes: item.sync_interval_minutes,
          next_sync_at: item.next_sync_at
        }));
        setConnections(formattedData);
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
    fetchItems();
  }, []);

  const updateConnection = async (id: string, config: Record<string, string>, isConnected: boolean) => {
    try {
      const { error } = await supabase
        .from('platform_connections')
        .update({ 
          config, 
          is_connected: isConnected, 
          updated_at: new Date().toISOString() 
        })
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

  const updateSyncSettings = async (id: string, intervalMinutes: number) => {
    try {
      const nextSync = new Date();
      nextSync.setMinutes(nextSync.getMinutes() + intervalMinutes);
      
      const { error } = await supabase
        .from('platform_connections')
        .update({ 
          sync_interval_minutes: intervalMinutes,
          next_sync_at: nextSync.toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      setConnections(prev => prev.map(conn => 
        conn.id === id ? { ...conn, sync_interval_minutes: intervalMinutes, next_sync_at: nextSync.toISOString() } : conn
      ));
      toast.success('Intervalo de sincronização atualizado');
    } catch (error) {
      console.error('Error updating sync settings:', error);
      toast.error('Erro ao salvar configurações');
    }
  };

  const getConnection = (id: string) => connections.find(c => c.id === id);

  const testSync = async (id: string) => {
    const conn = getConnection(id);
    if (!conn) return { success: false, log: 'Conexão não encontrada' };

    try {
      const { data, error } = await supabase.functions.invoke('sync-platforms', {
        body: { platformId: id }
      });

      if (error) throw error;
      
      await fetchItems();
      return { success: true, log: `Sincronização realizada com sucesso! ${data.count} itens encontrados.` };
    } catch (error: any) {
      return { success: false, log: `Erro: ${error.message}` };
    }
  };

  return { 
    connections, 
    items, 
    updateConnection, 
    getConnection, 
    testSync, 
    updateSyncSettings, 
    loading,
    refreshItems: fetchItems
  };
};
