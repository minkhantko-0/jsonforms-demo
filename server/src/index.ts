import 'dotenv/config';
import { Hono } from 'hono';
import { env } from 'hono/adapter';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { streamSSE } from 'hono/streaming';
import { jsonSchemaToZod } from 'json-schema-to-zod';
import { z } from 'zod';
import { db } from './db/index';
import { submissions } from './db/schema';
import { UTApi } from 'uploadthing/server';

const app = new Hono();
const pendingSubmissions = new Map<
  string,
  { data: any; schema: any; formData?: FormData }
>();

app.use('/*', cors());

app.post('/api/submit', async c => {
  try {
    const contentType = c.req.header('content-type') || '';
    let data: any;
    let schema: any;
    let formData: FormData | null = null;

    if (contentType.includes('multipart/form-data')) {
      formData = await c.req.formData();
      schema = JSON.parse(formData.get('schema') as string);
      data = JSON.parse(formData.get('data') as string);
    } else {
      const body = await c.req.json();
      data = body.data;
      schema = body.schema;
    }

    // Validate data
    const zodSchemaString = jsonSchemaToZod(schema);
    const zodSchema = new Function('z', `return ${zodSchemaString}`)(z);
    zodSchema.parse(data);

    // Store for async processing
    const sessionId = Date.now().toString();
    pendingSubmissions.set(sessionId, {
      data,
      schema,
      formData: formData || undefined,
    });

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
    const pending = pendingSubmissions.get(sessionId);
    if (!pending) {
      await stream.writeSSE({
        data: JSON.stringify({ message: 'Session not found' }),
        event: 'error',
      });
      return;
    }

    let data = pending.data;

    // Upload files if present
    if (pending.formData) {
      for (const [key, value] of pending.formData.entries()) {
        if (key !== 'data' && key !== 'schema' && value instanceof File) {
          try {
            const token = process.env.UPLOADTHING_TOKEN || '';
            const utapi = new UTApi({ token });
            const uploaded = await utapi.uploadFiles(value);
            if (!uploaded.data) {
              await stream.writeSSE({
                data: JSON.stringify({ message: 'File upload failed' }),
                event: 'error',
              });
              pendingSubmissions.delete(sessionId);
              return;
            }
            data[key] = uploaded.data.url;
          } catch (err) {
            await stream.writeSSE({
              data: JSON.stringify({ message: 'File upload failed' }),
              event: 'error',
            });
            pendingSubmissions.delete(sessionId);
            return;
          }
        }
      }
    }

    // Insert to database
    try {
      await db.insert(submissions).values({
        data,
        formSchema: pending.schema,
      });
    } catch (err) {
      await stream.writeSSE({
        data: JSON.stringify({ message: 'Database insert failed' }),
        event: 'error',
      });
      pendingSubmissions.delete(sessionId);
      return;
    }

    // Wait 10 seconds
    await new Promise(resolve => setTimeout(resolve, 10000));

    await stream.writeSSE({
      data: JSON.stringify({ message: 'Processing completed successfully!' }),
      event: 'complete',
    });
    pendingSubmissions.delete(sessionId);
  });
});

serve({ fetch: app.fetch, port: 3001 });
console.log('Server running on http://localhost:3001');
