import { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type Position,
} from '@xyflow/react';
import { IconButton, Box, Typography } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';

type CustomEdgeData = {
  condition?: string;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
};

type CustomEdgeProps = {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: Position;
  targetPosition: Position;
  data?: CustomEdgeData;
  markerEnd?: string;
};

export const CustomEdge = memo((props: CustomEdgeProps) => {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
    markerEnd,
  } = props;

  const edgeData = (data || {}) as CustomEdgeData;

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} />
      <EdgeLabelRenderer>
        <Box
          sx={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            background: '#fff',
            padding: '4px 8px',
            borderRadius: 1,
            fontSize: '10px',
            fontWeight: 500,
            border: '1px solid #ddd',
            pointerEvents: 'all',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
          className="nodrag nopan">
          {edgeData?.condition && (
            <Typography
              variant="caption"
              sx={{ fontSize: '10px', maxWidth: 120 }}>
              {edgeData.condition}
            </Typography>
          )}

          <Box sx={{ display: 'flex', gap: 0.25 }}>
            {edgeData?.onEdit && (
              <IconButton
                size="small"
                onClick={() => edgeData.onEdit?.(id)}
                sx={{ padding: 0.25 }}>
                <Edit sx={{ fontSize: 14 }} />
              </IconButton>
            )}
            {edgeData?.onDelete && (
              <IconButton
                size="small"
                onClick={() => edgeData.onDelete?.(id)}
                sx={{ padding: 0.25 }}>
                <Delete sx={{ fontSize: 14 }} />
              </IconButton>
            )}
          </Box>
        </Box>
      </EdgeLabelRenderer>
    </>
  );
});

CustomEdge.displayName = 'CustomEdge';
