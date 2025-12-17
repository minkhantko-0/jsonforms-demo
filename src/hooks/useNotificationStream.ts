import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';

export const useNotificationStream = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const eventSource = new EventSource('http://localhost:3001/api/notifications/stream');

    eventSource.addEventListener('notification', (event) => {
      const notification = JSON.parse(event.data);
      enqueueSnackbar(notification.message, { 
        variant: 'info',
        autoHideDuration: 5000,
      });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });

    eventSource.onerror = () => {
      console.error('SSE connection error');
    };

    return () => {
      eventSource.close();
    };
  }, [queryClient, enqueueSnackbar]);
};
