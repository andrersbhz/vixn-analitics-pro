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
  cached_data?: Record<string, any>;
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
      const { data, error } = await supabase
        .from('platform_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        setItems(data);
        return;
      }

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
    next_sync_at: item.next_sync_at,
    cached_data: (item.cached_data as Record<string, any>) || {},
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
        setConnections(data.map(formatConnection));
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    const load = async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      if (!data.session) {
        // Sem sessão as funções de backend retornam 401 — evita quebrar a tela.
        setItems([]);
        setLoading(false);
        if (!window.location.pathname.startsWith('/login')) {
          window.location.replace('/login');
        }
        return;
      }
      await Promise.all([fetchConnections(), fetchItems()]);
    };

    load();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) load();
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const updateConnection = async (id: string, config: Record<string, string>, isConnected: boolean) => {
    try {
      const { data, error } = await supabase.functions.invoke('connections-update', {
        body: { id, config, isConnected },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Keep only the fields already present in the browser. Sensitive values
      // remain on the backend and are deliberately never copied into React state.
      setConnections(prev => prev.map(conn =>
        conn.id === id
          ? { ...conn, config: { ...conn.config, ...config }, isConnected }
          : conn
      ));

      await fetchConnections();
    } catch (error) {
      console.error('Error updating connection:', error);
      toast.error('Erro ao salvar no banco de dados');
    }
  };

  const updateSyncSettings = async (id: string, intervalMinutes: number) => {
    try {
      const { data, error } = await supabase.functions.invoke('connections-update', {
        body: { id, syncIntervalMinutes: intervalMinutes },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const nextSyncAt = data?.connection?.next_sync_at;
      setConnections(prev => prev.map(conn =>
        conn.id === id
          ? {
              ...conn,
              sync_interval_minutes: intervalMinutes,
              next_sync_at: nextSyncAt || conn.next_sync_at,
            }
          : conn
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
        body: { platformId: id },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      await fetchItems();
      await fetchConnections();

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
    refreshConnections: fetchConnections,
  };
};
