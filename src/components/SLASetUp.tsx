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
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Timer as TimerIcon,
  ExpandMore as ExpandMoreIcon,
  Notifications as NotificationIcon,
  TrendingUp as EscalateIcon,
  SwapHoriz as MutationIcon,
  Http as HttpIcon,
  CloudUpload as CloudUploadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { WorkflowStageBuilder } from './WorkflowStageBuilder';

interface SLAAction {
  name?: string;
  type: 'service' | 'escalate' | 'mutation';
  config: {
    type: string;
    method?: string;
    url?: string;
    body?: Record<string, unknown>;
    headers?: string;
    roles?: string[];
    toNode?: string;
  };
  condition?: {
    type: string;
    expression: string | null;
  };
}

interface SLAFact {
  level: number;
  targetDuration: string;
  condition: {
    type: string;
    expression: string;
  };
  actions: SLAAction[];
}

interface SLADefinition {
  name: string;
  key: string;
  variant: 'node' | 'workflow';
  facts: SLAFact[];
}

interface TimerAction {
  type: 'service' | 'mutation';
  config: {
    type: string;
    method?: string;
    url?: string;
    body?: Record<string, unknown>;
    headers?: string;
    toNode?: string;
  };
}

interface TimerDefinition {
  name: string;
  key: string;
  variant: 'node' | 'workflow';
  timerType: 'one-time' | 'recurring';
  config: {
    type: 'duration';
    value: string;
  };
  actions: TimerAction[];
  condition: {
    type: string;
    expression: string;
  };
}

const API_URL = 'http://localhost:3001/api';

