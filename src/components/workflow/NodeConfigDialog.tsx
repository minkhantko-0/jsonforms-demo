import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  OutlinedInput,
  SelectChangeEvent,
  Typography,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import {
  NodeConfig,
  ServicePayload,
  ParallelBranch,
  SLA,
  SLALevel,
  SLAAction,
} from '../../types/workflow';

interface NodeConfigDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (config: {
    label: string;
    nodeKey: string;
    config?: NodeConfig;
    branches?: ParallelBranch[];
  }) => void;
  initialData?: {
    label: string;
    nodeKey: string;
    nodeType: string;
    config?: NodeConfig;
    branches?: ParallelBranch[];
  };
  availableRoles?: string[];
  availableGroups?: string[];
  availableSLAs?: string[];
  availableTimers?: string[];
}

export function NodeConfigDialog({
  open,
  onClose,
  onSave,
  initialData,
  availableRoles = ['manager', 'senior_manager', 'ceo'],
  availableGroups = ['operation', 'security', 'finance', 'hr'],
  availableSLAs = ['SLA01', 'SLA02', 'SLA03'],
  availableTimers = ['Timer01', 'Timer02'],
}: NodeConfigDialogProps) {
  const [label, setLabel] = useState('');
  const [nodeKey, setNodeKey] = useState('');
  const [configType, setConfigType] = useState<
    'assignment' | 'service' | 'none'
  >('none');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [sla, setSla] = useState<SLA | null>(null);
  const [httpMethod, setHttpMethod] = useState<
    'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  >('POST');
  const [url, setUrl] = useState('');
  const [requestBody, setRequestBody] = useState('{}');
  const [branches, setBranches] = useState<ParallelBranch[]>([]);
  const [dependencies, setDependencies] = useState<string[]>([]);
  const [condition, setCondition] = useState('');

  useEffect(() => {
    if (initialData) {
      setLabel(initialData.label);
      setNodeKey(initialData.nodeKey);

      if (initialData.config) {
        setConfigType(initialData.config.type);
        if (initialData.config.type === 'assignment') {
          setSelectedRoles(initialData.config.roles || []);
          setSelectedGroups(initialData.config.groups || []);
          setSla(initialData.config.slas?.[0] || null);
        } else if (initialData.config.type === 'service') {
          const payload = initialData.config.payload;
          if (payload) {
            setHttpMethod(payload.method);
            setUrl(payload.url);
            setRequestBody(JSON.stringify(payload.body || {}, null, 2));
          }
        }
        if (initialData.config.dependencies) {
          setDependencies(initialData.config.dependencies);
        }
        if (initialData.config.condition) {
          setCondition(initialData.config.condition.expression || '');
        }
      }

      if (initialData.branches) {
        setBranches(initialData.branches);
      }
    } else {
      // Reset for new node
      setLabel('');
      setNodeKey('');
      setConfigType('none');
      setSelectedRoles([]);
      setSelectedGroups([]);
      setSla(null);
      setHttpMethod('POST');
      setUrl('');
      setRequestBody('{}');
      setBranches([]);
      setDependencies([]);
      setCondition('');
    }
  }, [initialData, open]);

  const handleRoleChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setSelectedRoles(typeof value === 'string' ? value.split(',') : value);
  };

  const handleGroupChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setSelectedGroups(typeof value === 'string' ? value.split(',') : value);
  };

  const addSLA = () => {
    setSla({
      name: `SLA for ${label || 'Task'}`,
      variant: 'node',
      levels: [],
    });
  };

  const addSLALevel = () => {
    if (!sla) return;
    const newLevel: SLALevel = {
      level: sla.levels.length + 1,
      targetDuration: '0.1m',
      condition: {
        type: 'jexl',
        expression: "${local.variables.status} == 'pending'",
      },
      actions: [],
    };
    setSla({ ...sla, levels: [...sla.levels, newLevel] });
  };

  const updateSLALevel = (
    levelIndex: number,
    field: keyof SLALevel,
    value: any,
  ) => {
    if (!sla) return;
    const updatedLevels = [...sla.levels];
    updatedLevels[levelIndex] = {
      ...updatedLevels[levelIndex],
      [field]: value,
    };
    setSla({ ...sla, levels: updatedLevels });
  };

  const deleteSLALevel = (levelIndex: number) => {
    if (!sla) return;
    const updatedLevels = sla.levels.filter((_, idx) => idx !== levelIndex);
    setSla({ ...sla, levels: updatedLevels });
  };

  const addSLAAction = (
    levelIndex: number,
    actionType: 'service' | 'escalate' | 'mutation',
  ) => {
    if (!sla) return;
    const updatedLevels = [...sla.levels];
    const newAction: SLAAction = {
      name:
        actionType === 'service'
          ? 'Send Reminder Noti'
          : `Action ${updatedLevels[levelIndex].actions.length + 1}`,
      type: actionType,
      config: {
        type:
          actionType === 'service'
            ? 'http'
            : actionType === 'escalate'
              ? 'role'
              : 'transition',
        ...(actionType === 'service' && {
          method: 'POST',
          url: 'https://41l5r34h-3001.asse.devtunnels.ms/api/notifications',
          body: {
            title: 'Check your inbox!',
            message: 'Please check your inbox for tasks approval.',
          },
          headers: 'Authorization ${context.variables.access_token}',
        }),
        ...(actionType === 'escalate' && { roles: ['ceo'] }),
        ...(actionType === 'mutation' && { toNode: 'end' }),
      },
    };
    updatedLevels[levelIndex].actions.push(newAction);
    setSla({ ...sla, levels: updatedLevels });
  };

  const updateSLAAction = (
    levelIndex: number,
    actionIndex: number,
    field: string,
    value: any,
  ) => {
    if (!sla) return;
    const updatedLevels = [...sla.levels];
    const action = updatedLevels[levelIndex].actions[actionIndex];

    if (field.startsWith('config.')) {
      const configField = field.split('.')[1];
      action.config = { ...action.config, [configField]: value };
    } else {
      (action as any)[field] = value;
    }

    setSla({ ...sla, levels: updatedLevels });
  };

  const deleteSLAAction = (levelIndex: number, actionIndex: number) => {
    if (!sla) return;
    const updatedLevels = [...sla.levels];
    updatedLevels[levelIndex].actions = updatedLevels[
      levelIndex
    ].actions.filter((_, idx) => idx !== actionIndex);
    setSla({ ...sla, levels: updatedLevels });
  };

  const handleSave = () => {
    let config: NodeConfig | undefined;

    if (configType === 'assignment') {
      config = {
        type: 'assignment',
        roles: selectedRoles,
        groups: selectedGroups,
        ...(sla && sla.levels.length > 0 && { slas: [sla] }),
      };
    } else if (configType === 'service') {
      try {
        const body = JSON.parse(requestBody);
        config = {
          type: 'service',
          payload: {
            type: 'http',
            method: httpMethod,
            url,
            body,
          },
        };
      } catch (e) {
        alert('Invalid JSON in request body');
        return;
      }
    }

    // Add dependencies and condition for parallel_join nodes
    if (initialData?.nodeType === 'parallel_join') {
      if (!config) config = { type: 'assignment' };
      if (dependencies.length > 0) {
        config.dependencies = dependencies;
      }
      if (condition) {
        config.condition = {
          type: 'jexl',
          expression: condition,
        };
      }
    }

    onSave({
      label,
      nodeKey,
      config,
      branches: branches.length > 0 ? branches : undefined,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Configure Node</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Node Label"
            value={label}
            onChange={e => setLabel(e.target.value)}
            fullWidth
            required
          />

          <TextField
            label="Node Key"
            value={nodeKey}
            onChange={e => setNodeKey(e.target.value)}
            fullWidth
            required
            helperText="Unique identifier for this node"
          />

          {(initialData?.nodeType === 'task' ||
            initialData?.nodeType === 'service') && (
            <>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2">Node Configuration</Typography>

              <FormControl fullWidth>
                <InputLabel>Configuration Type</InputLabel>
                <Select
                  value={configType}
                  onChange={e =>
                    setConfigType(
                      e.target.value as 'assignment' | 'service' | 'none',
                    )
                  }
                  label="Configuration Type">
                  <MenuItem value="none">None</MenuItem>
                  {initialData?.nodeType === 'task' && (
                    <MenuItem value="assignment">
                      Assignment (Role/User)
                    </MenuItem>
                  )}
                  {initialData?.nodeType === 'service' && (
                    <MenuItem value="service">Service (HTTP)</MenuItem>
                  )}
                </Select>
              </FormControl>

              {configType === 'assignment' && (
                <>
                  <FormControl fullWidth>
                    <InputLabel>Roles</InputLabel>
                    <Select
                      multiple
                      value={selectedRoles}
                      onChange={handleRoleChange}
                      input={<OutlinedInput label="Roles" />}
                      renderValue={selected => (
                        <Box
                          sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map(value => (
                            <Chip key={value} label={value} size="small" />
                          ))}
                        </Box>
                      )}>
                      {availableRoles.map(role => (
                        <MenuItem key={role} value={role}>
                          {role}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Groups</InputLabel>
                    <Select
                      multiple
                      value={selectedGroups}
                      onChange={handleGroupChange}
                      input={<OutlinedInput label="Groups" />}
                      renderValue={selected => (
                        <Box
                          sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map(value => (
                            <Chip key={value} label={value} size="small" />
                          ))}
                        </Box>
                      )}>
                      {availableGroups.map(group => (
                        <MenuItem key={group} value={group}>
                          {group}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* SLA Configuration */}
                  <Divider sx={{ my: 2 }} />
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <Typography variant="subtitle2">
                      SLA Configuration (Optional)
                    </Typography>
                    {!sla ? (
                      <Button
                        startIcon={<AddIcon />}
                        onClick={addSLA}
                        size="small"
                        variant="outlined">
                        Add SLA
                      </Button>
                    ) : (
                      <Button
                        startIcon={<DeleteIcon />}
                        onClick={() => setSla(null)}
                        size="small"
                        color="error">
                        Remove SLA
                      </Button>
                    )}
                  </Box>

                  {sla && (
                    <Box sx={{ mt: 2 }}>
                      <TextField
                        label="SLA Name"
                        value={sla.name}
                        onChange={e => setSla({ ...sla, name: e.target.value })}
                        fullWidth
                        size="small"
                        sx={{ mb: 2 }}
                      />

                      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                        <InputLabel>Variant</InputLabel>
                        <Select
                          value={sla.variant}
                          onChange={e =>
                            setSla({
                              ...sla,
                              variant: e.target.value as 'node' | 'workflow',
                            })
                          }
                          label="Variant">
                          <MenuItem value="node">Node</MenuItem>
                          <MenuItem value="workflow">Workflow</MenuItem>
                        </Select>
                      </FormControl>

                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 1,
                        }}>
                        <Typography variant="body2" fontWeight="bold">
                          SLA Levels
                        </Typography>
                        <Button
                          startIcon={<AddIcon />}
                          onClick={addSLALevel}
                          size="small">
                          Add Level
                        </Button>
                      </Box>

                      {sla.levels.map((level, levelIdx) => (
                        <Accordion key={levelIdx} sx={{ mb: 1 }}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>
                              Level {level.level} - {level.targetDuration}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={e => {
                                e.stopPropagation();
                                deleteSLALevel(levelIdx);
                              }}
                              sx={{ ml: 'auto', mr: 1 }}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Box
                              sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2,
                              }}>
                              <TextField
                                label="Target Duration"
                                value={level.targetDuration}
                                onChange={e =>
                                  updateSLALevel(
                                    levelIdx,
                                    'targetDuration',
                                    e.target.value,
                                  )
                                }
                                size="small"
                                fullWidth
                                placeholder="e.g., 30mins, 1hour, 2days"
                              />

                              <TextField
                                label="Condition Expression"
                                value={level.condition.expression}
                                onChange={e =>
                                  updateSLALevel(levelIdx, 'condition', {
                                    type: 'jexl',
                                    expression: e.target.value,
                                  })
                                }
                                size="small"
                                fullWidth
                                multiline
                                rows={2}
                                placeholder="${local.variables.status} == 'pending'"
                              />

                              <Divider />
                              <Box>
                                <Box
                                  sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    mb: 1,
                                  }}>
                                  <Typography variant="body2">
                                    Actions
                                  </Typography>
                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button
                                      size="small"
                                      onClick={() =>
                                        addSLAAction(levelIdx, 'service')
                                      }>
                                      + Service
                                    </Button>
                                    <Button
                                      size="small"
                                      onClick={() =>
                                        addSLAAction(levelIdx, 'escalate')
                                      }>
                                      + Escalate
                                    </Button>
                                    <Button
                                      size="small"
                                      onClick={() =>
                                        addSLAAction(levelIdx, 'mutation')
                                      }>
                                      + Mutation
                                    </Button>
                                  </Box>
                                </Box>

                                {level.actions.map((action, actionIdx) => (
                                  <Box
                                    key={actionIdx}
                                    sx={{
                                      p: 1.5,
                                      border: 1,
                                      borderColor: 'divider',
                                      borderRadius: 1,
                                      mb: 1,
                                    }}>
                                    <Box
                                      sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        mb: 1,
                                      }}>
                                      <Chip
                                        label={action.type}
                                        size="small"
                                        color="primary"
                                      />
                                      <IconButton
                                        size="small"
                                        onClick={() =>
                                          deleteSLAAction(levelIdx, actionIdx)
                                        }>
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </Box>

                                    <TextField
                                      label="Action Name"
                                      value={action.name || ''}
                                      onChange={e =>
                                        updateSLAAction(
                                          levelIdx,
                                          actionIdx,
                                          'name',
                                          e.target.value,
                                        )
                                      }
                                      size="small"
                                      fullWidth
                                      sx={{ mb: 1 }}
                                    />

                                    {action.type === 'service' && (
                                      <>
                                        <TextField
                                          label="URL"
                                          value={action.config.url || ''}
                                          onChange={e =>
                                            updateSLAAction(
                                              levelIdx,
                                              actionIdx,
                                              'config.url',
                                              e.target.value,
                                            )
                                          }
                                          size="small"
                                          fullWidth
                                          sx={{ mb: 1 }}
                                        />
                                        <FormControl
                                          fullWidth
                                          size="small"
                                          sx={{ mb: 1 }}>
                                          <InputLabel>Method</InputLabel>
                                          <Select
                                            value={
                                              action.config.method || 'POST'
                                            }
                                            onChange={e =>
                                              updateSLAAction(
                                                levelIdx,
                                                actionIdx,
                                                'config.method',
                                                e.target.value,
                                              )
                                            }
                                            label="Method">
                                            <MenuItem value="GET">GET</MenuItem>
                                            <MenuItem value="POST">
                                              POST
                                            </MenuItem>
                                            <MenuItem value="PUT">PUT</MenuItem>
                                            <MenuItem value="DELETE">
                                              DELETE
                                            </MenuItem>
                                          </Select>
                                        </FormControl>
                                        <TextField
                                          label="Request Body (JSON)"
                                          value={JSON.stringify(
                                            action.config.body || {},
                                            null,
                                            2,
                                          )}
                                          onChange={e => {
                                            try {
                                              const parsed = JSON.parse(
                                                e.target.value,
                                              );
                                              updateSLAAction(
                                                levelIdx,
                                                actionIdx,
                                                'config.body',
                                                parsed,
                                              );
                                            } catch (err) {
                                              // Invalid JSON, update raw value
                                              updateSLAAction(
                                                levelIdx,
                                                actionIdx,
                                                'config.body',
                                                e.target.value,
                                              );
                                            }
                                          }}
                                          size="small"
                                          fullWidth
                                          multiline
                                          rows={4}
                                          sx={{ mb: 1 }}
                                          placeholder='{"key": "value"}'
                                          helperText="Enter JSON format body"
                                        />
                                        <TextField
                                          label="Headers"
                                          value={action.config.headers || ''}
                                          onChange={e =>
                                            updateSLAAction(
                                              levelIdx,
                                              actionIdx,
                                              'config.headers',
                                              e.target.value,
                                            )
                                          }
                                          size="small"
                                          fullWidth
                                          sx={{ mb: 1 }}
                                          placeholder="Authorization ${context.variables.access_token}"
                                          helperText="Optional headers"
                                        />
                                      </>
                                    )}

                                    {action.type === 'escalate' && (
                                      <TextField
                                        label="Escalate to Roles (comma-separated)"
                                        value={
                                          action.config.roles?.join(', ') || ''
                                        }
                                        onChange={e =>
                                          updateSLAAction(
                                            levelIdx,
                                            actionIdx,
                                            'config.roles',
                                            e.target.value
                                              .split(',')
                                              .map(r => r.trim()),
                                          )
                                        }
                                        size="small"
                                        fullWidth
                                      />
                                    )}

                                    {action.type === 'mutation' && (
                                      <TextField
                                        label="Target Node"
                                        value={action.config.toNode || ''}
                                        onChange={e =>
                                          updateSLAAction(
                                            levelIdx,
                                            actionIdx,
                                            'config.toNode',
                                            e.target.value,
                                          )
                                        }
                                        size="small"
                                        fullWidth
                                      />
                                    )}
                                  </Box>
                                ))}
                              </Box>
                            </Box>
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </Box>
                  )}
                </>
              )}

              {configType === 'service' && (
                <>
                  <FormControl fullWidth>
                    <InputLabel>HTTP Method</InputLabel>
                    <Select
                      value={httpMethod}
                      onChange={e =>
                        setHttpMethod(
                          e.target.value as
                            | 'GET'
                            | 'POST'
                            | 'PUT'
                            | 'DELETE'
                            | 'PATCH',
                        )
                      }
                      label="HTTP Method">
                      <MenuItem value="GET">GET</MenuItem>
                      <MenuItem value="POST">POST</MenuItem>
                      <MenuItem value="PUT">PUT</MenuItem>
                      <MenuItem value="DELETE">DELETE</MenuItem>
                      <MenuItem value="PATCH">PATCH</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    label="URL"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    fullWidth
                    required
                  />

                  <TextField
                    label="Request Body (JSON)"
                    value={requestBody}
                    onChange={e => setRequestBody(e.target.value)}
                    fullWidth
                    multiline
                    rows={6}
                    placeholder='{"key": "value"}'
                  />
                </>
              )}
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!label || !nodeKey}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
