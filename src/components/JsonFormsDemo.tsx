import { FC, useMemo, useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import CircularProgress from '@mui/material/CircularProgress';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { JsonForms } from '@jsonforms/react';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import {
  materialCells,
  materialRenderers,
} from '@jsonforms/material-renderers';
import { createAjv } from '@jsonforms/core';
import ajvErrors from 'ajv-errors';
import RatingControl from './RatingControl';
import ratingControlTester from '../testers/ratingControlTester';
import AgeSliderControl from './AgeSliderControl';
import ageSliderControlTester from '../testers/ageSliderControlTester';
import FileUploadControl from './FileUploadControl';
import fileUploadControlTester from '../testers/fileUploadControlTester';
import defaultSchema from '../data/schema.json';
import { CSSProperties } from '@mui/material';
import { useFormStore } from '../store/formStore';
import { Envs } from '../utils/envs';

const classes = {
  container: {
    padding: '1em',
    width: '100%',
  },
  dataContent: {
    borderRadius: '0.25em',
    backgroundColor: '#cecece',
    padding: '1rem',
    marginBottom: '1rem',
    overflow: 'auto',
    maxHeight: '500px',
  },
  preContent: {
    margin: 0,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
  },
  resetButton: {
    margin: 'auto !important',
    display: 'block !important',
  },
  demoform: {
    padding: '1rem',
  },
};

const initialData = {};

const ajv = createAjv({ allErrors: true });
ajvErrors(ajv);

export const JsonFormsDemo: FC = () => {
  const renderers = useMemo(
    () => [
      ...materialRenderers,
      { tester: ratingControlTester, renderer: RatingControl },
      { tester: ageSliderControlTester, renderer: AgeSliderControl },
      { tester: fileUploadControlTester, renderer: FileUploadControl },
    ],
    [],
  );
  const {
    data,
    schema,
    uiSchema,
    jsonInput,
    uiSchemaInput,
    setData,
    setSchema,
    setUiSchema,
    setJsonInput,
    setUiSchemaInput,
    clearData: clearStoreData,
  } = useFormStore();
  const [error, setError] = useState('');
  const [uiSchemaError, setUiSchemaError] = useState('');
  const [errors, setErrors] = useState<any[]>([]);
  const [submitErrors, setSubmitErrors] = useState<string[]>([]);
  const [isLoadingWorkflows, setIsLoadingWorkflows] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  // Fetch workflow options from API
  useEffect(() => {
    const fetchWorkflowOptions = async () => {
      setIsLoadingWorkflows(true);
      try {
        console.log('=== FETCHING WORKFLOWS FROM API ===');
        console.log('Current schema before API:', schema);

        const response = await fetch(`${Envs.API_URL}/api/workflows`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const workflows = await response.json();
        console.log('✅ API Response - Workflows fetched:', workflows);

        // Assuming API returns: [{ id: "workflow-1", name: "Standard Approval" }, ...]
        const enumValues = workflows.map((w: any) => w.id);
        const enumLabels = workflows.map((w: any) => w.name);

        console.log('📋 Extracted enum values:', enumValues);
        console.log('📋 Extracted enum labels:', enumLabels);

        // Update the schema with API data
        const updatedSchema = {
          ...schema,
          properties: {
            ...schema.properties,
            workflowId: {
              type: 'string',
              title: 'Workflow ID',
              enum: enumValues,
              enumNames: enumLabels,
            },
          },
        };

        console.log('🔄 Updated schema with API data:', updatedSchema);
        console.log(
          '🔍 workflowId property:',
          updatedSchema.properties.workflowId,
        );

        // Update schema for the form but DON'T update the editor
        setSchema(updatedSchema, false);

        // Verify after setting
        console.log('✅ Schema updated in store (editor unchanged)');
      } catch (error) {
        console.error('❌ Failed to fetch workflow options:', error);
        enqueueSnackbar('Failed to load workflow options. Using defaults.', {
          variant: 'warning',
        });
      } finally {
        setIsLoadingWorkflows(false);
      }
    };

    fetchWorkflowOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  const submitMutation = useMutation({
    mutationFn: async ({ data, schema }: { data: any; schema: any }) => {
      const hasFiles = Object.values(data).some(v => v instanceof File);

      let response;
      if (hasFiles) {
        const formData = new FormData();
        const cleanData: any = {};

        for (const [key, value] of Object.entries(data)) {
          if (value instanceof File) {
            formData.append(key, value);
          } else {
            cleanData[key] = value;
          }
        }

        formData.append('data', JSON.stringify(cleanData));
        formData.append('schema', JSON.stringify(schema));

        response = await fetch(`${Envs.API_URL}/api/submit`, {
          method: 'POST',
          body: formData,
        });
      } else {
        response = await fetch(`${Envs.API_URL}/api/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data, schema }),
        });
      }

      return response.json();
    },
    onSuccess: result => {
      if (result.success) {
        enqueueSnackbar('Form submitted successfully!', { variant: 'success' });
        clearStoreData();

        // Listen for SSE
        const eventSource = new EventSource(
          `${Envs.API_URL}/api/events/${result.sessionId}`,
        );

        eventSource.addEventListener('complete', event => {
          const data = JSON.parse(event.data);
          enqueueSnackbar(data.message, { variant: 'info' });
          queryClient.invalidateQueries({ queryKey: ['submissions'] });
          eventSource.close();
        });

        eventSource.onerror = () => {
          eventSource.close();
        };
      } else {
        enqueueSnackbar(`Error: ${result.error}`, { variant: 'error' });
      }
    },
    onError: (error: any) => {
      enqueueSnackbar(`Failed to submit: ${error.message}`, {
        variant: 'error',
      });
    },
  });
  const stringifiedData = useMemo(() => {
    return JSON.stringify(
      data,
      (key, value) => {
        if (value instanceof File) {
          return `[File: ${value.name}]`;
        }
        return value;
      },
      2,
    );
  }, [data]);

  const handleJsonChange = (value: string) => {
    setJsonInput(value);
    try {
      JSON.parse(value);
      setError('');
    } catch (e) {
      setError('Invalid JSON');
    }
  };

  const handleUiSchemaChange = (value: string) => {
    setUiSchemaInput(value);
    try {
      JSON.parse(value);
      setUiSchemaError('');
    } catch (e) {
      setUiSchemaError('Invalid JSON');
    }
  };

  const clearData = () => {
    clearStoreData();
  };

  const handleSubmit = () => {
    // Remove File objects for validation
    const dataForValidation = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => !(v instanceof File)),
    );

    const validate = ajv.compile(schema);
    const valid = validate(dataForValidation);

    if (!valid) {
      const errorMessages = (validate.errors || []).map(
        err => err.message || `${err.instancePath || 'Field'} ${err.keyword}`,
      );
      setSubmitErrors(errorMessages);
      return;
    }

    setSubmitErrors([]);
    submitMutation.mutate({ data, schema });
  };

  const formatAndSave = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(parsed, null, 2));
      setSchema(parsed);
      clearStoreData();
      setError('');
    } catch (e) {
      setError('Invalid JSON');
    }
  };

  const formatAndSaveUiSchema = () => {
    try {
      const parsed = JSON.parse(uiSchemaInput);
      setUiSchemaInput(JSON.stringify(parsed, null, 2));
      setUiSchema(parsed);
      setUiSchemaError('');
    } catch (e) {
      setUiSchemaError('Invalid JSON');
    }
  };

  return (
    <Grid container spacing={2} style={classes.container}>
      <Grid size={{ sm: 3 }}>
        <Typography variant={'h5'} mb={1}>
          JSON Schema
        </Typography>
        <TextField
          multiline
          fullWidth
          rows={20}
          value={jsonInput}
          onChange={e => handleJsonChange(e.target.value)}
          error={!!error}
          helperText={error}
          spellCheck={false}
          slotProps={{
            input: { style: { fontFamily: 'monospace', fontSize: '12px' } },
          }}
        />
        <Button
          style={classes.resetButton}
          onClick={formatAndSave}
          color="primary"
          variant="contained">
          Format & Save Schema
        </Button>

        <Typography variant={'h5'} mb={1} mt={3}>
          UI Schema (Rules)
        </Typography>
        <TextField
          multiline
          fullWidth
          rows={20}
          value={uiSchemaInput}
          onChange={e => handleUiSchemaChange(e.target.value)}
          error={!!uiSchemaError}
          helperText={uiSchemaError}
          spellCheck={false}
          slotProps={{
            input: { style: { fontFamily: 'monospace', fontSize: '12px' } },
          }}
        />
        <Button
          style={classes.resetButton}
          onClick={formatAndSaveUiSchema}
          color="primary"
          variant="contained">
          Format & Save UI Schema
        </Button>
      </Grid>
      <Grid size={{ sm: 5 }}>
        <Typography variant={'h5'}>Rendered Form</Typography>
        {isLoadingWorkflows && (
          <Alert severity="info" style={{ marginBottom: '1rem' }}>
            <CircularProgress size={16} style={{ marginRight: '8px' }} />
            Loading workflow options from API...
          </Alert>
        )}
        <div style={classes.demoform}>
          {console.log('🎨 Rendering JsonForms with schema:', schema)}
          {console.log(
            '🎨 workflowId in render:',
            schema?.properties?.workflowId,
          )}
          <JsonForms
            key={JSON.stringify(schema) + JSON.stringify(uiSchema)}
            schema={schema}
            uischema={uiSchema}
            data={data}
            renderers={renderers}
            cells={materialCells}
            ajv={ajv}
            onChange={({ data, errors }) => {
              setData(data);
              setErrors(errors || []);
              if (submitErrors.length > 0) {
                setSubmitErrors([]);
              }
            }}
          />
          {submitErrors.length > 0 && (
            <Alert severity="error" style={{ marginTop: '1rem' }}>
              <strong>Validation Errors:</strong>
              {submitErrors.map((err, i) => (
                <div key={i}>• {err}</div>
              ))}
            </Alert>
          )}
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={submitMutation.isPending}
            style={{ marginTop: '1rem' }}>
            {submitMutation.isPending ? (
              <CircularProgress size={24} />
            ) : (
              'Submit'
            )}
          </Button>
        </div>
      </Grid>
      <Grid size={{ sm: 4 }}>
        <Typography variant={'h5'}>Bound Data</Typography>
        <div style={classes.dataContent}>
          <pre id="boundData" style={classes.preContent as CSSProperties}>
            {stringifiedData}
          </pre>
        </div>
        <Button
          style={classes.resetButton}
          onClick={clearData}
          color="primary"
          variant="contained"
          data-testid="clear-data">
          Clear data
        </Button>
      </Grid>
    </Grid>
  );
};
