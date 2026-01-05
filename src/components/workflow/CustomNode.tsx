import { memo } from 'react';
import { Handle, Position, type Node } from '@xyflow/react';
import { Box, Typography, IconButton, Chip } from '@mui/material';
import {
  PlayArrow,
  CheckCircle,
  Error as ErrorIcon,
  Settings,
  Stop,
  Edit,
  Delete,
  CallSplit,
  CallMerge,
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
  parallel_gateway: {
    background: '#00bcd4',
    color: '#fff',
  },
  parallel_join: {
    background: '#009688',
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
  decision: ErrorIcon,
  service: Settings,
  parallel_gateway: CallSplit,
  parallel_join: CallMerge,
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
      {/* Top handle for sequential flow */}
      {data.nodeType !== 'start' && (
        <Handle type="target" position={Position.Top} id="top" />
      )}

      {/* Left handle for parallel flows */}
      <Handle type="target" position={Position.Left} id="left" />
      <Handle type="source" position={Position.Left} id="left-source" />

      {/* Right handle for parallel flows */}
      <Handle type="target" position={Position.Right} id="right" />
      <Handle type="source" position={Position.Right} id="right-source" />

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
          {data.config.type === 'assignment' && data.config.roles && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {data.config.roles.map((role: string) => (
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
          {data.config.type === 'assignment' && data.config.groups && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
              {data.config.groups.map((group: string) => (
                <Chip
                  key={group}
                  label={group}
                  size="small"
                  color="primary"
                  sx={{
                    fontSize: '0.7rem',
                    height: '20px',
                  }}
                />
              ))}
            </Box>
          )}
          {data.config.type === 'service' && data.config.payload && (
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              {data.config.payload.method} Request
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

      {/* Bottom handle for sequential flow */}
      {data.nodeType !== 'end' && (
        <Handle type="source" position={Position.Bottom} id="bottom" />
      )}
    </Box>
  );
});

CustomNode.displayName = 'CustomNode';
