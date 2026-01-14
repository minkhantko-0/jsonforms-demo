/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Envs } from '../utils/envs';
import {
  Box,
  Button,
  TextField,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
} from '@mui/material';
import { Edit, Delete, Upload, FileJson } from 'lucide-react';
import { Add } from '@mui/icons-material';

interface FormMapping {
  id: number;
  name: string;
  formSchema: any;
  uiSchema?: any;
  workflowId: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface Workflow {
  key: string;
  name: string;
  description?: string;
}

export const FormMapping = () => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentMapping, setCurrentMapping] = useState<FormMapping | null>(
    null,
  );
  const [formData, setFormData] = useState({
    name: '',
    formSchema: '',
    uiSchema: '',
    workflowId: '',
    description: '',
  });
  const [error, setError] = useState<string>('');

  // Fetch form mappings
  const { data: mappings = [], isLoading: loadingMappings } = useQuery({
    queryKey: ['formMappings'],
    queryFn: async () => {
      const response = await fetch(`${Envs.API_URL}/api/form-mappings`);
      const result = await response.json();
      return result.success ? result.data : [];
    },
  });

  // Fetch workflows
  const { data: workflows = [], isLoading: loadingWorkflows } = useQuery({
    queryKey: ['workflows'],
    queryFn: async () => {
      const response = await fetch(`${Envs.WORKFLOW_URL}/api/v1/workflows`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const res = await response.json();
      return res.data || [];
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`${Envs.API_URL}/api/form-mappings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create form mapping');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formMappings'] });
      handleClose();
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`${Envs.API_URL}/api/form-mappings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update form mapping');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formMappings'] });
      handleClose();
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`${Envs.API_URL}/api/form-mappings/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete form mapping');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formMappings'] });
    },
  });

  const handleOpen = (mapping?: FormMapping) => {
    if (mapping) {
      setEditMode(true);
      setCurrentMapping(mapping);
      setFormData({
        name: mapping.name,
        formSchema: JSON.stringify(mapping.formSchema, null, 2),
        uiSchema: mapping.uiSchema
          ? JSON.stringify(mapping.uiSchema, null, 2)
          : '',
        workflowId: mapping.workflowId,
        description: mapping.description || '',
      });
    } else {
      setEditMode(false);
      setCurrentMapping(null);
      setFormData({
        name: '',
        formSchema: '',
        uiSchema: '',
        workflowId: '',
        description: '',
      });
    }
    setError('');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditMode(false);
    setCurrentMapping(null);
    setFormData({
      name: '',
      formSchema: '',
      uiSchema: '',
      workflowId: '',
      description: '',
    });
    setError('');
  };

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    field: 'formSchema' | 'uiSchema',
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content);
          setFormData(prev => ({
            ...prev,
            [field]: JSON.stringify(parsed, null, 2),
          }));
          setError('');
        } catch (err) {
          setError('Invalid JSON file');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = () => {
    try {
      // Validate JSON
      const formSchema = JSON.parse(formData.formSchema);
      const uiSchema = JSON.parse(formData.uiSchema);

      if (!formData.name || !formData.workflowId) {
        setError('Name and Workflow are required');
        return;
      }

      const submitData = {
        name: formData.name,
        formSchema,
        uiSchema,
        workflowId: formData.workflowId,
        description: formData.description || null,
      };

      if (editMode && currentMapping) {
        updateMutation.mutate({ id: currentMapping.id, data: submitData });
      } else {
        createMutation.mutate(submitData);
      }
    } catch (err) {
      setError('Invalid JSON format');
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this form mapping?')) {
      deleteMutation.mutate(id);
    }
  };

  if (loadingMappings || loadingWorkflows) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}>
        <Box></Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpen()}>
          Create New Config
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Workflow</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mappings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="textSecondary">
                    No form configs found. Create one to get started.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              mappings.map((mapping: FormMapping) => {
                const workflow = workflows.find(
                  (w: Workflow) => w.key === mapping.workflowId,
                );
                return (
                  <TableRow key={mapping.id}>
                    <TableCell>{mapping.id}</TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FileJson size={16} />
                        {mapping.name}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={workflow?.name || mapping.workflowId}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{mapping.description || '-'}</TableCell>
                    <TableCell>
                      {new Date(mapping.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleOpen(mapping)}
                        color="primary">
                        <Edit size={18} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(mapping.id)}
                        color="error">
                        <Delete size={18} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editMode ? 'Edit Form Config' : 'Create Form Config'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            label="Name"
            fullWidth
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
            required
          />

          <TextField
            label="Description"
            fullWidth
            value={formData.description}
            onChange={e =>
              setFormData({ ...formData, description: e.target.value })
            }
            sx={{ mb: 2 }}
            multiline
            rows={2}
          />

          <FormControl fullWidth sx={{ mb: 2 }} required>
            <InputLabel>Workflow</InputLabel>
            <Select
              value={formData.workflowId}
              label="Workflow"
              onChange={e =>
                setFormData({ ...formData, workflowId: e.target.value })
              }>
              {workflows.map((workflow: Workflow) => (
                <MenuItem key={workflow.key} value={workflow.key}>
                  {workflow.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Form Schema (JSON) *
            </Typography>
            <Button
              variant="outlined"
              component="label"
              startIcon={<Upload />}
              size="small"
              sx={{ mb: 1 }}>
              Upload Form Schema
              <input
                type="file"
                hidden
                accept=".json"
                onChange={e => handleFileUpload(e, 'formSchema')}
              />
            </Button>
            <TextField
              fullWidth
              multiline
              rows={8}
              value={formData.formSchema}
              onChange={e =>
                setFormData({ ...formData, formSchema: e.target.value })
              }
              placeholder='{"type": "object", "properties": {...}}'
              variant="outlined"
              required
            />
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              UI Schema (JSON) *
            </Typography>
            <Button
              variant="outlined"
              component="label"
              startIcon={<Upload />}
              size="small"
              sx={{ mb: 1 }}>
              Upload UI Schema
              <input
                type="file"
                hidden
                accept=".json"
                onChange={e => handleFileUpload(e, 'uiSchema')}
              />
            </Button>
            <TextField
              fullWidth
              multiline
              rows={6}
              value={formData.uiSchema}
              onChange={e =>
                setFormData({ ...formData, uiSchema: e.target.value })
              }
              placeholder='{"type": "VerticalLayout", "elements": [...]}'
              variant="outlined"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={createMutation.isPending || updateMutation.isPending}>
            {editMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
