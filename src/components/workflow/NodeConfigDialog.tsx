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
} from '@mui/material';
import {
  NodeConfig,
  ServicePayload,
  ParallelBranch,
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
  const [selectedSLAs, setSelectedSLAs] = useState<string[]>([]);
  const [selectedTimers, setSelectedTimers] = useState<string[]>([]);
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
          setSelectedSLAs(initialData.config.slas || []);
          setSelectedTimers(initialData.config.timers || []);
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
      setSelectedSLAs([]);
      setSelectedTimers([]);
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

  const handleSLAChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setSelectedSLAs(typeof value === 'string' ? value.split(',') : value);
  };

  const handleTimerChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setSelectedTimers(typeof value === 'string' ? value.split(',') : value);
  };

  const handleSave = () => {
    let config: NodeConfig | undefined;

    if (configType === 'assignment') {
      config = {
        type: 'assignment',
        roles: selectedRoles,
        groups: selectedGroups,
        slas: selectedSLAs,
        timers: selectedTimers,
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

                  <FormControl fullWidth>
                    <InputLabel>SLAs</InputLabel>
                    <Select
                      multiple
                      value={selectedSLAs}
                      onChange={handleSLAChange}
                      input={<OutlinedInput label="SLAs" />}
                      renderValue={selected => (
                        <Box
                          sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map(value => (
                            <Chip
                              key={value}
                              label={value}
                              size="small"
                              color="primary"
                            />
                          ))}
                        </Box>
                      )}>
                      {availableSLAs.map(sla => (
                        <MenuItem key={sla} value={sla}>
                          {sla}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Timers</InputLabel>
                    <Select
                      multiple
                      value={selectedTimers}
                      onChange={handleTimerChange}
                      input={<OutlinedInput label="Timers" />}
                      renderValue={selected => (
                        <Box
                          sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map(value => (
                            <Chip
                              key={value}
                              label={value}
                              size="small"
                              color="secondary"
                            />
                          ))}
                        </Box>
                      )}>
                      {availableTimers.map(timer => (
                        <MenuItem key={timer} value={timer}>
                          {timer}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
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
