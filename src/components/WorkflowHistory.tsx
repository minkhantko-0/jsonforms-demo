import { FC, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  FileText,
  Clock,
  User,
  CheckCircle,
  XCircle,
  Play,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Envs } from '../utils/envs';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  Collapse,
  Paper,
  CircularProgress,
} from '@mui/material';

interface WorkflowInstance {
  id: string;
  refId: string;
  createdBy: string;
  status: string;
  variables: Record<string, any>;
  currentNode: string;
  createdAt: string;
  updatedAt: string;
}

interface ActionHistory {
  id: string;
  status: string;
  workflowInstanceId: string;
  action: string;
  performedBy: string;
  details: {
    node: {
      key: string;
      type: string;
      config?: any;
      description?: string;
    };
    outputs?: any;
    branchKey?: string;
  };
  completedAt: string;
  createdAt: string;
}

interface WorkflowDetails {
  id: string;
  workflowId: string;
  status: string;
  variables: Record<string, any>;
  currentNode: string;
  actionHistories: ActionHistory[];
  defSnapshot: {
    key: string;
    name: string;
    nodes: any[];
    transitions: any[];
  };
  parallelBranches?: any[];
}

export const WorkflowHistory: FC = () => {
  const [expandedInstances, setExpandedInstances] = useState<Set<string>>(
    new Set(),
  );

  // Fetch workflow instances
  const { data: instances = [], isLoading } = useQuery({
    queryKey: ['workflowInstances'],
    queryFn: async () => {
      const response = await fetch(
        `${Envs.WORKFLOW_URL}/api/v1/workflows/instances`,
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result.data || [];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch instance details with useQuery for each expanded instance
  const useInstanceDetails = (id: string, enabled: boolean) => {
    return useQuery({
      queryKey: ['workflowInstanceDetails', id],
      queryFn: async () => {
        const response = await fetch(
          `${Envs.WORKFLOW_URL}/api/v1/workflows/instances/${id}`,
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        return result.data as WorkflowDetails;
      },
      enabled,
      refetchInterval: enabled ? 5000 : false, // Refetch every 5 seconds when expanded
      staleTime: 0, // Always consider data stale for real-time feel
    });
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedInstances);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedInstances(newExpanded);
  };

  const getStatusColor = (
    status: string,
  ): 'success' | 'primary' | 'error' | 'warning' | 'default' => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'running':
        return 'primary';
      case 'failed':
        return 'error';
      case 'cancelled':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 400,
        }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}>
        <Typography variant="h4" fontWeight="bold">
          Workflow History
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Total Instances: {instances.length}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {instances.map((instance: WorkflowInstance) => (
          <InstanceCard
            key={instance.id}
            instance={instance}
            isExpanded={expandedInstances.has(instance.id)}
            onToggle={() => toggleExpanded(instance.id)}
            useInstanceDetails={useInstanceDetails}
            getStatusColor={getStatusColor}
          />
        ))}
      </Box>

      {instances.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 12 }}>
          <FileText size={64} color="#ccc" style={{ margin: '0 auto 16px' }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No workflow instances found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Submit a form to create a workflow instance
          </Typography>
        </Box>
      )}
    </Box>
  );
};

interface InstanceCardProps {
  instance: WorkflowInstance;
  isExpanded: boolean;
  onToggle: () => void;
  useInstanceDetails: (id: string, enabled: boolean) => any;
  getStatusColor: (
    status: string,
  ) => 'success' | 'primary' | 'error' | 'warning' | 'default';
}

