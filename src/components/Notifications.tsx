import { FC } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Badge,
  CircularProgress,
  Paper,
  Button,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';

interface Notification {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const Notifications: FC = () => {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3001/api/notifications');
      const result = await response.json();
      return result.success ? result.data : [];
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`http://localhost:3001/api/notifications/${id}/read`, {
        method: 'PATCH',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`http://localhost:3001/api/notifications/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await fetch('http://localhost:3001/api/notifications/read-all', {
        method: 'PATCH',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="h4">Notifications</Typography>
          {unreadCount > 0 && (
            <Badge badgeContent={unreadCount} color="error" />
          )}
        </Box>
        {unreadCount > 0 && (
          <Button onClick={() => markAllAsReadMutation.mutate()}>
            Mark all as read
          </Button>
        )}
      </Box>
      <List>
        {notifications.map((notification: Notification) => (
          <Paper key={notification.id} sx={{ mb: 1 }}>
            <ListItem
              sx={{
                bgcolor: notification.isRead ? 'transparent' : 'action.hover',
              }}
              secondaryAction={
                <Box>
                  {!notification.isRead && (
                    <IconButton
                      edge="end"
                      onClick={() => markAsReadMutation.mutate(notification.id)}
                      sx={{ mr: 1 }}>
                      <MarkEmailReadIcon />
                    </IconButton>
                  )}
                  <IconButton
                    edge="end"
                    onClick={() => deleteMutation.mutate(notification.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              }>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    {notification.title}
                    {!notification.isRead && (
                      <Badge color="error" variant="dot" />
                    )}
                  </Box>
                }
                secondary={
                  <>
                    <Typography variant="body2">{notification.message}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(notification.createdAt).toLocaleString()}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          </Paper>
        ))}
      </List>
      {notifications.length === 0 && (
        <Typography color="text.secondary" textAlign="center">
          No notifications
        </Typography>
      )}
    </Box>
  );
};
