import 'dotenv/config';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { submitHandler } from './routes/submit';
import { getSubmissionsHandler } from './routes/submissions';
import { eventsHandler } from './routes/events';
import {
  getNotificationsHandler,
  createNotificationHandler,
  markAsReadHandler,
  deleteNotificationHandler,
  markAllAsReadHandler,
} from './routes/notifications';
import { notificationStreamHandler } from './routes/notificationStream';
import { getWorkflowsHandler, createWorkflowHandler } from './routes/workflows';
import { processCsvHandler } from './routes/processCsv';
import {
  getFormWorkflowMappingsHandler,
  getFormWorkflowMappingByIdHandler,
  createFormWorkflowMappingHandler,
  updateFormWorkflowMappingHandler,
  deleteFormWorkflowMappingHandler,
} from './routes/formWorkflowMappings';
import {
  getFormMappingsHandler,
  getFormMappingByIdHandler,
  createFormMappingHandler,
  updateFormMappingHandler,
  deleteFormMappingHandler,
} from './routes/formMappings';
import {
  getFormsHandler,
  getFormByIdHandler,
  createFormHandler,
  updateFormHandler,
  deleteFormHandler,
} from './routes/forms';

const app = new Hono();

app.use('/*', cors());

app.post('/api/submit', submitHandler);
app.get('/api/submissions', getSubmissionsHandler);
app.get('/api/events/:sessionId', eventsHandler);
app.get('/api/notifications', getNotificationsHandler);
app.post('/api/notifications', createNotificationHandler);
app.patch('/api/notifications/:id/read', markAsReadHandler);
app.patch('/api/notifications/read-all', markAllAsReadHandler);
app.delete('/api/notifications/:id', deleteNotificationHandler);
app.get('/api/notifications/stream', notificationStreamHandler);
app.get('/api/workflows', getWorkflowsHandler);
app.post('/api/process-csv', processCsvHandler);
app.get('/api/forms', getFormsHandler);
app.get('/api/forms/:id', getFormByIdHandler);
app.post('/api/forms', createFormHandler);
app.put('/api/forms/:id', updateFormHandler);
app.delete('/api/forms/:id', deleteFormHandler);

// Workflow upload route
app.post('/api/v1/workflows', createWorkflowHandler);

// New Form Workflow Mapping routes (for dynamic-workflow)
app.get('/api/form-mappings', getFormWorkflowMappingsHandler);
app.get('/api/form-mappings/:id', getFormWorkflowMappingByIdHandler);
app.post('/api/form-mappings', createFormWorkflowMappingHandler);
app.put('/api/form-mappings/:id', updateFormWorkflowMappingHandler);
app.delete('/api/form-mappings/:id', deleteFormWorkflowMappingHandler);

// Legacy Form Mapping routes (existing behavior kept)
app.get('/api/legacy/form-mappings', getFormMappingsHandler);
app.get('/api/legacy/form-mappings/:id', getFormMappingByIdHandler);
app.post('/api/legacy/form-mappings', createFormMappingHandler);
app.put('/api/legacy/form-mappings/:id', updateFormMappingHandler);
app.delete('/api/legacy/form-mappings/:id', deleteFormMappingHandler);

serve({ fetch: app.fetch, port: 3001 });
console.log('Server running on http://localhost:3001');
