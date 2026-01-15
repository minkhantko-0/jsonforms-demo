import { useState, useCallback, useRef, useEffect } from 'react';
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
  Tabs,
  Tab,
  IconButton,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  CheckCircle,
  Error as ErrorIcon,
  Settings,
  Stop,
  Download,
  Code,
  AccountTree,
  Sync,
  Upload,
  CallSplit,
  CallMerge,
  CloudUpload,
  FolderOpen,
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
import Editor from '@monaco-editor/react';

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
const availableGroups = ['operation', 'security', 'finance', 'hr'];

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
  const [currentTab, setCurrentTab] = useState(0);
  const [jsonValue, setJsonValue] = useState('');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [savedWorkflows, setSavedWorkflows] = useState<
    Array<{ id: number; name: string; data: WorkflowDefinition }>
  >([]);
  const nodeIdCounter = useRef(2);
  const syncInProgress = useRef(false);

  const API_URL = 'https://41l5r34h-3000.asse.devtunnels.ms/';

  // Helper function to create better layout for imported workflows
  const createLayoutPositions = useCallback(
    (nodes: WorkflowNode[], transitions: WorkflowTransition[]) => {
      const positioned: Record<string, { x: number; y: number }> = {};
      const layers: Record<number, string[]> = {};
      const nodeWidth = 250;
      const horizontalSpacing = 100;
      const verticalSpacing = 150;

      // Find parallel branches
      const parallelBranches: Record<string, string[]> = {};
      nodes.forEach(node => {
        if (node.type === 'parallel_gateway' && node.branches) {
          node.branches.forEach(branch => {
            parallelBranches[branch.key] = branch.nodes;
          });
        }
      });

      // Build dependency graph for layering
      const inDegree: Record<string, number> = {};
      const children: Record<string, string[]> = {};

      nodes.forEach(node => {
        inDegree[node.key] = 0;
        children[node.key] = [];
      });

      transitions.forEach(t => {
        if (!children[t.fromNode]) children[t.fromNode] = [];
        children[t.fromNode].push(t.toNode);
        inDegree[t.toNode] = (inDegree[t.toNode] || 0) + 1;
      });

      // Layered positioning using topological sort
      const queue: string[] = [];
      const nodeLayer: Record<string, number> = {};

      Object.keys(inDegree).forEach(key => {
        if (inDegree[key] === 0) {
          queue.push(key);
          nodeLayer[key] = 0;
          if (!layers[0]) layers[0] = [];
          layers[0].push(key);
        }
      });

      const tempInDegree = { ...inDegree };
      while (queue.length > 0) {
        const current = queue.shift()!;
        const layer = nodeLayer[current];

        (children[current] || []).forEach(child => {
          tempInDegree[child]--;
          if (tempInDegree[child] === 0) {
            const childLayer = layer + 1;
            nodeLayer[child] = childLayer;
            if (!layers[childLayer]) layers[childLayer] = [];
            layers[childLayer].push(child);
            queue.push(child);
          }
        });
      }

      // Position nodes layer by layer
      Object.keys(layers)
        .sort((a, b) => Number(a) - Number(b))
        .forEach(layerKey => {
          const layer = Number(layerKey);
          const nodesInLayer = layers[layer];
          const layerWidth =
            nodesInLayer.length * (nodeWidth + horizontalSpacing);
          const startX = Math.max(100, (1000 - layerWidth) / 2);

          nodesInLayer.forEach((nodeKey, idx) => {
            // Check if node is in a parallel branch
            let branchOffset = 0;
            Object.keys(parallelBranches).forEach((branchKey, branchIdx) => {
              if (parallelBranches[branchKey].includes(nodeKey)) {
                const numBranches = Object.keys(parallelBranches).length;
                branchOffset = (branchIdx - (numBranches - 1) / 2) * 350;
              }
            });

            positioned[nodeKey] = {
              x:
                branchOffset !== 0
                  ? 500 + branchOffset
                  : startX + idx * (nodeWidth + horizontalSpacing),
              y: layer * verticalSpacing + 50,
            };
          });
        });

      return positioned;
    },
    [],
  );

  const syncBuilderToJson = useCallback(() => {
    const workflowNodes: WorkflowNode[] = nodes.map(node => {
      const baseNode: WorkflowNode = {
        key: node.data.nodeKey,
        type: node.data.nodeType,
      };
      if (node.data.label && node.data.label !== node.data.nodeKey) {
        baseNode.description = node.data.label;
      }
      if (node.data.config) {
        baseNode.config = node.data.config;
      }
      if (node.data.branches) {
        baseNode.branches = node.data.branches;
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

      if (edge.data?.branch) {
        transition.branch = edge.data.branch as string;
      }

      if (edge.data?.condition) {
        transition.config = {
          type: 'condition',
          payload: {
            type: 'jexl',
            expression: edge.data.condition as string,
          },
        };
      }

      return transition;
    });

    const workflowDefinition: WorkflowDefinition = {
      workflowDefinitions: [
        {
          key: workflowKey || 'workflow_01',
          name: workflowName || 'New Workflow',
          nodes: workflowNodes,
          transitions: workflowTransitions,
        },
      ],
    };

    setJsonValue(JSON.stringify(workflowDefinition, null, 2));
  }, [nodes, edges, workflowName, workflowKey]);

  // Sync builder to JSON whenever nodes or edges change
  useEffect(() => {
    if (currentTab === 1 && !syncInProgress.current) {
      syncBuilderToJson();
    }
  }, [nodes, edges, currentTab, syncBuilderToJson]);

  const syncJsonToBuilder = useCallback(() => {
    try {
      syncInProgress.current = true;
      const parsed = JSON.parse(jsonValue) as WorkflowDefinition;

      if (
        !parsed.workflowDefinitions ||
        parsed.workflowDefinitions.length === 0
      ) {
        throw new Error('Invalid workflow definition structure');
      }

      const workflow = parsed.workflowDefinitions[0];
      setWorkflowName(workflow.name);
      setWorkflowKey(workflow.key);

      // Use helper function to create better layout
      const positions = createLayoutPositions(
        workflow.nodes,
        workflow.transitions,
      );

      // Convert workflow nodes to React Flow nodes
      const newNodes: Node<NodeData>[] = workflow.nodes.map((wNode, index) => {
        const id = wNode.key === 'start' ? '1' : `node-${index + 2}`;
        const position = positions[wNode.key] || {
          x: 250,
          y: 100 + index * 150,
        };

        return {
          id,
          type: 'custom',
          position,
          data: {
            label: wNode.description || wNode.key,
            nodeKey: wNode.key,
            nodeType: wNode.type,
            config: wNode.config,
            branches: wNode.branches,
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
      });

      // Convert workflow transitions to React Flow edges
      const newEdges: Edge[] = workflow.transitions
        .map((transition, index) => {
          const sourceNode = newNodes.find(
            n => n.data.nodeKey === transition.fromNode,
          );
          const targetNode = newNodes.find(
            n => n.data.nodeKey === transition.toNode,
          );

          if (!sourceNode || !targetNode) {
            return null;
          }

          return {
            id: `e${sourceNode.id}-${targetNode.id}-${index}`,
            source: sourceNode.id,
            target: targetNode.id,
            type: 'custom',
            markerEnd: { type: MarkerType.ArrowClosed },
            data: {
              condition:
                transition.config?.payload?.expression ||
                transition.config?.expression,
              branch: transition.branch,
              onDelete: (id: string) => {
                setEdges(eds => eds.filter(e => e.id !== id));
              },
              onEdit: (id: string) => {
                setEditingEdge(id);
                setEdgeConfigOpen(true);
              },
            },
          };
        })
        .filter(Boolean) as Edge[];

      setNodes(newNodes);
      setEdges(newEdges);
      nodeIdCounter.current = newNodes.length + 1;

      setSnackbar({
        open: true,
        message: 'JSON synced to builder successfully!',
        severity: 'success',
      });

      setTimeout(() => {
        syncInProgress.current = false;
      }, 100);
    } catch (error: unknown) {
      setSnackbar({
        open: true,
        message: `Failed to sync JSON: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error',
      });
      syncInProgress.current = false;
    }
  }, [jsonValue, setNodes, setEdges, createLayoutPositions]);

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
      branches?: NodeData['branches'];
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
                    branches: config.branches,
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
      if (node.data.label && node.data.label !== node.data.nodeKey) {
        baseNode.description = node.data.label;
      }
      if (node.data.config) {
        baseNode.config = node.data.config;
      }
      if (node.data.branches) {
        baseNode.branches = node.data.branches;
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

      if (edge.data?.branch) {
        transition.branch = edge.data.branch as string;
      }

      if (edge.data?.condition) {
        transition.config = {
          type: 'condition',
          payload: {
            type: 'jexl',
            expression: edge.data.condition as string,
          },
        };
      }

      return transition;
    });

    const workflowDefinition: WorkflowDefinition = {
      workflowDefinitions: [
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

  const loadSavedWorkflows = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}api/v1/workflows`);
      if (response.ok) {
        const workflows = await response.json();
        // setSavedWorkflows(workflows);
      }
    } catch (error) {
      console.error('Failed to load workflows:', error);
    }
  }, []);

  const saveWorkflowToApi = useCallback(async () => {
    if (!workflowName || !workflowKey) {
      setWorkflowNameDialogOpen(true);
      return;
    }

    const workflowNodes: WorkflowNode[] = nodes.map(node => {
      const baseNode: WorkflowNode = {
        key: node.data.nodeKey,
        type: node.data.nodeType,
      };
      if (node.data.label && node.data.label !== node.data.nodeKey) {
        baseNode.description = node.data.label;
      }
      if (node.data.config) {
        baseNode.config = node.data.config;
      }
      if (node.data.branches) {
        baseNode.branches = node.data.branches;
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

      if (edge.data?.branch) {
        transition.branch = edge.data.branch as string;
      }

      if (edge.data?.condition) {
        transition.config = {
          type: 'condition',
          payload: {
            type: 'jexl',
            expression: edge.data.condition as string,
          },
        };
      }

      return transition;
    });

    // Send only the first workflow definition object (not array)
    const workflowDefinitionObject = {
      key: workflowKey,
      name: workflowName,
      nodes: workflowNodes,
      transitions: workflowTransitions,
    };

    try {
      const response = await fetch(`${API_URL}api/v1/workflows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflowDefinitionObject),
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: 'Workflow saved successfully!',
          severity: 'success',
        });
        await loadSavedWorkflows();
      } else {
        throw new Error('Save failed');
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to save workflow',
        severity: 'error',
      });
    }
  }, [nodes, edges, workflowName, workflowKey, loadSavedWorkflows]);

  const loadWorkflowById = useCallback(
    async (id: number) => {
      try {
        const response = await fetch(`${API_URL}/workflow-definitions/${id}`);
        if (response.ok) {
          const workflow = await response.json();

          // Import the workflow data
          const def = workflow.data.workflowDefinitions[0];
          if (def) {
            setWorkflowName(def.name);
            setWorkflowKey(def.key);

            const positionedNodes = createLayoutPositions(
              def.nodes,
              def.transitions,
            );

            const newNodes = def.nodes.map(
              (wfNode: WorkflowNode, index: number) => {
                const position = positionedNodes[wfNode.key] || {
                  x: 100,
                  y: index * 150,
                };
                const id = `${Date.now()}-${index}`;
                return {
                  id,
                  type: 'custom',
                  position,
                  data: {
                    label: wfNode.description || wfNode.key,
                    nodeKey: wfNode.key,
                    nodeType: wfNode.type,
                    config: wfNode.config,
                    branches: wfNode.branches,
                    onDelete: (nodeId: string) => {
                      setNodes(nds => nds.filter(n => n.id !== nodeId));
                      setEdges(eds =>
                        eds.filter(
                          e => e.source !== nodeId && e.target !== nodeId,
                        ),
                      );
                    },
                    onEdit: (nodeId: string) => {
                      setEditingNode(nodeId);
                      setNodeConfigOpen(true);
                    },
                  },
                };
              },
            );

            const newEdges = def.transitions.map(
              (trans: WorkflowTransition, index: number) => {
                const sourceNode = newNodes.find(
                  (n: Node) => n.data.nodeKey === trans.fromNode,
                );
                const targetNode = newNodes.find(
                  (n: Node) => n.data.nodeKey === trans.toNode,
                );

                return {
                  id: `e${Date.now()}-${index}`,
                  source: sourceNode?.id || '',
                  target: targetNode?.id || '',
                  type: 'custom',
                  markerEnd: { type: MarkerType.ArrowClosed },
                  data: {
                    branch: trans.branch,
                    condition: trans.config?.payload?.expression,
                    onDelete: (id: string) => {
                      setEdges(eds => eds.filter(e => e.id !== id));
                    },
                    onEdit: (id: string) => {
                      setEditingEdge(id);
                      setEdgeConfigDialog(true);
                    },
                  },
                };
              },
            );

            setNodes(newNodes);
            setEdges(newEdges);

            setSnackbar({
              open: true,
              message: `Loaded workflow: ${def.name}`,
              severity: 'success',
            });
          }
        }
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Failed to load workflow',
          severity: 'error',
        });
      }
    },
    [createLayoutPositions, setNodes, setEdges],
  );

  useEffect(() => {
    loadSavedWorkflows();
  }, [loadSavedWorkflows]);

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

  const handleImportJson = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = e => {
        try {
          const content = e.target?.result as string;
          setJsonValue(content);
          syncInProgress.current = true;

          const parsed = JSON.parse(content) as WorkflowDefinition;
          if (
            !parsed.workflowDefinitions ||
            parsed.workflowDefinitions.length === 0
          ) {
            throw new Error('Invalid workflow definition structure');
          }

          const workflow = parsed.workflowDefinitions[0];
          setWorkflowName(workflow.name);
          setWorkflowKey(workflow.key);

          // Use helper function to create better layout
          const positions = createLayoutPositions(
            workflow.nodes,
            workflow.transitions,
          );

          // Convert to nodes and edges
          const newNodes: Node<NodeData>[] = workflow.nodes.map(
            (wNode, index) => {
              const id = wNode.key === 'start' ? '1' : `node-${index + 2}`;
              const position = positions[wNode.key] || {
                x: 250,
                y: 100 + index * 150,
              };

              return {
                id,
                type: 'custom',
                position,
                data: {
                  label: wNode.description || wNode.key,
                  nodeKey: wNode.key,
                  nodeType: wNode.type,
                  config: wNode.config,
                  branches: wNode.branches,
                  onDelete: (nodeId: string) => {
                    setNodes(nds => nds.filter(n => n.id !== nodeId));
                    setEdges(eds =>
                      eds.filter(
                        e => e.source !== nodeId && e.target !== nodeId,
                      ),
                    );
                  },
                  onEdit: (nodeId: string) => {
                    setEditingNode(nodeId);
                    setNodeConfigOpen(true);
                  },
                },
              };
            },
          );

          const newEdges: Edge[] = workflow.transitions
            .map((transition, index) => {
              const sourceNode = newNodes.find(
                n => n.data.nodeKey === transition.fromNode,
              );
              const targetNode = newNodes.find(
                n => n.data.nodeKey === transition.toNode,
              );

              if (!sourceNode || !targetNode) {
                return null;
              }

              return {
                id: `e${sourceNode.id}-${targetNode.id}-${index}`,
                source: sourceNode.id,
                target: targetNode.id,
                type: 'custom',
                markerEnd: { type: MarkerType.ArrowClosed },
                data: {
                  condition:
                    transition.config?.payload?.expression ||
                    transition.config?.expression,
                  branch: transition.branch,
                  onDelete: (id: string) => {
                    setEdges(eds => eds.filter(e => e.id !== id));
                  },
                  onEdit: (id: string) => {
                    setEditingEdge(id);
                    setEdgeConfigOpen(true);
                  },
                },
              };
            })
            .filter(Boolean) as Edge[];

          setNodes(newNodes);
          setEdges(newEdges);
          nodeIdCounter.current = newNodes.length + 1;

          setSnackbar({
            open: true,
            message: 'Workflow imported successfully!',
            severity: 'success',
          });

          setTimeout(() => {
            syncInProgress.current = false;
          }, 100);
        } catch (error: unknown) {
          setSnackbar({
            open: true,
            message: `Failed to import JSON: ${error instanceof Error ? error.message : 'Unknown error'}`,
            severity: 'error',
          });
        }
      };
      reader.readAsText(file);
      // Reset input
      event.target.value = '';
    },
    [setNodes, setEdges],
  );

  const editingNodeData = editingNode
    ? nodes.find(n => n.id === editingNode)?.data
    : undefined;

  const editingEdgeData = editingEdge
    ? (edges.find(e => e.id === editingEdge)?.data?.condition as
        | string
        | undefined)
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
            {currentTab === 1 && (
              <Tooltip title="Sync JSON to Builder">
                <IconButton
                  color="primary"
                  onClick={syncJsonToBuilder}
                  size="small">
                  <Sync />
                </IconButton>
              </Tooltip>
            )}
            <Button component="label" variant="outlined" startIcon={<Upload />}>
              Import JSON
              <input
                type="file"
                hidden
                accept=".json"
                onChange={handleImportJson}
              />
            </Button>
            <Button
              variant="outlined"
              startIcon={<CloudUpload />}
              onClick={saveWorkflowToApi}
              disabled={!workflowName || !workflowKey}>
              Save to API
            </Button>
            {/* <Button
              variant="contained"
              startIcon={<Download />}
              onClick={handleExportClick}>
              Export JSON
            </Button> */}
          </Box>
        </Box>
        <Tabs
          value={currentTab}
          onChange={(_, val) => setCurrentTab(val)}
          sx={{ mt: 1 }}>
          <Tab icon={<AccountTree />} label="Builder" iconPosition="start" />
          <Tab icon={<Code />} label="JSON View" iconPosition="start" />
        </Tabs>
      </Paper>

      {currentTab === 0 ? (
        <Box sx={{ flexGrow: 1, position: 'relative' }}>
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
                      startIcon={<ErrorIcon />}
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
                  <Tooltip title="Add Parallel Gateway" placement="right">
                    <Button
                      startIcon={<CallSplit />}
                      onClick={() => addNode('parallel_gateway')}>
                      Parallel Gateway
                    </Button>
                  </Tooltip>
                  <Tooltip title="Add Parallel Join" placement="right">
                    <Button
                      startIcon={<CallMerge />}
                      onClick={() => addNode('parallel_join')}>
                      Parallel Join
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

            <Panel position="top-right">
              <Paper
                sx={{ p: 1, maxWidth: 300, maxHeight: 400, overflow: 'auto' }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Saved Workflows
                </Typography>
                {savedWorkflows.length === 0 ? (
                  <Typography variant="caption" color="text.secondary">
                    No saved workflows
                  </Typography>
                ) : (
                  <Box
                    sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {savedWorkflows.map(wf => (
                      <Button
                        key={wf.id}
                        size="small"
                        variant="outlined"
                        startIcon={<FolderOpen />}
                        onClick={() => loadWorkflowById(wf.id)}
                        sx={{
                          justifyContent: 'flex-start',
                          textAlign: 'left',
                        }}>
                        {wf.name}
                      </Button>
                    ))}
                  </Box>
                )}
              </Paper>
            </Panel>
          </ReactFlow>
        </Box>
      ) : (
        <Box sx={{ flexGrow: 1, p: 2, overflow: 'auto' }}>
          <Editor
            height="100%"
            defaultLanguage="json"
            value={jsonValue}
            onChange={value => setJsonValue(value || '')}
            options={{
              minimap: { enabled: true },
              formatOnPaste: true,
              formatOnType: true,
              automaticLayout: true,
            }}
            theme="vs-dark"
          />
        </Box>
      )}

      <NodeConfigDialog
        open={nodeConfigOpen}
        onClose={() => {
          setNodeConfigOpen(false);
          setEditingNode(null);
        }}
        onSave={handleNodeConfigSave}
        initialData={editingNodeData}
        availableRoles={availableRoles}
        availableGroups={availableGroups}
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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
