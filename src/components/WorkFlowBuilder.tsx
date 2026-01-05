import { useState, useCallback, useRef, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  MarkerType,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Box,
  Button,
  ButtonGroup,
  Paper,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Tooltip,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Settings,
  Stop,
  Download,
  ViewSidebar,
  ViewAgenda,
  ContentCopy,
} from '@mui/icons-material';
import { CustomNode } from './workflow/CustomNode';
import { NodeConfigDialog } from './workflow/NodeConfigDialog';
import { EdgeConfigDialog } from './workflow/EdgeConfigDialog';
import {
  NodeData,
  WorkflowDefinition,
  WorkflowNode,
  WorkflowTransition,
} from '../types/workflow';
import { CustomEdge } from './workflow/CustomEdge';

const nodeTypes = {
  custom: CustomNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

const initialNodes: Node<NodeData>[] = [
  {
    id: '1',
    type: 'custom',
    position: { x: 250, y: 50 },
    data: {
      label: 'Start',
      nodeKey: 'start',
      nodeType: 'start',
    },
  },
];

const availableRoles = ['manager', 'senior_manager', 'ceo'];

export function WorkFlowBuilder() {
  const [nodes, setNodes, onNodesChange] =
    useNodesState<Node<NodeData>>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [nodeConfigOpen, setNodeConfigOpen] = useState(false);
  const [edgeConfigOpen, setEdgeConfigOpen] = useState(false);
  const [workflowNameDialogOpen, setWorkflowNameDialogOpen] = useState(false);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowKey, setWorkflowKey] = useState('');
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [editingEdge, setEditingEdge] = useState<string | null>(null);
  const [viewLayout, setViewLayout] = useState<'side' | 'bottom'>('side');
  const nodeIdCounter = useRef(2);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge: Edge = {
        ...params,
        id: `e${params.source}-${params.target}`,
        type: 'custom',
        markerEnd: { type: MarkerType.ArrowClosed },
        data: {
          onDelete: (id: string) => {
            setEdges(eds => eds.filter(e => e.id !== id));
          },
          onEdit: (id: string) => {
            setEditingEdge(id);
            setEdgeConfigOpen(true);
          },
        },
      };
      setEdges(eds => addEdge(newEdge, eds));
    },
    [setEdges],
  );

  const addNode = useCallback(
    (type: WorkflowNode['type']) => {
      const id = `node-${nodeIdCounter.current++}`;
      const newNode: Node<NodeData> = {
        id,
        type: 'custom',
        position: {
          x: Math.random() * 400 + 100,
          y: Math.random() * 400 + 100,
        },
        data: {
          label: `New ${type}`,
          nodeKey: type === 'end' ? 'end' : `${type}_${id}`,
          nodeType: type,
          onDelete: (nodeId: string) => {
            setNodes(nds => nds.filter(n => n.id !== nodeId));
            setEdges(eds =>
              eds.filter(e => e.source !== nodeId && e.target !== nodeId),
            );
          },
          onEdit: (nodeId: string) => {
            setEditingNode(nodeId);
            setNodeConfigOpen(true);
          },
        },
      };
      setNodes(nds => nds.concat(newNode));
    },
    [setNodes, setEdges],
  );

  const handleNodeConfigSave = useCallback(
    (config: {
      label: string;
      nodeKey: string;
      config?: NodeData['config'];
    }) => {
      if (editingNode) {
        setNodes(nds =>
          nds.map(node =>
            node.id === editingNode
              ? {
                  ...node,
                  data: {
                    ...node.data,
                    label: config.label,
                    nodeKey: config.nodeKey,
                    config: config.config,
                  },
                }
              : node,
          ),
        );
        setEditingNode(null);
      }
    },
    [editingNode, setNodes],
  );

  const handleEdgeConfigSave = useCallback(
    (expression: string) => {
      if (editingEdge) {
        setEdges(eds =>
          eds.map(edge =>
            edge.id === editingEdge
              ? {
                  ...edge,
                  data: {
                    ...edge.data,
                    condition: expression,
                  },
                }
              : edge,
          ),
        );
        setEditingEdge(null);
      }
    },
    [editingEdge, setEdges],
  );

  const exportWorkflow = useCallback(() => {
    if (!workflowName || !workflowKey) {
      setWorkflowNameDialogOpen(true);
      return;
    }

    const json = generateWorkflowJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow-${workflowKey}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [workflowName, workflowKey, nodes, edges]);

  const generateWorkflowJSON = useCallback(() => {
    const workflowNodes: WorkflowNode[] = nodes.map(node => {
      const baseNode: WorkflowNode = {
        key: node.data.nodeKey,
        type: node.data.nodeType,
      };
      if (node.data.config) {
        baseNode.config = node.data.config;
      }
      return baseNode;
    });

    const workflowTransitions: WorkflowTransition[] = edges.map(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);

      const transition: WorkflowTransition = {
        fromNode: sourceNode?.data.nodeKey || '',
        toNode: targetNode?.data.nodeKey || '',
      };

      if (edge.data?.condition) {
        transition.config = {
          type: 'condition',
          payload: {
            type: 'jexl',
            expression: edge.data.condition,
          },
        };
      }

      return transition;
    });

    const workflowDefinition: WorkflowDefinition = {
      roles: [
        { id: 'manager', key: 'manager', name: 'Manager' },
        { id: 'senior_manager', key: 'senior_manager', name: 'Senior Manager' },
        { id: 'ceo', key: 'ceo', name: 'CEO' },
      ],
      users: [
        { key: 'user1', name: 'User 1', roles: ['manager'] },
        { key: 'user2', name: 'User 2', roles: ['senior_manager'] },
      ],
      workflows: [
        {
          key: workflowKey || 'workflow',
          name: workflowName || 'Untitled Workflow',
          nodes: workflowNodes,
          transitions: workflowTransitions,
        },
      ],
    };

    return JSON.stringify(workflowDefinition, null, 2);
  }, [nodes, edges, workflowName, workflowKey]);

  const workflowJSON = useMemo(
    () => generateWorkflowJSON(),
    [generateWorkflowJSON],
  );

  const handleExportClick = useCallback(() => {
    if (!workflowName || !workflowKey) {
      setWorkflowNameDialogOpen(true);
    } else {
      exportWorkflow();
    }
  }, [workflowName, workflowKey, exportWorkflow]);

  const handleWorkflowNameSave = useCallback(() => {
    setWorkflowNameDialogOpen(false);
    exportWorkflow();
  }, [exportWorkflow]);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(workflowJSON);
  }, [workflowJSON]);

  const editingNodeData = editingNode
    ? nodes.find(n => n.id === editingNode)?.data
    : undefined;

  const editingEdgeData = editingEdge
    ? edges.find(e => e.id === editingEdge)?.data?.condition
    : undefined;

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Paper sx={{ p: 2, borderRadius: 0 }} elevation={3}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <Typography variant="h5">Workflow Builder</Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Workflow Name"
              value={workflowName}
              onChange={e => setWorkflowName(e.target.value)}
              sx={{ width: 200 }}
            />
            <TextField
              size="small"
              placeholder="Workflow Key"
              value={workflowKey}
              onChange={e => setWorkflowKey(e.target.value)}
              sx={{ width: 200 }}
            />
            <ToggleButtonGroup
              value={viewLayout}
              exclusive
              onChange={(_, newLayout) => newLayout && setViewLayout(newLayout)}
              size="small">
              <ToggleButton value="side">
                <Tooltip title="Side by side">
                  <ViewSidebar />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="bottom">
                <Tooltip title="Stack vertically">
                  <ViewAgenda />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={handleExportClick}>
              Export JSON
            </Button>
          </Box>
        </Box>
      </Paper>

      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: viewLayout === 'side' ? 'row' : 'column',
          overflow: 'hidden',
        }}>
        <Box
          sx={{
            flex: viewLayout === 'side' ? '1 1 60%' : '1 1 50%',
            position: 'relative',
            minHeight: 0,
          }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView>
            <Background />
            <Controls />
            <MiniMap />

            <Panel position="top-left">
              <Paper sx={{ p: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Add Node
                </Typography>
                <ButtonGroup orientation="vertical" size="small" fullWidth>
                  <Tooltip title="Add Task Node" placement="right">
                    <Button
                      startIcon={<CheckCircle />}
                      onClick={() => addNode('task')}>
                      Task
                    </Button>
                  </Tooltip>
                  <Tooltip title="Add Decision Node" placement="right">
                    <Button
                      startIcon={<Error />}
                      onClick={() => addNode('decision')}>
                      Decision
                    </Button>
                  </Tooltip>
                  <Tooltip title="Add Service Node" placement="right">
                    <Button
                      startIcon={<Settings />}
                      onClick={() => addNode('service')}>
                      Service
                    </Button>
                  </Tooltip>
                  <Tooltip title="Add End Node" placement="right">
                    <Button startIcon={<Stop />} onClick={() => addNode('end')}>
                      End
                    </Button>
                  </Tooltip>
                </ButtonGroup>
              </Paper>
            </Panel>
          </ReactFlow>
        </Box>

        <Box
          sx={{
            flex: viewLayout === 'side' ? '1 1 40%' : '1 1 50%',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            borderLeft: viewLayout === 'side' ? '1px solid #ddd' : 'none',
            borderTop: viewLayout === 'bottom' ? '1px solid #ddd' : 'none',
          }}>
          <Paper
            sx={{
              p: 2,
              borderRadius: 0,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
            elevation={1}>
            <Typography variant="h6">Workflow JSON</Typography>
            <Tooltip title="Copy to clipboard">
              <IconButton onClick={copyToClipboard} size="small">
                <ContentCopy />
              </IconButton>
            </Tooltip>
          </Paper>
          <Box
            sx={{
              flex: 1,
              overflow: 'auto',
              bgcolor: '#1e1e1e',
              color: '#d4d4d4',
              p: 2,
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              minHeight: 0,
            }}>
            <pre
              style={{
                margin: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}>
              {workflowJSON}
            </pre>
          </Box>
        </Box>
      </Box>

      <NodeConfigDialog
        open={nodeConfigOpen}
        onClose={() => {
          setNodeConfigOpen(false);
          setEditingNode(null);
        }}
        onSave={handleNodeConfigSave}
        initialData={editingNodeData}
        availableRoles={availableRoles}
      />

      <EdgeConfigDialog
        open={edgeConfigOpen}
        onClose={() => {
          setEdgeConfigOpen(false);
          setEditingEdge(null);
        }}
        onSave={handleEdgeConfigSave}
        initialExpression={editingEdgeData}
      />

      <Dialog
        open={workflowNameDialogOpen}
        onClose={() => setWorkflowNameDialogOpen(false)}>
        <DialogTitle>Workflow Details</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Workflow Name"
              value={workflowName}
              onChange={e => setWorkflowName(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Workflow Key"
              value={workflowKey}
              onChange={e => setWorkflowKey(e.target.value)}
              fullWidth
              required
              helperText="Unique identifier (e.g., csv_upload_v1)"
            />
          </Box>
        </DialogContent>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={() => setWorkflowNameDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleWorkflowNameSave}
            variant="contained"
            disabled={!workflowName || !workflowKey}>
            Export
          </Button>
        </Box>
      </Dialog>
    </Box>
  );
}
