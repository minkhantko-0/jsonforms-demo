import { memo } from 'react';
import { Handle, Position, type Node } from '@xyflow/react';
import { Box, Typography, IconButton, Chip } from '@mui/material';
import {
  PlayArrow,
  CheckCircle,
  Error,
  Settings,
  Stop,
  Edit,
  Delete,
} from '@mui/icons-material';
import { NodeData } from '../../types/workflow';

const nodeStyles = {
  start: {
    background: '#4caf50',
    color: '#fff',
  },
  task: {
    background: '#2196f3',
    color: '#fff',
  },
  decision: {
    background: '#ff9800',
    color: '#fff',
  },
  service: {
    background: '#9c27b0',
    color: '#fff',
  },
  end: {
    background: '#f44336',
    color: '#fff',
  },
};

const nodeIcons = {
  start: PlayArrow,
  task: CheckCircle,
  decision: Error,
  service: Settings,
  end: Stop,
};

export const CustomNode = memo(({ data, id }: Node<NodeData>) => {
  const Icon = nodeIcons[data.nodeType as keyof typeof nodeIcons];
  const style = nodeStyles[data.nodeType as keyof typeof nodeStyles];

  return (
    <Box
      sx={{
        padding: 2,
        borderRadius: 2,
        minWidth: 180,
        maxWidth: 250,
        boxShadow: 2,
        ...style,
      }}>
      {data.nodeType !== 'start' && (
        <Handle type="target" position={Position.Top} />
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Icon fontSize="small" />
        <Typography variant="caption" sx={{ textTransform: 'uppercase' }}>
          {data.nodeType}
        </Typography>
      </Box>

      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
        {data.label}
      </Typography>

      {data.config && (
        <Box sx={{ mb: 1 }}>
          {data.config.type === 'assignment' &&
            data.config.payload.type === 'role' && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {('roles' in data.config.payload &&
                Array.isArray(data.config.payload.roles)
                  ? data.config.payload.roles
                  : []
                ).map((role: string) => (
                  <Chip
                    key={role}
                    label={role}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      color: 'inherit',
                      fontSize: '0.7rem',
                    }}
                  />
                ))}
              </Box>
            )}
          {data.config.type === 'service' && (
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              {'method' in data.config.payload
                ? data.config.payload.method
                : ''}{' '}
              Request
            </Typography>
          )}
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
        {data.onEdit && (
          <IconButton
            size="small"
            onClick={() => data.onEdit?.(id)}
            sx={{ color: 'inherit', padding: 0.5 }}>
            <Edit fontSize="small" />
          </IconButton>
        )}
        {data.onDelete &&
          data.nodeType !== 'start' &&
          data.nodeType !== 'end' && (
            <IconButton
              size="small"
              onClick={() => data.onDelete?.(id)}
              sx={{ color: 'inherit', padding: 0.5 }}>
              <Delete fontSize="small" />
            </IconButton>
          )}
      </Box>

      {data.nodeType !== 'end' && (
        <Handle type="source" position={Position.Bottom} />
      )}
    </Box>
  );
});

CustomNode.displayName = 'CustomNode';
