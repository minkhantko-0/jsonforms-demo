/* eslint-disable @typescript-eslint/no-explicit-any */
import './App.css';
import { JsonFormsDemo } from './components/JsonFormsDemo';
import { ViewSubmissions } from './components/ViewSubmissions';
import { Notifications } from './components/Notifications';
import { AuthorizedWorkflows } from './components/AuthorizedWorkflows';
import { WorkflowHistory } from './components/WorkflowHistory';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNotificationStream } from './hooks/useNotificationStream';
import { Envs } from './utils/envs';
import { WorkFlowBuilder } from './components/WorkFlowBuilder';
import { SLASetUp } from './components/SLASetUp';
import { FormMapping } from './components/FormMapping';
import {
  FileText,
  List,
  Bell,
  GitBranch,
  Workflow,
  Settings,
  Menu,
  X,
  Wifi,
  WifiOff,
  History,
  Map,
} from 'lucide-react';
import {
  Box,
  Drawer,
  List as MuiList,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Badge,
  Chip,
} from '@mui/material';

const App = () => {
  const [page, setPage] = useState<
    | 'form'
    | 'formMapping'
    | 'view'
    | 'notifications'
    | 'workflows'
    | 'builder'
    | 'setup'
    | 'history'
  >('form');
  const [sidebarOpen, setSidebarOpen] = useState(true);
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

  const menuItems = [
    { id: 'form', label: 'Submit Form', icon: FileText },
    { id: 'formMapping', label: 'Form Mapping', icon: Map },
    { id: 'view', label: 'View Submissions', icon: List },
    { id: 'history', label: 'Workflow History', icon: History },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      badge: unreadCount,
    },
    { id: 'workflows', label: 'Workflow Management', icon: GitBranch },
    { id: 'builder', label: 'Workflow Builder', icon: Workflow },
    { id: 'setup', label: 'SLA Setup', icon: Settings },
  ];

  const drawerWidth = 240;

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <Drawer
        variant="persistent"
        open={sidebarOpen}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}>
        <Box
          sx={{
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <Typography variant="h6" fontWeight="bold">
            Dynamic Workflow
          </Typography>
          <IconButton
            onClick={() => setSidebarOpen(false)}
            sx={{ display: { lg: 'none' } }}>
            <X size={20} />
          </IconButton>
        </Box>

        <MuiList sx={{ flexGrow: 1, overflow: 'auto' }}>
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = page === item.id;

            return (
              <ListItem key={item.id} disablePadding>
                <ListItemButton
                  onClick={() => setPage(item.id as any)}
                  selected={isActive}
                  sx={{
                    mx: 1,
                    borderRadius: 1,
                    mb: 0.5,
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'white',
                      },
                    },
                  }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Icon size={20} />
                  </ListItemIcon>
                  <ListItemText primary={item.label} />
                  {item.badge !== undefined && item.badge > 0 && (
                    <Badge
                      badgeContent={item.badge}
                      color={isActive ? 'default' : 'error'}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </MuiList>

        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Chip
            icon={isConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
            label={isConnected ? 'Connected' : 'Reconnecting...'}
            color={isConnected ? 'success' : 'warning'}
            size="small"
            sx={{ width: '100%' }}
          />
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          marginLeft: sidebarOpen ? 0 : `-${drawerWidth}px`,
          transition: 'margin 225ms cubic-bezier(0.0, 0, 0.2, 1) 0ms',
          width: '100%',
        }}>
        {/* Top Bar */}
        <AppBar position="static" color="default" elevation={1}>
          <Toolbar>
            <IconButton
              edge="start"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              sx={{ mr: 2 }}>
              <Menu />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              {menuItems.find(item => item.id === page)?.label}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Content Area */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            overflow: 'auto',
            bgcolor: 'background.default',
            p: page === 'form' ? 0 : 3,
          }}>
          {page === 'form' && <JsonFormsDemo />}
          {page === 'formMapping' && <FormMapping />}
          {page === 'view' && <ViewSubmissions />}
          {page === 'history' && <WorkflowHistory />}
          {page === 'notifications' && <Notifications />}
          {page === 'workflows' && <AuthorizedWorkflows />}
          {page === 'builder' && <WorkFlowBuilder />}
          {page === 'setup' && <SLASetUp />}
        </Box>
      </Box>
    </Box>
  );
};

export default App;
