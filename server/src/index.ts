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
const pendingSubmissions = new Map<string, { data: any; schema: any }>();

app.use('/*', cors());

app.post('/api/submit', async c => {
  try {
    const contentType = c.req.header('content-type') || '';
    let data: any;
    let schema: any;

    if (contentType.includes('multipart/form-data')) {
      const formData = await c.req.formData();
      schema = JSON.parse(formData.get('schema') as string);
      data = JSON.parse(formData.get('data') as string);

      console.log('FormData entries:');
      for (const [key, value] of formData.entries()) {
        console.log(
          `  ${key}:`,
          value instanceof File ? `File(${value.name})` : typeof value,
        );
      }

      // Upload files to UploadThing
      for (const [key, value] of formData.entries()) {
        if (key !== 'data' && key !== 'schema' && value instanceof File) {
          const token = (env(c).UPLOADTHING_TOKEN as string) || '';
          try {
            const utapi = new UTApi({ token });
            const uploaded = await utapi.uploadFiles(value);
            console.log(`Upload result for ${key}:`, uploaded);
            if (uploaded.data) {
              data[key] = uploaded.data.url;
              console.log(`Set data[${key}] =`, uploaded.data.url);
            }
          } catch (err) {
            console.error(`Failed to upload ${key}:`, err);
            throw new Error(`File upload failed for ${key}`);
          }
        }
      }
      console.log('Final data after uploads:', data);
    } else {
      const body = await c.req.json();
      data = body.data;
      schema = body.schema;
    }

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
