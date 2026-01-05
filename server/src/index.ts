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
  getSlaTimerDefinitionsHandler,
  createSlaTimerDefinitionsHandler,
  getAllSlaTimerDefinitionsHandler,
  getSlaTimerDefinitionByIdHandler,
} from './routes/slaTimerDefinitions';
import {
  createSlaDefinitionsHandler,
  getSlaDefinitionsHandler,
} from './routes/slas';
import {
  createTimerDefinitionsHandler,
  getTimerDefinitionsHandler,
} from './routes/timers';
import {
  getWorkflowDefinitionsHandler,
  getWorkflowDefinitionByIdHandler,
  createWorkflowDefinitionHandler,
  updateWorkflowDefinitionHandler,
  deleteWorkflowDefinitionHandler,
} from './routes/workflowDefinitions';

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

// SLA/Timer Definition routes
app.get('/api/sla-timer-definitions', getSlaTimerDefinitionsHandler);
app.get('/api/sla-timer-definitions/all', getAllSlaTimerDefinitionsHandler);
app.get('/api/sla-timer-definitions/:id', getSlaTimerDefinitionByIdHandler);
app.post('/api/sla-timer-definitions', createSlaTimerDefinitionsHandler);

// Separate SLA and Timer routes
app.get('/api/v1/slas', getSlaDefinitionsHandler);
app.post('/api/v1/slas', createSlaDefinitionsHandler);
app.get('/api/v1/timers', getTimerDefinitionsHandler);
app.post('/api/v1/timers', createTimerDefinitionsHandler);

// Workflow upload route
app.post('/api/v1/workflows', createWorkflowHandler);

// Workflow Definition routes
app.get('/api/workflow-definitions', getWorkflowDefinitionsHandler);
app.get('/api/workflow-definitions/:id', getWorkflowDefinitionByIdHandler);
app.post('/api/workflow-definitions', createWorkflowDefinitionHandler);
app.put('/api/workflow-definitions/:id', updateWorkflowDefinitionHandler);
app.delete('/api/workflow-definitions/:id', deleteWorkflowDefinitionHandler);

serve({ fetch: app.fetch, port: 3001 });
console.log('Server running on http://localhost:3001');
