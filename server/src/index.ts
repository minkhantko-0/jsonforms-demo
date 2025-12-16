import 'dotenv/config';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { submitHandler } from './routes/submit';
import { getSubmissionsHandler } from './routes/submissions';
import { eventsHandler } from './routes/events';
import { getWorkflowsHandler } from './routes/workflows';

const app = new Hono();

app.use('/*', cors());

app.post('/api/submit', submitHandler);
app.get('/api/submissions', getSubmissionsHandler);
app.get('/api/events/:sessionId', eventsHandler);
app.get('/api/workflows', getWorkflowsHandler);

serve({ fetch: app.fetch, port: 3001 });
console.log('Server running on http://localhost:3001');
