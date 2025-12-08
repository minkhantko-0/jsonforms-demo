import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { streamSSE } from 'hono/streaming';
import { jsonSchemaToZod } from 'json-schema-to-zod';
import { z } from 'zod';
import { db } from './db/index';
import { submissions } from './db/schema';

const app = new Hono();
const pendingSubmissions = new Map<string, { data: any; schema: any }>();

app.use('/*', cors());

app.post('/api/submit', async c => {
  const { data, schema } = await c.req.json();

  try {
    // Convert JSON Schema to Zod schema
    const zodSchemaString = jsonSchemaToZod(schema);
    const zodSchema = new Function('z', `return ${zodSchemaString}`)(z);

    // Validate data
    zodSchema.parse(data);

    // Store temporarily, will save to DB after SSE completes
    const sessionId = Date.now().toString();
    pendingSubmissions.set(sessionId, { data, schema });

    // Return success and session ID for SSE
    return c.json({ success: true, sessionId });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

app.get('/api/submissions', async c => {
  try {
    const allSubmissions = await db.select().from(submissions);
    return c.json({ success: true, data: allSubmissions });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

app.get('/api/events/:sessionId', c => {
  const sessionId = c.req.param('sessionId');

  return streamSSE(c, async stream => {
    // Wait 15 seconds then send event
    await new Promise(resolve => setTimeout(resolve, 15000));

    // Save to database after SSE completes
    const pending = pendingSubmissions.get(sessionId);
    if (pending) {
      await db.insert(submissions).values({
        data: pending.data,
        formSchema: pending.schema,
      });
      pendingSubmissions.delete(sessionId);
    }

    await stream.writeSSE({
      data: JSON.stringify({ message: 'Processing completed successfully!' }),
      event: 'complete',
    });
  });
});

serve({ fetch: app.fetch, port: 3001 });
console.log('Server running on http://localhost:3001');
