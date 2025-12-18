import { Context } from 'hono';
import { jsonSchemaToZod } from 'json-schema-to-zod';
import { z } from 'zod';
import { db } from '../db/index';
import { notifications } from '../db/schema';
import { broadcastNotification } from './notificationStream';

const createNotification = async (title: string, message: string) => {
  try {
    const result = await db.insert(notifications).values({ title, message });
    const newNotification = {
      id: result[0].insertId,
      title,
      message,
      isRead: false,
      createdAt: new Date(),
    };
    await broadcastNotification(newNotification);
  } catch (err) {
    console.error('Failed to create notification:', err);
  }
};

export const pendingSubmissions = new Map<
  string,
  { data: any; schema: any; formData?: FormData }
>();

export const submitHandler = async (c: Context) => {
  try {
    const contentType = c.req.header('content-type') || '';
    let data: any;
    let schema: any;
    let formData: FormData | null = null;

    if (contentType.includes('multipart/form-data')) {
      formData = await c.req.formData();
      schema = JSON.parse(formData.get('schema') as string);
      data = JSON.parse(formData.get('data') as string);
      
      // Add file field placeholders for validation
      for (const [key, value] of formData.entries()) {
        if (key !== 'data' && key !== 'schema' && value instanceof File) {
          data[key] = value.name;
        }
      }
    } else {
      const body = await c.req.json();
      data = body.data;
      schema = body.schema;
    }

    const zodSchemaString = jsonSchemaToZod(schema);
    const zodSchema = new Function('z', `return ${zodSchemaString}`)(z);
    zodSchema.parse(data);

    const sessionId = Date.now().toString();
    pendingSubmissions.set(sessionId, {
      data,
      schema,
      formData: formData || undefined,
    });

    await createNotification('Form Accepted', 'Form data validated and accepted for processing');
    return c.json({ success: true, sessionId });
  } catch (error: any) {
    await createNotification('Validation Error', error.message);
    return c.json({ success: false, error: error.message }, 400);
  }
};