export const SLASetUp = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [slaDefinitions, setSlaDefinitions] = useState<SLADefinition[]>([]);
  const [timerDefinitions, setTimerDefinitions] = useState<TimerDefinition[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const addSLA = () => {
    const newSLA: SLADefinition = {
      name: `Standard SLA for Batch Upload Approval ${slaDefinitions.length + 1}`,
      key: `SLA${String(slaDefinitions.length + 1).padStart(2, '0')}`,
      variant: 'node',
      facts: [],
    };
    setSlaDefinitions([...slaDefinitions, newSLA]);
  };

  const addSLAFact = (slaIdx: number) => {
    const copy = [...slaDefinitions];
    const newLevel = copy[slaIdx].facts.length + 1;
    copy[slaIdx].facts.push({
      level: newLevel,
      targetDuration: '30mins',
      condition: {
        type: 'jexl',
        expression: "${local.variables.status} == 'pending'",
      },
      actions: [],
    });
    setSlaDefinitions(copy);
  };

  const addSLAAction = (
    slaIdx: number,
    factIdx: number,
    actionType: 'service' | 'escalate' | 'mutation',
  ) => {
    const copy = [...slaDefinitions];

    if (actionType === 'service') {
      copy[slaIdx].facts[factIdx].actions.push({
        name: 'Send Reminder Notification',
        type: 'service',
        config: {
          type: 'http',
          method: 'POST',
          url: 'https://41l5r34h-3001.asse.devtunnels.ms/api/notifications',
          body: {
            title: 'Check your inbox!',
            message: 'Please check your inbox for tasks approval.',
          },
          headers: 'Authorization ${context.variables.access_token}',
        },
      });
    } else if (actionType === 'escalate') {
      copy[slaIdx].facts[factIdx].actions.push({
        type: 'escalate',
        config: {
          type: 'role',
          roles: ['senior_manager'],
        },
        condition: {
          type: 'jexl',
          expression: null,
        },
      });
    } else if (actionType === 'mutation') {
      copy[slaIdx].facts[factIdx].actions.push({
        type: 'mutation',
        config: {
          type: 'transition',
          toNode: 'finish',
        },
      });
    }

    setSlaDefinitions(copy);
  };

  const addTimer = () => {
    const newTimer: TimerDefinition = {
      name: `Auto finish workflow ${timerDefinitions.length + 1}`,
      key: `TIMER${String(timerDefinitions.length + 1).padStart(2, '0')}`,
      variant: 'workflow',
      timerType: 'one-time',
      config: {
        type: 'duration',
        value: '24hrs',
      },
      actions: [],
      condition: {
        type: 'jexl',
        expression: "${context.variables.status} === 'running'",
      },
    };
    setTimerDefinitions([...timerDefinitions, newTimer]);
  };

  const addTimerAction = (
    timerIdx: number,
    actionType: 'service' | 'mutation',
  ) => {
    const copy = [...timerDefinitions];

    if (actionType === 'service') {
      copy[timerIdx].actions.push({
        type: 'service',
        config: {
          type: 'http',
          method: 'POST',
          url: 'https://41l5r34h-3001.asse.devtunnels.ms/api/notifications',
          body: {
            title: 'Check your inbox!',
            message: 'Please check your inbox for tasks approval.',
          },
          headers: 'Authorization ${context.variables.access_token}',
        },
      });
    } else if (actionType === 'mutation') {
      copy[timerIdx].actions.push({
        type: 'mutation',
        config: {
          type: 'transition',
          toNode: 'end',
        },
      });
    }

    setTimerDefinitions(copy);
  };

  const uploadToApi = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/sla-timer-definitions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slaDefinitions, timerDefinitions }),
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: 'Successfully uploaded to API!',
          severity: 'success',
        });
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to upload to API',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadFromApi = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/sla-timer-definitions`);
      if (response.ok) {
        const data = await response.json();
        setSlaDefinitions(data.slaDefinitions || []);
        setTimerDefinitions(data.timerDefinitions || []);
        setSnackbar({
          open: true,
          message: 'Successfully loaded from API!',
          severity: 'success',
        });
      } else {
        throw new Error('Load failed');
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to load from API',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const exportJson = () => {
    return JSON.stringify(
      {
        slaDefinitions,
        timerDefinitions,
      },
      null,
      2,
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}>
        <Typography variant="h4">SLA & Timer Setup Builder</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={
              loading ? <CircularProgress size={20} /> : <RefreshIcon />
            }
            onClick={loadFromApi}
            disabled={loading}>
            Load from API
          </Button>
          <Button
            variant="contained"
            startIcon={
              loading ? <CircularProgress size={20} /> : <CloudUploadIcon />
            }
            onClick={uploadToApi}
            disabled={
              loading ||
              (slaDefinitions.length === 0 && timerDefinitions.length === 0)
            }>
            Upload to API
          </Button>
        </Box>
      </Box>

      <Tabs
        value={currentTab}
        onChange={(_, v) => setCurrentTab(v)}
        sx={{ mb: 3 }}>
        <Tab label="SLA Definitions" />
        <Tab label="Timer Definitions" />
        {/* <Tab label="Workflow Stages" /> */}
        <Tab label="JSON Output" />
      </Tabs>

      {currentTab === 0 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 3 }}>
          <Box>
            <Button variant="contained" onClick={addSLA} sx={{ mb: 3 }}>
              <AddIcon sx={{ mr: 1 }} /> Add SLA Definition
            </Button>

            {slaDefinitions.map((sla, slaIdx) => (
              <Card key={slaIdx} sx={{ mb: 3 }}>
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 2,
                    }}>
                    <Typography variant="h6">SLA Definition</Typography>
                    <IconButton
                      onClick={() =>
                        setSlaDefinitions(
                          slaDefinitions.filter((_, i) => i !== slaIdx),
                        )
                      }>
                      <DeleteIcon />
                    </IconButton>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <TextField
                      label="SLA Name"
                      value={sla.name}
                      onChange={e => {
                        const copy = [...slaDefinitions];
                        copy[slaIdx].name = e.target.value;
                        setSlaDefinitions(copy);
                      }}
                      fullWidth
                    />
                    <TextField
                      label="Key"
                      value={sla.key}
                      onChange={e => {
                        const copy = [...slaDefinitions];
                        copy[slaIdx].key = e.target.value;
                        setSlaDefinitions(copy);
                      }}
                      sx={{ width: 200 }}
                    />
                    <FormControl sx={{ minWidth: 150 }}>
                      <InputLabel>Variant</InputLabel>
                      <Select
                        value={sla.variant}
                        onChange={e => {
                          const copy = [...slaDefinitions];
                          copy[slaIdx].variant = e.target.value as
                            | 'node'
                            | 'workflow';
                          setSlaDefinitions(copy);
                        }}
                        label="Variant">
                        <MenuItem value="node">Node</MenuItem>
                        <MenuItem value="workflow">Workflow</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    sx={{ fontWeight: 600 }}>
                    SLA Levels (Facts)
                  </Typography>

                  {sla.facts.map((fact, factIdx) => (
                    <Accordion key={factIdx} sx={{ mb: 2 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            width: '100%',
                          }}>
                          <Chip
                            label={`Level ${fact.level}`}
                            color="primary"
                            size="small"
                          />
                          <Typography>Target: {fact.targetDuration}</Typography>
                          <Typography
                            color="text.secondary"
                            sx={{ ml: 'auto', mr: 2 }}>
                            {fact.actions.length} action(s)
                          </Typography>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                          <TextField
                            label="Level"
                            type="number"
                            value={fact.level}
                            onChange={e => {
                              const copy = [...slaDefinitions];
                              copy[slaIdx].facts[factIdx].level = parseInt(
                                e.target.value,
                              );
                              setSlaDefinitions(copy);
                            }}
                            sx={{ width: 100 }}
                          />
                          <TextField
                            label="Target Duration"
                            value={fact.targetDuration}
                            onChange={e => {
                              const copy = [...slaDefinitions];
                              copy[slaIdx].facts[factIdx].targetDuration =
                                e.target.value;
                              setSlaDefinitions(copy);
                            }}
                            placeholder="e.g. 30mins, 1h, 5h"
                            sx={{ width: 200 }}
                          />
                          <TextField
                            label="Condition Expression"
                            value={fact.condition.expression}
                            onChange={e => {
                              const copy = [...slaDefinitions];
                              copy[slaIdx].facts[factIdx].condition.expression =
                                e.target.value;
                              setSlaDefinitions(copy);
                            }}
                            fullWidth
                            placeholder="${local.variables.status} == 'pending'"
                          />
                          <IconButton
                            onClick={() => {
                              const copy = [...slaDefinitions];
                              copy[slaIdx].facts.splice(factIdx, 1);
                              setSlaDefinitions(copy);
                            }}>
                            <DeleteIcon />
                          </IconButton>
                        </Box>

                        <Typography
                          variant="subtitle2"
                          gutterBottom
                          sx={{ mt: 2, fontWeight: 600 }}>
                          Actions
                        </Typography>

                        {fact.actions.map((action, actionIdx) => (
                          <Card
                            key={actionIdx}
                            variant="outlined"
                            sx={{ mb: 2, p: 2 }}>
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                mb: 2,
                              }}>
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                }}>
                                {action.type === 'service' && <HttpIcon />}
                                {action.type === 'escalate' && <EscalateIcon />}
                                {action.type === 'mutation' && <MutationIcon />}
                                <Chip label={action.type} size="small" />
                              </Box>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  const copy = [...slaDefinitions];
                                  copy[slaIdx].facts[factIdx].actions.splice(
                                    actionIdx,
                                    1,
                                  );
                                  setSlaDefinitions(copy);
                                }}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>

                            {action.name && (
                              <TextField
                                label="Action Name"
                                value={action.name}
                                onChange={e => {
                                  const copy = [...slaDefinitions];
                                  copy[slaIdx].facts[factIdx].actions[
                                    actionIdx
                                  ].name = e.target.value;
                                  setSlaDefinitions(copy);
                                }}
                                fullWidth
                                sx={{ mb: 2 }}
                              />
                            )}

                            {action.type === 'service' && (
                              <>
                                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                  <FormControl sx={{ minWidth: 120 }}>
                                    <InputLabel>Method</InputLabel>
                                    <Select
                                      value={action.config.method || 'POST'}
                                      onChange={e => {
                                        const copy = [...slaDefinitions];
                                        copy[slaIdx].facts[factIdx].actions[
                                          actionIdx
                                        ].config.method = e.target.value;
                                        setSlaDefinitions(copy);
                                      }}
                                      label="Method">
                                      <MenuItem value="GET">GET</MenuItem>
                                      <MenuItem value="POST">POST</MenuItem>
                                      <MenuItem value="PUT">PUT</MenuItem>
                                      <MenuItem value="DELETE">DELETE</MenuItem>
                                    </Select>
                                  </FormControl>
                                  <TextField
                                    label="URL"
                                    value={action.config.url || ''}
                                    onChange={e => {
                                      const copy = [...slaDefinitions];
                                      copy[slaIdx].facts[factIdx].actions[
                                        actionIdx
                                      ].config.url = e.target.value;
                                      setSlaDefinitions(copy);
                                    }}
                                    fullWidth
                                  />
                                </Box>
                                <TextField
                                  label="Headers"
                                  value={action.config.headers || ''}
                                  onChange={e => {
                                    const copy = [...slaDefinitions];
                                    copy[slaIdx].facts[factIdx].actions[
                                      actionIdx
                                    ].config.headers = e.target.value;
                                    setSlaDefinitions(copy);
                                  }}
                                  fullWidth
                                  sx={{ mb: 2 }}
                                  placeholder="Authorization ${context.variables.access_token}"
                                />
                                <TextField
                                  label="Body (JSON)"
                                  value={JSON.stringify(
                                    action.config.body || {},
                                    null,
                                    2,
                                  )}
                                  onChange={e => {
                                    try {
                                      const copy = [...slaDefinitions];
                                      copy[slaIdx].facts[factIdx].actions[
                                        actionIdx
                                      ].config.body = JSON.parse(
                                        e.target.value,
                                      );
                                      setSlaDefinitions(copy);
                                    } catch (err) {
                                      // Invalid JSON, ignore
                                    }
                                  }}
                                  multiline
                                  rows={4}
                                  fullWidth
                                />
                              </>
                            )}

                            {action.type === 'escalate' && (
                              <TextField
                                label="Roles (comma-separated)"
                                value={action.config.roles?.join(', ') || ''}
                                onChange={e => {
                                  const copy = [...slaDefinitions];
                                  copy[slaIdx].facts[factIdx].actions[
                                    actionIdx
                                  ].config.roles = e.target.value
                                    .split(',')
                                    .map(r => r.trim())
                                    .filter(Boolean);
                                  setSlaDefinitions(copy);
                                }}
                                fullWidth
                                placeholder="senior_manager, admin"
                              />
                            )}

                            {action.type === 'mutation' && (
                              <TextField
                                label="Target Node"
                                value={action.config.toNode || ''}
                                onChange={e => {
                                  const copy = [...slaDefinitions];
                                  copy[slaIdx].facts[factIdx].actions[
                                    actionIdx
                                  ].config.toNode = e.target.value;
                                  setSlaDefinitions(copy);
                                }}
                                fullWidth
                                placeholder="finish, end, reject"
                              />
                            )}
                          </Card>
                        ))}

                        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<NotificationIcon />}
                            onClick={() =>
                              addSLAAction(slaIdx, factIdx, 'service')
                            }>
                            Add Service
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<EscalateIcon />}
                            onClick={() =>
                              addSLAAction(slaIdx, factIdx, 'escalate')
                            }>
                            Add Escalate
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<MutationIcon />}
                            onClick={() =>
                              addSLAAction(slaIdx, factIdx, 'mutation')
                            }>
                            Add Mutation
                          </Button>
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  ))}

                  <Button
                    variant="outlined"
                    onClick={() => addSLAFact(slaIdx)}
                    sx={{ mt: 2 }}>
                    <AddIcon sx={{ mr: 1 }} /> Add SLA Level
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}

      {currentTab === 1 && (
        <Box>
          <Button variant="contained" onClick={addTimer} sx={{ mb: 3 }}>
            <TimerIcon sx={{ mr: 1 }} /> Add Timer Definition
          </Button>

          {timerDefinitions.map((timer, timerIdx) => (
            <Card key={timerIdx} sx={{ mb: 3 }}>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                  }}>
                  <Typography variant="h6">Timer Definition</Typography>
                  <IconButton
                    onClick={() =>
                      setTimerDefinitions(
                        timerDefinitions.filter((_, i) => i !== timerIdx),
                      )
                    }>
                    <DeleteIcon />
                  </IconButton>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <TextField
                    label="Timer Name"
                    value={timer.name}
                    onChange={e => {
                      const copy = [...timerDefinitions];
                      copy[timerIdx].name = e.target.value;
                      setTimerDefinitions(copy);
                    }}
                    fullWidth
                  />
                  <TextField
                    label="Key"
                    value={timer.key}
                    onChange={e => {
                      const copy = [...timerDefinitions];
                      copy[timerIdx].key = e.target.value;
                      setTimerDefinitions(copy);
                    }}
                    sx={{ width: 200 }}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel>Variant</InputLabel>
                    <Select
                      value={timer.variant}
                      onChange={e => {
                        const copy = [...timerDefinitions];
                        copy[timerIdx].variant = e.target.value as
                          | 'node'
                          | 'workflow';
                        setTimerDefinitions(copy);
                      }}
                      label="Variant">
                      <MenuItem value="node">Node</MenuItem>
                      <MenuItem value="workflow">Workflow</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel>Timer Type</InputLabel>
                    <Select
                      value={timer.timerType}
                      onChange={e => {
                        const copy = [...timerDefinitions];
                        copy[timerIdx].timerType = e.target.value as
                          | 'one-time'
                          | 'recurring';
                        setTimerDefinitions(copy);
                      }}
                      label="Timer Type">
                      <MenuItem value="one-time">One-time</MenuItem>
                      <MenuItem value="recurring">Recurring</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    label="Duration"
                    value={timer.config.value}
                    onChange={e => {
                      const copy = [...timerDefinitions];
                      copy[timerIdx].config.value = e.target.value;
                      setTimerDefinitions(copy);
                    }}
                    placeholder="e.g. 24hrs, 30mins"
                    sx={{ width: 200 }}
                  />
                </Box>

                <TextField
                  label="Condition Expression"
                  value={timer.condition.expression}
                  onChange={e => {
                    const copy = [...timerDefinitions];
                    copy[timerIdx].condition.expression = e.target.value;
                    setTimerDefinitions(copy);
                  }}
                  fullWidth
                  sx={{ mb: 3 }}
                  placeholder="${context.variables.status} === 'running'"
                />

                <Divider sx={{ my: 2 }} />

                <Typography
                  variant="subtitle1"
                  gutterBottom
                  sx={{ fontWeight: 600 }}>
                  Actions
                </Typography>

                {timer.actions.map((action, actionIdx) => (
                  <Card key={actionIdx} variant="outlined" sx={{ mb: 2, p: 2 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2,
                      }}>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {action.type === 'service' && <HttpIcon />}
                        {action.type === 'mutation' && <MutationIcon />}
                        <Chip label={action.type} size="small" />
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => {
                          const copy = [...timerDefinitions];
                          copy[timerIdx].actions.splice(actionIdx, 1);
                          setTimerDefinitions(copy);
                        }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    {action.type === 'service' && (
                      <>
                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                          <FormControl sx={{ minWidth: 120 }}>
                            <InputLabel>Method</InputLabel>
                            <Select
                              value={action.config.method || 'POST'}
                              onChange={e => {
                                const copy = [...timerDefinitions];
                                copy[timerIdx].actions[
                                  actionIdx
                                ].config.method = e.target.value;
                                setTimerDefinitions(copy);
                              }}
                              label="Method">
                              <MenuItem value="GET">GET</MenuItem>
                              <MenuItem value="POST">POST</MenuItem>
                              <MenuItem value="PUT">PUT</MenuItem>
                              <MenuItem value="DELETE">DELETE</MenuItem>
                            </Select>
                          </FormControl>
                          <TextField
                            label="URL"
                            value={action.config.url || ''}
                            onChange={e => {
                              const copy = [...timerDefinitions];
                              copy[timerIdx].actions[actionIdx].config.url =
                                e.target.value;
                              setTimerDefinitions(copy);
                            }}
                            fullWidth
                          />
                        </Box>
                        <TextField
                          label="Headers"
                          value={action.config.headers || ''}
                          onChange={e => {
                            const copy = [...timerDefinitions];
                            copy[timerIdx].actions[actionIdx].config.headers =
                              e.target.value;
                            setTimerDefinitions(copy);
                          }}
                          fullWidth
                          sx={{ mb: 2 }}
                          placeholder="Authorization ${context.variables.access_token}"
                        />
                        <TextField
                          label="Body (JSON)"
                          value={JSON.stringify(
                            action.config.body || {},
                            null,
                            2,
                          )}
                          onChange={e => {
                            try {
                              const copy = [...timerDefinitions];
                              copy[timerIdx].actions[actionIdx].config.body =
                                JSON.parse(e.target.value);
                              setTimerDefinitions(copy);
                            } catch (err) {
                              // Invalid JSON, ignore
                            }
                          }}
                          multiline
                          rows={4}
                          fullWidth
                        />
                      </>
                    )}

                    {action.type === 'mutation' && (
                      <TextField
                        label="Target Node"
                        value={action.config.toNode || ''}
                        onChange={e => {
                          const copy = [...timerDefinitions];
                          copy[timerIdx].actions[actionIdx].config.toNode =
                            e.target.value;
                          setTimerDefinitions(copy);
                        }}
                        fullWidth
                        placeholder="end, finish, reject"
                      />
                    )}
                  </Card>
                ))}

                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<NotificationIcon />}
                    onClick={() => addTimerAction(timerIdx, 'service')}>
                    Add Service Action
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<MutationIcon />}
                    onClick={() => addTimerAction(timerIdx, 'mutation')}>
                    Add Mutation Action
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {currentTab === 2 && (
        <Box>
          <WorkflowStageBuilder />
        </Box>
      )}

      {currentTab === 3 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Generated JSON Output
          </Typography>
          <pre
            style={{
              fontSize: 12,
              backgroundColor: '#f5f5f5',
              padding: 16,
              borderRadius: 4,
              overflow: 'auto',
              maxHeight: 600,
            }}>
            {exportJson()}
          </pre>
          <Button
            variant="contained"
            onClick={() => {
              const blob = new Blob([exportJson()], {
                type: 'application/json',
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'sla-timer-definitions.json';
              a.click();
            }}
            sx={{ mt: 2 }}>
            Download JSON
          </Button>
        </Paper>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
