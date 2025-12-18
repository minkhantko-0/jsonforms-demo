import './App.css';
import { Header } from './components/Header';
import { JsonFormsDemo } from './components/JsonFormsDemo';
import { ViewSubmissions } from './components/ViewSubmissions';
import { Notifications } from './components/Notifications';
import { AuthorizedWorkflows } from './components/AuthorizedWorkflows';
import { useState } from 'react';
import { Button, Box, Badge, Tooltip } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useNotificationStream } from './hooks/useNotificationStream';
import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import { Envs } from './utils/envs';

const App = () => {
  const [page, setPage] = useState<
    'form' | 'view' | 'notifications' | 'workflows'
  >('form');
  const { isConnected } = useNotificationStream();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await fetch(`${Envs.API_URL}/api/notifications`);
      const result = await response.json();
      return result.success ? result.data : [];
    },
  });

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  return (
    <div className="App">
      <Header />
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        gap={2}
        p={2}>
        <Tooltip title={isConnected ? 'Connected' : 'Reconnecting...'}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isConnected ? (
              <WifiIcon color="success" />
            ) : (
              <WifiOffIcon color="warning" />
            )}
          </Box>
        </Tooltip>
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
        <Button
          variant={page === 'workflows' ? 'contained' : 'outlined'}
          onClick={() => setPage('workflows')}>
          Workflow Management
        </Button>
      </Box>
      {page === 'form' && <JsonFormsDemo />}
      {page === 'view' && <ViewSubmissions />}
      {page === 'notifications' && <Notifications />}
      {page === 'workflows' && <AuthorizedWorkflows />}
    </div>
  );
};

export default App;
