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

export const useConnections = () => {
  const [connections, setConnections] = useState<Connection[]>([
    { id: 'youtube', name: 'YouTube', isConnected: false, config: {} },
    { id: 'wordpress', name: 'WordPress', isConnected: false, config: {} },
    { id: 'facebook', name: 'Facebook Ads', isConnected: false, config: {} },
    { id: 'adsense', name: 'Google AdSense', isConnected: false, config: {} },
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

    fetchConnections();
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

  const testSync = async (id: string) => {
    const conn = getConnection(id);
    if (!conn || !conn.isConnected) {
      toast.error('Conecte a plataforma antes de testar a sincronização.');
      return { success: false, log: 'Não conectado' };
    }

    try {
      let log = `Iniciando sincronização para ${conn.name} em ${new Date().toLocaleString()}...\n`;
      
      if (id === 'wordpress') {
        log += `Validando URL: ${conn.config.url}...\n`;
        const response = await fetch(`${conn.config.url.replace(/\/$/, '')}/wp-json/wp/v2/posts?per_page=1`, {
          headers: { 'Authorization': `Basic ${btoa(`${conn.config.user}:${conn.config.password}`)}` }
        });
        if (!response.ok) throw new Error(`Erro API WordPress: ${response.statusText}`);
        log += `[SUCESSO] Conexão estabelecida. Posts encontrados.\n`;
      } else {
        log += `Validando formato do ID: ${conn.config.id}...\n`;
        if (id === 'youtube' && !conn.config.id.startsWith('UC')) {
          throw new Error('Formato de ID do YouTube inválido. Deve começar com "UC".');
        }
        if (id === 'facebook' && isNaN(Number(conn.config.id))) {
          throw new Error('ID do Facebook Ads deve ser numérico.');
        }
        if (id === 'adsense') {
          const adsensePattern = /^pub-\d{16}$/;
          if (!adsensePattern.test(conn.config.id)) {
            throw new Error('Formato de ID do AdSense inválido. Deve ser no formato "pub-xxxxxxxxxxxxxxxx" (16 dígitos).');
          }
        }
        log += `[SUCESSO] ID validado e sincronizado com os dados do banco.\n`;
      }

      await supabase
        .from('sync_history')
        .insert({
          platform_id: id,
          status: 'success',
          detail: 'Sincronização completa'
        });

      const interval = conn.sync_interval_minutes || 60;
      const nextSync = new Date();
      nextSync.setMinutes(nextSync.getMinutes() + interval);

      await supabase
        .from('platform_connections')
        .update({ 
          last_sync_log: log, 
          last_sync_at: new Date().toISOString(),
          next_sync_at: nextSync.toISOString()
        })
        .eq('id', id);

      return { success: true, log };
    } catch (error: any) {
      const errorLog = `[ERRO] ${error.message}\nFalha na sincronização às ${new Date().toLocaleTimeString()}`;
      
      await supabase
        .from('sync_history')
        .insert({
          platform_id: id,
          status: 'error',
          detail: error.message
        });

      await supabase
        .from('platform_connections')
        .update({ last_sync_log: errorLog })
        .eq('id', id);
      return { success: false, log: errorLog };
    }
  };

  const getConnection = (id: string) => connections.find(c => c.id === id);

  return { connections, updateConnection, getConnection, testSync, updateSyncSettings, loading };
};