const InstanceCard: FC<InstanceCardProps> = ({
  instance,
  isExpanded,
  onToggle,
  useInstanceDetails,
  getStatusColor,
}) => {
  const { data: details, isLoading: isLoadingDetail } = useInstanceDetails(
    instance.id,
    isExpanded,
  );

  return (
    <Card elevation={2}>
      <CardContent
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          '&:hover': { bgcolor: 'action.hover' },
        }}
        onClick={onToggle}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            flex: 1,
          }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              bgcolor: 'primary.light',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <FileText size={20} color="#0284c7" />
          </Box>

          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="h6">Ref ID: {instance.refId}</Typography>
              <Chip
                label={instance.status.toUpperCase()}
                color={getStatusColor(instance.status)}
                size="small"
              />
            </Box>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                mt: 0.5,
              }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}>
                <Clock size={14} />
                <Typography variant="body2" color="text.secondary">
                  {new Date(instance.createdAt).toLocaleString()}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}>
                <User size={14} />
                <Typography variant="body2" color="text.secondary">
                  {instance.createdBy}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mt: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                Workflow: {instance.variables?.workflowId || 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Current Node: {instance.currentNode}
              </Typography>
            </Box>
          </Box>
        </Box>

        <IconButton>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </IconButton>
      </CardContent>

      {isExpanded && (
        <Collapse in={isExpanded}>
          <Box
            sx={{
              bgcolor: 'background.default',
              p: 3,
              borderTop: 1,
              borderColor: 'divider',
            }}>
            {isLoadingDetail ? (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  py: 4,
                }}>
                <CircularProgress size={32} />
              </Box>
            ) : details && details.defSnapshot ? (
              <>
                <style>
                  {`
                            @keyframes pulse {
                              0%, 100% {
                                opacity: 1;
                                transform: scale(1);
                              }
                              50% {
                                opacity: 0.7;
                                transform: scale(1.05);
                              }
                            }
                          `}
                </style>

                <Box>
                  <Typography variant="h6" gutterBottom>
                    Workflow Stages
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    {(() => {
                      // Find start and end nodes from defSnapshot
                      const startNode = details.defSnapshot.nodes?.find(
                        (n: any) => n.type === 'start',
                      );
                      const endNode = details.defSnapshot.nodes?.find(
                        (n: any) => n.type === 'end',
                      );

                      // Find start and end action data from actionHistories
                      const startActionData = details.actionHistories?.find(
                        (action: ActionHistory) =>
                          action.details?.node?.type === 'start',
                      );
                      const endActionData = details.actionHistories?.find(
                        (action: ActionHistory) =>
                          action.details?.node?.type === 'end',
                      );

                      // Filter out start and end nodes from actionHistories
                      const actionHistories = (
                        details.actionHistories || []
                      ).filter((action: ActionHistory) => {
                        const nodeType = action.details?.node?.type;
                        return nodeType !== 'start' && nodeType !== 'end';
                      });

                      return (
                        <>
                          {/* Start Node - Always at top */}
                          {startNode && (
                            <Box
                              sx={{
                                display: 'flex',
                                mb: 3,
                              }}>
                              {/* Timeline Center - Icon and Line */}
                              <Box
                                sx={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  mr: 2,
                                }}>
                                <Box
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    bgcolor: '#4caf5020',
                                    border: '2px solid #4caf50',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}>
                                  <Play size={20} color="#4caf50" />
                                </Box>
                                <Box
                                  sx={{
                                    width: 2,
                                    flexGrow: 1,
                                    bgcolor: '#4caf50',
                                    mt: 1,
                                    minHeight: 40,
                                  }}
                                />
                              </Box>

                              {/* Timeline Right - Content */}
                              <Box sx={{ flex: 1, pb: 2 }}>
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    mb: 0.5,
                                  }}>
                                  <Typography
                                    variant="subtitle2"
                                    component="span"
                                    fontWeight="bold">
                                    {startNode.config?.payload?.name || 'Start'}
                                  </Typography>
                                  <Chip
                                    label="Completed"
                                    color="success"
                                    size="small"
                                  />
                                </Box>
                                <Typography
                                  variant="body2"
                                  color="text.secondary">
                                  Type: start
                                </Typography>
                                {startActionData && (
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    display="block"
                                    sx={{ mt: 0.5 }}>
                                    Performed by: {startActionData.performedBy}{' '}
                                    •{' '}
                                    {new Date(
                                      startActionData.completedAt,
                                    ).toLocaleString()}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          )}

                          {/* Action History Stages */}
                          {actionHistories.map(
                            (action: ActionHistory, index: number) => {
                              const nodeType =
                                action.details?.node?.type || 'unknown';
                              const isCurrentNode =
                                details.currentNode ===
                                action.details?.node?.key;
                              const actionStatus =
                                action.status?.toLowerCase() || 'unknown';
                              const isCompleted = actionStatus === 'completed';
                              const isProcessing =
                                actionStatus === 'processing';
                              const isSlaBreach =
                                actionStatus === 'sla-breached';

                              let IconComponent = AlertCircle;
                              let iconColor = '#2196f3';

                              if (isProcessing) {
                                // Service node processing
                                IconComponent = AlertCircle;
                                iconColor = '#2196f3';
                              } else if (isSlaBreach) {
                                // SLA Breach - node was skipped
                                IconComponent = AlertTriangle;
                                iconColor = '#ff9800';
                              } else if (isCompleted && nodeType === 'task') {
                                const outputs = action.details?.outputs;
                                if (outputs?.isApproved === true) {
                                  IconComponent = CheckCircle;
                                  iconColor = '#4caf50';
                                } else if (outputs?.isApproved === false) {
                                  IconComponent = XCircle;
                                  iconColor = '#f44336';
                                } else {
                                  IconComponent = CheckCircle;
                                  iconColor = '#4caf50';
                                }
                              } else if (isCompleted) {
                                IconComponent = CheckCircle;
                                iconColor = '#4caf50';
                              }

                              return (
                                <Box
                                  key={action.id}
                                  sx={{
                                    display: 'flex',
                                    mb: 3,
                                  }}>
                                  {/* Timeline Center - Icon and Line */}
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'center',
                                      mr: 2,
                                    }}>
                                    <Box
                                      sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: '50%',
                                        bgcolor: iconColor + '20',
                                        border: `2px solid ${iconColor}`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        animation:
                                          isCurrentNode &&
                                          instance.status === 'running'
                                            ? 'pulse 2s ease-in-out infinite'
                                            : 'none',
                                      }}>
                                      <IconComponent
                                        size={20}
                                        color={iconColor}
                                      />
                                    </Box>
                                    <Box
                                      sx={{
                                        width: 2,
                                        flexGrow: 1,
                                        bgcolor: iconColor,
                                        mt: 1,
                                        minHeight: 40,
                                      }}
                                    />
                                  </Box>

                                  {/* Timeline Right - Content */}
                                  <Box sx={{ flex: 1, pb: 2 }}>
                                    <Box
                                      sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        mb: 0.5,
                                      }}>
                                      <Typography
                                        variant="subtitle2"
                                        component="span"
                                        fontWeight="bold">
                                        {action.details?.node?.config?.payload
                                          ?.name ||
                                          action.action
                                            .replace(/_/g, ' ')
                                            .replace(/\b\w/g, (l: string) =>
                                              l.toUpperCase(),
                                            )}
                                      </Typography>
                                      {isCurrentNode && (
                                        <Chip
                                          label="Current"
                                          color="primary"
                                          size="small"
                                        />
                                      )}
                                      {isProcessing ? (
                                        <Chip
                                          label="Processing"
                                          color="info"
                                          size="small"
                                        />
                                      ) : isSlaBreach ? (
                                        <Chip
                                          label="SLA Breach"
                                          color="warning"
                                          size="small"
                                        />
                                      ) : (
                                        <Chip
                                          label="Completed"
                                          color="success"
                                          size="small"
                                        />
                                      )}
                                    </Box>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                      sx={{ mb: 0.5 }}>
                                      Type: {nodeType}
                                    </Typography>
                                    {action.details?.node?.config?.payload
                                      ?.role && (
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        display="block">
                                        Role:{' '}
                                        {
                                          action.details.node.config.payload
                                            .role
                                        }
                                      </Typography>
                                    )}
                                    {action.details?.node?.config?.payload
                                      ?.group && (
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        display="block">
                                        Group:{' '}
                                        {
                                          action.details.node.config.payload
                                            .group
                                        }
                                      </Typography>
                                    )}
                                    {action.details?.outputs &&
                                      action.details.outputs.isApproved !==
                                        undefined && (
                                        <Box sx={{ mt: 1 }}>
                                          <Chip
                                            label={
                                              action.details.outputs.isApproved
                                                ? 'Approved'
                                                : 'Rejected'
                                            }
                                            color={
                                              action.details.outputs.isApproved
                                                ? 'success'
                                                : 'error'
                                            }
                                            size="small"
                                          />
                                          {action.details.outputs.remark && (
                                            <Typography
                                              variant="caption"
                                              display="block"
                                              sx={{ mt: 0.5 }}>
                                              Remark:{' '}
                                              {action.details.outputs.remark}
                                            </Typography>
                                          )}
                                        </Box>
                                      )}
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      display="block"
                                      sx={{ mt: 0.5 }}>
                                      {isCompleted ? (
                                        <>
                                          Performed by: {action.performedBy} •{' '}
                                          Completed at:{' '}
                                          {new Date(
                                            action.completedAt,
                                          ).toLocaleString()}
                                        </>
                                      ) : isProcessing ? (
                                        <>
                                          Started by: {action.performedBy} •{' '}
                                          {new Date(
                                            action.createdAt,
                                          ).toLocaleString()}
                                          {' • '}
                                          <span
                                            style={{
                                              color: '#2196f3',
                                            }}>
                                            Processing...
                                          </span>
                                        </>
                                      ) : (
                                        <>
                                          Started by: {action.performedBy} •{' '}
                                          {new Date(
                                            action.createdAt,
                                          ).toLocaleString()}
                                          {' • '}
                                          <span
                                            style={{
                                              color: '#ff9800',
                                            }}>
                                            Not completed (SLA breach)
                                          </span>
                                        </>
                                      )}
                                    </Typography>
                                  </Box>
                                </Box>
                              );
                            },
                          )}

                          {/* End Node - Always at bottom */}
                          {endNode && (
                            <Box
                              sx={{
                                display: 'flex',
                              }}>
                              {/* Timeline Center - Icon and Line */}
                              <Box
                                sx={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  mr: 2,
                                }}>
                                <Box
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    bgcolor:
                                      instance.status === 'completed'
                                        ? '#4caf5020'
                                        : '#9e9e9e20',
                                    border:
                                      instance.status === 'completed'
                                        ? '2px solid #4caf50'
                                        : '2px solid #9e9e9e',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    opacity:
                                      instance.status === 'completed' ? 1 : 0.5,
                                  }}>
                                  <CheckCircle
                                    size={20}
                                    color={
                                      instance.status === 'completed'
                                        ? '#4caf50'
                                        : '#9e9e9e'
                                    }
                                  />
                                </Box>
                              </Box>

                              {/* Timeline Right - Content */}
                              <Box sx={{ flex: 1 }}>
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    mb: 0.5,
                                  }}>
                                  <Typography
                                    variant="subtitle2"
                                    component="span"
                                    fontWeight="bold">
                                    {endNode.config?.payload?.name || 'End'}
                                  </Typography>
                                  {instance.status === 'completed' && (
                                    <Chip
                                      label="Completed"
                                      color="success"
                                      size="small"
                                    />
                                  )}
                                  {instance.status === 'running' && (
                                    <Chip
                                      label="Pending"
                                      color="default"
                                      size="small"
                                    />
                                  )}
                                </Box>
                                <Typography
                                  variant="body2"
                                  color="text.secondary">
                                  Type: end
                                </Typography>
                                {endActionData && (
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    display="block"
                                    sx={{ mt: 0.5 }}>
                                    Performed by: {endActionData.performedBy} •{' '}
                                    {new Date(
                                      endActionData.completedAt,
                                    ).toLocaleString()}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          )}
                        </>
                      );
                    })()}
                  </Paper>
                </Box>
              </>
            ) : (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No workflow stage information available
                </Typography>
              </Box>
            )}
          </Box>
        </Collapse>
      )}
    </Card>
  );
};
