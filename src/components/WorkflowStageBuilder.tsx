import { useState } from 'react';
import {
  Card,
  CardContent,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Box,
  Typography,
  Divider,
  Paper,
  Checkbox,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  People as UsersIcon,
  Schedule as ClockIcon,
  Warning as WarningIcon,
  FilterList as FilterIcon,
  ArrowForward as ArrowForwardIcon,
  AccountTree as GitBranchIcon,
} from '@mui/icons-material';

interface Stage {
  id: number;
  type: 'sequential' | 'parallel';
  name?: string;
  assignmentType?: 'user' | 'group';
  sla?: string;
  slaBreachAction?: 'stay' | 'autoApprove' | 'autoReject' | 'goNext';
  conditional?: boolean;
  conditionExpr?: string;
  onConditionTrue?: string;
  onConditionFalse?: string;
  operator?: 'AND' | 'OR';
  branches?: Omit<Stage, 'type' | 'operator' | 'branches'>[];
}

interface StageCardProps {
  stage: Omit<Stage, 'id' | 'type' | 'operator' | 'branches'>;
  stages: Stage[];
  onChange: (
    updated: Omit<Stage, 'id' | 'type' | 'operator' | 'branches'>,
  ) => void;
  onRemove: () => void;
}

function StageCard({ stage, stages, onChange, onRemove }: StageCardProps) {
  return (
    <Card sx={{ width: 320, minWidth: 320 }}>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}>
          <TextField
            placeholder="Stage name"
            value={stage.name || ''}
            onChange={e => onChange({ ...stage, name: e.target.value })}
            size="small"
            fullWidth
            sx={{ mr: 1 }}
          />
          <IconButton onClick={onRemove} size="small">
            <DeleteIcon />
          </IconButton>
        </Box>

        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Assignment</InputLabel>
          <Select
            value={stage.assignmentType || 'user'}
            onChange={e =>
              onChange({
                ...stage,
                assignmentType: e.target.value as 'user' | 'group',
              })
            }
            label="Assignment">
            <MenuItem value="user">Individual User</MenuItem>
            <MenuItem value="group">User Group</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <ClockIcon sx={{ fontSize: 20 }} />
          <TextField
            placeholder="SLA (hrs)"
            type="number"
            value={stage.sla || ''}
            onChange={e => onChange({ ...stage, sla: e.target.value })}
            size="small"
            fullWidth
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography
            variant="body2"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 1,
              fontWeight: 500,
            }}>
            <WarningIcon sx={{ fontSize: 18 }} /> SLA Breach Action
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={stage.slaBreachAction || 'stay'}
              onChange={e =>
                onChange({
                  ...stage,
                  slaBreachAction: e.target.value as Stage['slaBreachAction'],
                })
              }
              displayEmpty>
              <MenuItem value="stay">Stay on current stage</MenuItem>
              <MenuItem value="autoApprove">Auto-approve & move next</MenuItem>
              <MenuItem value="autoReject">Auto-reject & move next</MenuItem>
              <MenuItem value="goNext">Force move to next stage</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1,
            }}>
            <Typography
              variant="body2"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                fontWeight: 500,
              }}>
              <FilterIcon sx={{ fontSize: 18 }} /> Conditional Routing
            </Typography>
            <Checkbox
              checked={stage.conditional || false}
              onChange={e =>
                onChange({ ...stage, conditional: e.target.checked })
              }
              size="small"
            />
          </Box>

          {stage.conditional && (
            <Box
              sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                placeholder="Condition expression (e.g. amount > 10000)"
                value={stage.conditionExpr || ''}
                onChange={e =>
                  onChange({ ...stage, conditionExpr: e.target.value })
                }
                size="small"
                fullWidth
              />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ArrowForwardIcon sx={{ fontSize: 18 }} />
                <FormControl size="small" fullWidth>
                  <InputLabel>If TRUE → next</InputLabel>
                  <Select
                    value={stage.onConditionTrue || ''}
                    onChange={e =>
                      onChange({ ...stage, onConditionTrue: e.target.value })
                    }
                    label="If TRUE → next">
                    {stages.map((_, i) => (
                      <MenuItem key={i} value={String(i)}>
                        Stage #{i + 1}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small" fullWidth>
                  <InputLabel>If FALSE → next</InputLabel>
                  <Select
                    value={stage.onConditionFalse || ''}
                    onChange={e =>
                      onChange({ ...stage, onConditionFalse: e.target.value })
                    }
                    label="If FALSE → next">
                    {stages.map((_, i) => (
                      <MenuItem key={i} value={String(i)}>
                        Stage #{i + 1}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export const WorkflowStageBuilder = () => {
  const [stages, setStages] = useState<Stage[]>([]);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowKey, setWorkflowKey] = useState('');

  const baseStage = {
    name: '',
    assignmentType: 'user' as const,
    sla: '',
    slaBreachAction: 'stay' as const,
    conditional: false,
    conditionExpr: '',
    onConditionTrue: '',
    onConditionFalse: '',
  };

  const addSequentialStage = () => {
    setStages([
      ...stages,
      { id: Date.now(), type: 'sequential', ...baseStage },
    ]);
  };

  const addParallelStage = () => {
    setStages([
      ...stages,
      {
        id: Date.now(),
        type: 'parallel',
        operator: 'AND' as const,
        branches: [],
      },
    ]);
  };

  const generateWorkflowDefinition = () => {
    const nodes: any[] = [];
    const transitions: any[] = [];
    let nodeCounter = 0;

    // Add start node
    nodes.push({
      key: 'start',
      description: 'Start Node',
      type: 'start',
    });

    let previousNodeKey = 'start';

    stages.forEach((stage, stageIndex) => {
      if (stage.type === 'sequential') {
        // Create task node
        const taskKey = `task_${stage.name?.replace(/\s+/g, '_').toLowerCase() || nodeCounter}`;
        nodeCounter++;

        nodes.push({
          key: taskKey,
          type: 'task',
          description: stage.name || `Task ${stageIndex + 1}`,
          config: {
            type: 'assignment',
            roles: stage.assignmentType === 'user' ? ['user'] : ['manager'],
            groups: stage.assignmentType === 'group' ? ['default_group'] : [],
            slas: stage.sla ? [`SLA${stage.sla}`] : [],
            timers: [],
          },
        });

        // Add transition from previous node to task
        transitions.push({
          fromNode: previousNodeKey,
          toNode: taskKey,
        });

        // If conditional, add decision node
        if (stage.conditional) {
          const decisionKey = `${taskKey}_decision`;
          nodes.push({
            key: decisionKey,
            type: 'decision',
            description: `Decision for ${stage.name || taskKey}`,
          });

          transitions.push({
            fromNode: taskKey,
            toNode: decisionKey,
          });

          previousNodeKey = decisionKey;
        } else {
          previousNodeKey = taskKey;
        }
      } else if (stage.type === 'parallel') {
        // Create parallel gateway
        const gatewayKey = `gateway_${nodeCounter}`;
        nodeCounter++;

        const branchData: any[] = [];
        const branchNodes: string[] = [];

        // Process branches
        stage.branches?.forEach((branch, branchIndex) => {
          const branchKey = `branch_${nodeCounter}_${branchIndex}`;
          const branchTaskKey = `${branchKey}_task`;
          const branchDecisionKey = `${branchKey}_decision`;

          branchNodes.push(branchTaskKey);
          if (branch.conditional) {
            branchNodes.push(branchDecisionKey);
          }

          branchData.push({
            key: branchKey,
            name: branch.name || `Branch ${branchIndex + 1}`,
            nodes: branch.conditional
              ? [branchTaskKey, branchDecisionKey]
              : [branchTaskKey],
          });

          // Create task node for branch
          nodes.push({
            key: branchTaskKey,
            type: 'task',
            description: branch.name || `Branch Task ${branchIndex + 1}`,
            config: {
              type: 'assignment',
              roles: branch.assignmentType === 'user' ? ['user'] : ['manager'],
              groups:
                branch.assignmentType === 'group' ? ['default_group'] : [],
              slas: branch.sla ? [`SLA${branch.sla}`] : [],
              timers: [],
            },
          });

          // Add transition from gateway to branch task
          transitions.push({
            fromNode: gatewayKey,
            toNode: branchTaskKey,
            branch: branchKey,
          });

          // If branch has conditional routing, add decision node
          if (branch.conditional) {
            nodes.push({
              key: branchDecisionKey,
              type: 'decision',
              description: `Decision for ${branch.name || branchTaskKey}`,
            });

            transitions.push({
              fromNode: branchTaskKey,
              toNode: branchDecisionKey,
            });
          }
        });

        // Add parallel gateway node
        nodes.push({
          key: gatewayKey,
          type: 'parallel_gateway',
          description: `Parallel Gateway ${stageIndex + 1}`,
          branches: branchData,
        });

        // Add transition from previous to gateway
        transitions.push({
          fromNode: previousNodeKey,
          toNode: gatewayKey,
        });

        // Create parallel join
        const joinKey = `${gatewayKey}_join`;
        nodes.push({
          key: joinKey,
          type: 'parallel_join',
          description: `Join for ${gatewayKey}`,
          config: {
            dependencies: branchData.map(b => b.key),
            condition: {
              type: 'jexl',
              expression: `\${context.variables.outputs.${gatewayKey}.totalApproval} == ${branchData.length}`,
            },
          },
        });

        // Add transitions from branches to join
        stage.branches?.forEach((branch, branchIndex) => {
          const branchKey = `branch_${nodeCounter}_${branchIndex}`;
          const lastNodeInBranch = branch.conditional
            ? `${branchKey}_decision`
            : `${branchKey}_task`;

          transitions.push({
            fromNode: lastNodeInBranch,
            toNode: joinKey,
            config: branch.conditional
              ? {
                  type: 'condition',
                  payload: {
                    type: 'jexl',
                    expression:
                      branch.conditionExpr ||
                      `\${context.variables.outputs.${branchKey}_task.isApproved} == true`,
                  },
                }
              : undefined,
          });
        });

        previousNodeKey = joinKey;
        nodeCounter++;
      }
    });

    // Add end node
    nodes.push({
      key: 'end',
      type: 'end',
      description: 'End Node',
    });

    transitions.push({
      fromNode: previousNodeKey,
      toNode: 'end',
    });

    return {
      workflowDefinitions: [
        {
          name: workflowName || 'Untitled Workflow',
          key: workflowKey || 'workflow_01',
          nodes,
          transitions,
        },
      ],
    };
  };

  const exportJson = () =>
    JSON.stringify(generateWorkflowDefinition(), null, 2);

  return (
    <Box sx={{ p: 3, display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 3 }}>
      <Box>
        <Typography variant="h5" gutterBottom>
          Workflow Setup – Stage Builder
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            label="Workflow Name"
            value={workflowName}
            onChange={e => setWorkflowName(e.target.value)}
            fullWidth
            size="small"
          />
          <TextField
            label="Workflow Key"
            value={workflowKey}
            onChange={e => setWorkflowKey(e.target.value)}
            fullWidth
            size="small"
          />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 3 }}>
          {stages.map((stage, index) => (
            <Box key={stage.id}>
              {stage.type === 'sequential' && (
                <StageCard
                  stage={stage}
                  stages={stages}
                  onChange={updated => {
                    const copy = [...stages];
                    copy[index] = { ...copy[index], ...updated };
                    setStages(copy);
                  }}
                  onRemove={() =>
                    setStages(stages.filter((_, i) => i !== index))
                  }
                />
              )}

              {stage.type === 'parallel' && (
                <Card>
                  <CardContent>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2,
                      }}>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <GitBranchIcon />
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <Select
                            value={stage.operator}
                            onChange={e => {
                              const copy = [...stages];
                              copy[index].operator = e.target.value as
                                | 'AND'
                                | 'OR';
                              setStages(copy);
                            }}>
                            <MenuItem value="AND">AND</MenuItem>
                            <MenuItem value="OR">OR</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                      <IconButton
                        onClick={() =>
                          setStages(stages.filter((_, i) => i !== index))
                        }>
                        <DeleteIcon />
                      </IconButton>
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        gap: 2,
                        overflowX: 'auto',
                        pb: 2,
                      }}>
                      {stage.branches?.map((b, bIdx) => (
                        <StageCard
                          key={bIdx}
                          stage={b}
                          stages={stages}
                          onChange={updated => {
                            const copy = [...stages];
                            if (copy[index].branches) {
                              copy[index].branches![bIdx] = {
                                ...copy[index].branches![bIdx],
                                ...updated,
                              };
                              setStages(copy);
                            }
                          }}
                          onRemove={() => {
                            const copy = [...stages];
                            copy[index].branches?.splice(bIdx, 1);
                            setStages(copy);
                          }}
                        />
                      ))}
                      <Button
                        variant="outlined"
                        onClick={() => {
                          const copy = [...stages];
                          if (!copy[index].branches) copy[index].branches = [];
                          copy[index].branches!.push({
                            ...baseStage,
                            id: Date.now(),
                          });
                          setStages(copy);
                        }}
                        sx={{ minWidth: 200 }}>
                        <AddIcon sx={{ mr: 1 }} /> Add Parallel Stage
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              )}
            </Box>
          ))}
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" onClick={addSequentialStage}>
            <AddIcon sx={{ mr: 1 }} /> Add Sequential Stage
          </Button>
          <Button variant="outlined" onClick={addParallelStage}>
            <UsersIcon sx={{ mr: 1 }} /> Add Parallel Block
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 2, height: 'fit-content', position: 'sticky', top: 20 }}>
        <Typography variant="h6" gutterBottom>
          Generated Workflow JSON
        </Typography>
        <pre
          style={{
            fontSize: 11,
            overflow: 'auto',
            maxHeight: 500,
            backgroundColor: '#f5f5f5',
            padding: 12,
            borderRadius: 4,
          }}>
          {exportJson()}
        </pre>
        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 2 }}
          onClick={() => {
            const blob = new Blob([exportJson()], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'workflow-stages.json';
            a.click();
          }}>
          Download JSON
        </Button>
      </Paper>
    </Box>
  );
};
