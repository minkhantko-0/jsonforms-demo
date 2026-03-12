/* eslint-disable @typescript-eslint/no-explicit-any */
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
    let workflowId: string | undefined;
    let refId: string | undefined;
    let createdBy: string | undefined;
    let formData: FormData | null = null;

    if (contentType.includes('multipart/form-data')) {
      formData = await c.req.formData();
      schema = JSON.parse(formData.get('schema') as string);
      data = JSON.parse(formData.get('data') as string);
      workflowId = formData.get('workflowId') as string | undefined;
      refId = formData.get('refId') as string | undefined;
      createdBy = formData.get('createdBy') as string | undefined;

      // Add file field placeholders for validation
      for (const [key, value] of formData.entries()) {
        if (
          key !== 'data' &&
          key !== 'schema' &&
          key !== 'workflowId' &&
          key !== 'refId' &&
          key !== 'createdBy' &&
          value instanceof File
        ) {
          data[key] = value.name;
        }
      }
    } else {
      const body = await c.req.json();
      data = body.data;
      schema = body.schema;
      workflowId = body.workflowId;
      refId = body.refId;
      createdBy = body.createdBy;
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

    await createNotification(
      'Form Accepted',
      'Form data validated and accepted for processing',
    );

    // If workflow info provided, start workflow
    if (workflowId && refId && createdBy) {
      try {
        const workflowResponse = await fetch(
          `${process.env.WORKFLOW_API_URL || 'http://localhost:3002'}/api/v1/workflows/start`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-user-id': createdBy,
            },
            body: JSON.stringify({
              workflowId,
              refId,
              context: data,
              createdBy,
            }),
          },
        );

        if (!workflowResponse.ok) {
          const bodyText = await workflowResponse.text();
          throw new Error(
            `Failed to start workflow: ${workflowResponse.status} ${workflowResponse.statusText}${bodyText ? ` - ${bodyText}` : ''}`,
          );
        }

        const workflowResult = await workflowResponse.json();
        await createNotification(
          'Workflow Started',
          `Workflow ${workflowId} started for ${refId}`,
        );

        return c.json({
          success: true,
          sessionId,
          workflowInstance: workflowResult,
        });
      } catch (workflowError: any) {
        console.error('Workflow start error:', workflowError);
        await createNotification('Workflow Error', workflowError.message);
        return c.json({
          success: true,
          sessionId,
          workflowError: workflowError.message,
        });
      }
    }

    await new Promise(resolve => setTimeout(resolve, 3000));
    return c.json({ success: true, sessionId });
  } catch (error: any) {
    await createNotification('Validation Error', error.message);
    return c.json({ success: false, error: error.message }, 400);
  }
};
