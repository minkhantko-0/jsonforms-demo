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
  getFormMappingsHandler,
  getFormMappingByIdHandler,
  createFormMappingHandler,
  updateFormMappingHandler,
  deleteFormMappingHandler,
} from './routes/formMappings';

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

// Workflow upload route
app.post('/api/v1/workflows', createWorkflowHandler);

// Form Mapping routes
app.get('/api/form-mappings', getFormMappingsHandler);
app.get('/api/form-mappings/:id', getFormMappingByIdHandler);
app.post('/api/form-mappings', createFormMappingHandler);
app.put('/api/form-mappings/:id', updateFormMappingHandler);
app.delete('/api/form-mappings/:id', deleteFormMappingHandler);

serve({ fetch: app.fetch, port: 3001 });
console.log('Server running on http://localhost:3001');
