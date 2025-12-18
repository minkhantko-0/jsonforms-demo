import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Stack,
  Divider,
  Paper,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { Envs } from '../utils/envs';

interface Role {
  id: string;
  key: string;
  name: string;
}

interface Task {
  id: string;
  assignedUserId: string | null;
  assignedRoleId: string;
  instanceId: string;
  workflowId: string;
  inputs: {
    request?: {
      path: string;
      fileName: string;
    };
    [key: string]: any;
  };
  outputs: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  status: string;
}

interface TasksResponse {
  timestamp: string;
  status: number;
  reqId: string;
  message: string;
  data: Task[];
}

interface RolesResponse {
  timestamp: string;
  status: number;
  reqId: string;
  message: string;
  data: Role[];
}

export const AuthorizedWorkflows = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [tasks, setTasks] = useState<Record<string, Task[]>>({});
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [expandedRole, setExpandedRole] = useState<string | false>(false);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoadingRoles(true);
        const response = await fetch(`${Envs.WORKFLOW_URL}/api/v1/roles`);
        if (!response.ok) {
          throw new Error('Failed to fetch roles');
        }
        const data: RolesResponse = await response.json();
        setRoles(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoadingRoles(false);
      }
    };

    fetchRoles();
  }, []);

  const fetchTasksForRole = async (
    roleKey: string,
    roleId: string,
    force = false,
  ) => {
    if (!force && tasks[roleId]) return; // Already fetched

    try {
      setLoadingTasks(prev => ({ ...prev, [roleId]: true }));
      const response = await fetch(`${Envs.WORKFLOW_URL}/api/v1/tasks`, {
        headers: {
          'x-role-id': roleKey,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data: TasksResponse = await response.json();
      setTasks(prev => ({ ...prev, [roleId]: data.data || [] }));
    } catch (err) {
      console.error('Error fetching tasks:', err);
      // Set empty array on error so we don't keep trying
      setTasks(prev => ({ ...prev, [roleId]: [] }));
    } finally {
      setLoadingTasks(prev => ({ ...prev, [roleId]: false }));
    }
  };

  const handleAccordionChange =
    (roleKey: string, roleId: string) =>
    (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedRole(isExpanded ? roleId : false);
      if (isExpanded) {
        fetchTasksForRole(roleKey, roleId, true);
      }
    };

  const handleApprove = async (
    roleKey: string,
    roleId: string,
    taskId: string,
    instanceId: string,
  ) => {
    try {
      const response = await fetch(
        `${Envs.WORKFLOW_URL}/api/v1/tasks/${taskId}/complete`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-role-id': roleKey,
          },
          body: JSON.stringify({
            isApproved: true,
            remark: 'Approved',
            instanceId: instanceId,
          }),
        },
      );

      if (response.ok) {
        // Force refresh tasks for this role
        await fetchTasksForRole(roleKey, roleId, true);
      }
    } catch (err) {
      console.error('Error approving task:', err);
    }
  };

  const handleReject = async (
    roleKey: string,
    roleId: string,
    taskId: string,
    instanceId: string,
  ) => {
    try {
      const response = await fetch(
        `${Envs.WORKFLOW_URL}/api/v1/tasks/${taskId}/complete`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-role-id': roleKey,
          },
          body: JSON.stringify({
            isApproved: false,
            remark: 'Rejected',
            instanceId: instanceId,
          }),
        },
      );

      if (response.ok) {
        // Force refresh tasks for this role
        await fetchTasksForRole(roleKey, roleId, true);
      }
    } catch (err) {
      console.error('Error rejecting task:', err);
    }
  };

  if (loadingRoles) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Roles & Tasks
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        View roles and manage their associated tasks
      </Typography>

      <Stack spacing={3}>
        {roles.map(role => (
          <Card
            key={role.id}
            elevation={3}
            sx={{
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                boxShadow: 6,
              },
            }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <PersonIcon color="primary" fontSize="large" />
                <Box flex={1}>
                  <Typography variant="h5" component="div">
                    {role.name}
                  </Typography>
                  <Chip
                    label={role.key}
                    size="small"
                    variant="outlined"
                    color="primary"
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Accordion
                expanded={expandedRole === role.id}
                onChange={handleAccordionChange(role.key, role.id)}
                elevation={0}
                sx={{
                  '&:before': {
                    display: 'none',
                  },
                }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    px: 0,
                    minHeight: 48,
                    '&.Mui-expanded': {
                      minHeight: 48,
                    },
                  }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <AssignmentIcon fontSize="small" color="action" />
                    <Typography variant="subtitle2" fontWeight="bold">
                      View Tasks
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 0 }}>
                  {loadingTasks[role.id] ? (
                    <Box display="flex" justifyContent="center" py={2}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : tasks[role.id] && tasks[role.id].length > 0 ? (
                    <Stack spacing={2}>
                      {tasks[role.id].map(task => (
                        <Paper
                          key={task.id}
                          elevation={1}
                          sx={{
                            p: 2,
                            backgroundColor: 'background.default',
                            border: '1px solid',
                            borderColor: 'divider',
                          }}>
                          <Box mb={2}>
                            <Typography
                              variant="subtitle2"
                              fontWeight="bold"
                              gutterBottom>
                              Workflow: {task.workflowId}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              gutterBottom>
                              Instance ID: {task.instanceId}
                            </Typography>
                            {task.inputs.request && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                gutterBottom>
                                File: {task.inputs.request.fileName} (
                                {task.inputs.request.path})
                              </Typography>
                            )}
                          </Box>

                          <Stack
                            direction="row"
                            spacing={1}
                            mb={2}
                            flexWrap="wrap">
                            <Chip
                              label={task.status}
                              size="small"
                              color={
                                task.status === 'pending'
                                  ? 'warning'
                                  : 'default'
                              }
                            />
                            <Chip
                              label={`By: ${task.createdBy}`}
                              size="small"
                              variant="outlined"
                            />
                            <Chip
                              label={new Date(task.createdAt).toLocaleString()}
                              size="small"
                              variant="outlined"
                            />
                          </Stack>

                          <Stack direction="row" spacing={1}>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              startIcon={<CheckCircleIcon />}
                              onClick={() =>
                                handleApprove(
                                  role.key,
                                  role.id,
                                  task.id,
                                  task.instanceId,
                                )
                              }>
                              Approve
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              color="error"
                              startIcon={<CancelIcon />}
                              onClick={() =>
                                handleReject(
                                  role.key,
                                  role.id,
                                  task.id,
                                  task.instanceId,
                                )
                              }>
                              Reject
                            </Button>
                          </Stack>
                        </Paper>
                      ))}
                    </Stack>
                  ) : (
                    <Alert severity="info" sx={{ mt: 1 }}>
                      No tasks available for this role
                    </Alert>
                  )}
                </AccordionDetails>
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {roles.length === 0 && <Alert severity="info">No roles available</Alert>}
    </Box>
  );
};
