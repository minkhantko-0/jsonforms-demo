import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';

let globalEventSource: EventSource | null = null;
let globalIsConnected = false;
let listeners: Set<(connected: boolean) => void> = new Set();
let reconnectTimeout: NodeJS.Timeout | null = null;
let reconnectAttempts = 0;

export const useNotificationStream = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [isConnected, setIsConnected] = useState(globalIsConnected);
  const hasSetupRef = useRef(false);

  useEffect(() => {
    const updateConnectionStatus = (connected: boolean) => {
      globalIsConnected = connected;
      setIsConnected(connected);
    };

    listeners.add(updateConnectionStatus);

    const connect = () => {
      if (globalEventSource?.readyState === EventSource.OPEN) {
        console.log('Already connected');
        return;
      }
      
      if (globalEventSource) {
        globalEventSource.close();
        globalEventSource = null;
      }

      console.log('Creating new SSE connection...');
      const eventSource = new EventSource('http://localhost:3001/api/notifications/stream');
      globalEventSource = eventSource;

      eventSource.addEventListener('ping', () => {
        if (!globalIsConnected) {
          reconnectAttempts = 0;
          listeners.forEach(fn => fn(true));
          console.log('SSE connected');
        }
      });

      eventSource.addEventListener('notification', (event) => {
        const notification = JSON.parse(event.data);
        enqueueSnackbar(notification.message, { 
          variant: 'info',
          autoHideDuration: 5000,
        });
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      });

      eventSource.onerror = (e) => {
        console.log('SSE error, readyState:', eventSource.readyState);
        
        if (eventSource.readyState === EventSource.CLOSED) {
          listeners.forEach(fn => fn(false));
          
          if (reconnectTimeout) clearTimeout(reconnectTimeout);
          
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
          reconnectAttempts++;
          
          console.log(`Reconnecting in ${delay}ms...`);
          
          reconnectTimeout = setTimeout(() => {
            connect();
          }, delay);
        }
      };
    };

    if (!hasSetupRef.current) {
      hasSetupRef.current = true;
      if (!globalEventSource) {
        connect();
      }
    }

    const handleOnline = () => {
      console.log('Network online');
      queryClient.invalidateQueries();
      if (!globalIsConnected) {
        connect();
      }
    };

    const handleOffline = () => {
      console.log('Network offline');
      listeners.forEach(fn => fn(false));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      listeners.delete(updateConnectionStatus);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [queryClient, enqueueSnackbar]);

  return { isConnected };
};
