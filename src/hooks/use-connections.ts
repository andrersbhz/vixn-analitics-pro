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
   impressions?: number;
   ctr?: number;
   engagement_rate?: number;
   avg_watch_time?: number;
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
      // Try direct (RLS) first — works when user is authenticated.
      const { data, error } = await supabase
        .from('platform_items')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        setItems(data);
        return;
      }
      // Fallback via edge function (service role) — guarantees data
      // loads on the dashboard even if the session is not hydrated yet.
      const { data: fnData, error: fnError } = await supabase.functions.invoke('platform-items-list');
      if (!fnError && fnData?.items) {
        setItems(fnData.items);
        return;
      }
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const formatConnection = (item: any) => ({
    id: item.id,
    name: item.name,
    isConnected: item.is_connected,
    config: (item.config as Record<string, string>) || {},
    sync_interval_minutes: item.sync_interval_minutes,
    next_sync_at: item.next_sync_at
  });

  const fetchConnections = async () => {
    try {
      const { data: statusData, error: statusError } = await supabase.functions.invoke('connections-status');
      if (!statusError && statusData?.connections) {
        setConnections(statusData.connections.map(formatConnection));
        return;
      }

      const { data, error } = await supabase
        .from('platform_connections')
        .select('*');

      if (error) throw error;

      if (data && data.length > 0) {
        const formattedData = data.map(formatConnection);
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
      // Preserve server-managed fields (e.g. OAuth tokens for AdSense) that the
      // Settings form doesn't know about. Without this merge, saving the form
      // wipes the AdSense oauth credentials and the connection "para de conectar".
      const existing = connections.find(c => c.id === id)?.config || {};
      const preservedKeys = ['oauth'];
      const merged: Record<string, any> = { ...existing, ...config };
      for (const key of preservedKeys) {
        if ((existing as any)[key] && !(config as any)[key]) {
          merged[key] = (existing as any)[key];
        }
      }

      const { error } = await supabase
        .from('platform_connections')
        .update({ 
          config: merged, 
          is_connected: isConnected, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id);

      if (error) throw error;

      setConnections(prev => prev.map(conn => 
        conn.id === id ? { ...conn, config: merged as Record<string, string>, isConnected } : conn
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
      if (data?.warning) {
        return { success: true, log: data.warning };
      }
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
    refreshItems: fetchItems,
    refreshConnections: fetchConnections
  };
};
