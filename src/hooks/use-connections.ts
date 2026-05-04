 import { useState, useEffect } from 'react';

 export interface Connection {
   id: string;
   name: string;
   isConnected: boolean;
   config: Record<string, string>;
 }

 export const useConnections = () => {
   const [connections, setConnections] = useState<Connection[]>(() => {
     const saved = localStorage.getItem('growth-suite-connections');
     if (saved) return JSON.parse(saved);
     return [
       { id: 'youtube', name: 'YouTube', isConnected: false, config: {} },
       { id: 'wordpress', name: 'WordPress', isConnected: false, config: {} },
       { id: 'facebook', name: 'Facebook Ads', isConnected: false, config: {} },
     ];
   });

   useEffect(() => {
     localStorage.setItem('growth-suite-connections', JSON.stringify(connections));
   }, [connections]);

   const updateConnection = (id: string, config: Record<string, string>, isConnected: boolean) => {
     setConnections(prev => prev.map(conn => 
       conn.id === id ? { ...conn, config, isConnected } : conn
     ));
   };

   const getConnection = (id: string) => connections.find(c => c.id === id);

   return { connections, updateConnection, getConnection };
 };