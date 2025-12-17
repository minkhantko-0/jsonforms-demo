import './App.css';
import { Header } from './components/Header';
import { JsonFormsDemo } from './components/JsonFormsDemo';
import { ViewSubmissions } from './components/ViewSubmissions';
import { Notifications } from './components/Notifications';
import { useState } from 'react';
import { Button, Box, Badge } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useNotificationStream } from './hooks/useNotificationStream';

const App = () => {
  const [page, setPage] = useState<'form' | 'view' | 'notifications'>('form');
  useNotificationStream();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3001/api/notifications');
      const result = await response.json();
      return result.success ? result.data : [];
    },
    refetchInterval: 5000,
  });

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  return (
    <div className="App">
      <Header />
      <Box display="flex" justifyContent="center" gap={2} p={2}>
        <Button
          variant={page === 'form' ? 'contained' : 'outlined'}
          onClick={() => setPage('form')}>
          Form
        </Button>
        <Button
          variant={page === 'view' ? 'contained' : 'outlined'}
          onClick={() => setPage('view')}>
          View Submissions
        </Button>
        <Badge badgeContent={unreadCount} color="error">
          <Button
            variant={page === 'notifications' ? 'contained' : 'outlined'}
            onClick={() => setPage('notifications')}>
            Notifications
          </Button>
        </Badge>
      </Box>
      {page === 'form' && <JsonFormsDemo />}
      {page === 'view' && <ViewSubmissions />}
      {page === 'notifications' && <Notifications />}
    </div>
  );
};

export default App;
