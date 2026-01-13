import { FC } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { Box, Typography, Chip } from '@mui/material';

export interface WorkflowStage {
  key: string;
  name: string;
  type: 'start' | 'task' | 'decision' | 'service' | 'end';
  status: 'completed' | 'in-progress' | 'pending' | 'failed' | 'cancelled';
  assignedTo?: string;
  completedAt?: string;
  startedAt?: string;
  description?: string;
}

interface WorkflowStageVisualizerProps {
  stages: WorkflowStage[];
  currentStageKey?: string;
}

export const WorkflowStageVisualizer: FC<WorkflowStageVisualizerProps> = ({
  stages,
  currentStageKey,
}) => {
  const getStatusIcon = (status: WorkflowStage['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 size={24} color="#22c55e" />;
      case 'in-progress':
        return <Clock size={24} color="#3b82f6" />;
      case 'failed':
        return <XCircle size={24} color="#ef4444" />;
      case 'cancelled':
        return <AlertCircle size={24} color="#6b7280" />;
      default:
        return <Circle size={24} color="#d1d5db" />;
    }
  };

  const getStatusColor = (status: WorkflowStage['status']) => {
    switch (status) {
      case 'completed':
        return '#22c55e';
      case 'in-progress':
        return '#3b82f6';
      case 'failed':
        return '#ef4444';
      case 'cancelled':
        return '#6b7280';
      default:
        return '#d1d5db';
    }
  };

  return (
    <Box sx={{ py: 3 }}>
      <Box sx={{ position: 'relative' }}>
        {/* Progress line */}
        <Box
          sx={{
            position: 'absolute',
            left: 32,
            top: 32,
            bottom: 32,
            width: 2,
            bgcolor: '#e5e7eb',
          }}
        />

        {/* Stages */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {stages.map((stage, index) => {
            const isCurrentStage = stage.key === currentStageKey;
            const statusColor = getStatusColor(stage.status);

            return (
              <Box
                key={stage.key}
                sx={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'flex-start',
                }}>
                {/* Icon */}
                <Box
                  sx={{
                    position: 'relative',
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    bgcolor:
                      stage.status === 'completed'
                        ? '#f0fdf4'
                        : stage.status === 'in-progress'
                          ? '#eff6ff'
                          : stage.status === 'failed'
                            ? '#fef2f2'
                            : stage.status === 'cancelled'
                              ? '#f9fafb'
                              : 'white',
                    border: '2px solid',
                    borderColor:
                      stage.status === 'completed'
                        ? '#86efac'
                        : stage.status === 'in-progress'
                          ? '#93c5fd'
                          : stage.status === 'failed'
                            ? '#fca5a5'
                            : stage.status === 'cancelled'
                              ? '#e5e7eb'
                              : '#e5e7eb',
                    ...(isCurrentStage && {
                      boxShadow: `0 0 0 4px ${
                        stage.status === 'in-progress' ? '#bfdbfe' : '#e5e7eb'
                      }`,
                    }),
                  }}>
                  {getStatusIcon(stage.status)}
                </Box>

                {/* Content */}
                <Box
                  sx={{
                    ml: 3,
                    flex: 1,
                    p: 2,
                    borderRadius: 2,
                    border: '2px solid',
                    borderColor:
                      stage.status === 'completed'
                        ? '#86efac'
                        : stage.status === 'in-progress'
                          ? '#93c5fd'
                          : stage.status === 'failed'
                            ? '#fca5a5'
                            : stage.status === 'cancelled'
                              ? '#e5e7eb'
                              : '#e5e7eb',
                    bgcolor:
                      stage.status === 'completed'
                        ? '#f0fdf4'
                        : stage.status === 'in-progress'
                          ? '#eff6ff'
                          : stage.status === 'failed'
                            ? '#fef2f2'
                            : stage.status === 'cancelled'
                              ? '#f9fafb'
                              : 'white',
                    ...(isCurrentStage && {
                      boxShadow: `0 0 0 2px #3b82f6`,
                    }),
                  }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                    }}>
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        {stage.name}
                      </Typography>
                      {stage.description && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 0.5 }}>
                          {stage.description}
                        </Typography>
                      )}
                      {stage.assignedTo && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          <strong>Assigned to:</strong> {stage.assignedTo}
                        </Typography>
                      )}
                    </Box>

                    <Chip
                      label={stage.status.replace('-', ' ').toUpperCase()}
                      size="small"
                      sx={{
                        bgcolor:
                          stage.status === 'completed'
                            ? '#dcfce7'
                            : stage.status === 'in-progress'
                              ? '#dbeafe'
                              : stage.status === 'failed'
                                ? '#fee2e2'
                                : stage.status === 'cancelled'
                                  ? '#f3f4f6'
                                  : '#f3f4f6',
                        color:
                          stage.status === 'completed'
                            ? '#166534'
                            : stage.status === 'in-progress'
                              ? '#1e40af'
                              : stage.status === 'failed'
                                ? '#991b1b'
                                : stage.status === 'cancelled'
                                  ? '#374151'
                                  : '#6b7280',
                      }}
                    />
                  </Box>

                  {/* Timestamps */}
                  <Box
                    sx={{
                      mt: 2,
                      display: 'flex',
                      gap: 2,
                      fontSize: 12,
                      color: 'text.secondary',
                    }}>
                    {stage.startedAt && (
                      <Typography variant="caption">
                        <strong>Started:</strong>{' '}
                        {new Date(stage.startedAt).toLocaleString()}
                      </Typography>
                    )}
                    {stage.completedAt && (
                      <Typography variant="caption">
                        <strong>Completed:</strong>{' '}
                        {new Date(stage.completedAt).toLocaleString()}
                      </Typography>
                    )}
                  </Box>
                </Box>

                {/* Connector line progress */}
                {index < stages.length - 1 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 32,
                      top: 64,
                      width: 2,
                      height: 'calc(100% + 12px)',
                      bgcolor: statusColor,
                    }}
                  />
                )}
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};
