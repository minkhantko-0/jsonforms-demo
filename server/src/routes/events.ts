import { Context } from 'hono';
import { streamSSE } from 'hono/streaming';
import { db } from '../db/index';
import { submissions, notifications } from '../db/schema';
import { uploadFile, deleteFile } from '../services/fileUpload';
import { pendingSubmissions } from './submit';
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

export const eventsHandler = async (c: Context) => {
  const sessionId = c.req.param('sessionId');

  const pending = pendingSubmissions.get(sessionId);
  if (!pending) {
    await createNotification('Error', 'Session not found');
    return c.json({ success: false, error: 'Session not found' }, 404);
  }

  // Process in background
  (async () => {
    let data = pending.data;
    const uploadedUrls: string[] = [];

    if (pending.formData) {
      for (const [key, value] of pending.formData.entries()) {
        if (key !== 'data' && key !== 'schema' && value instanceof File) {
          const url = await uploadFile(value);
          if (!url) {
            await createNotification('Upload Error', 'File upload failed');
            pendingSubmissions.delete(sessionId);
            return;
          }
          data[key] = url;
          uploadedUrls.push(url);
        }
      }
    }

    await new Promise(resolve => setTimeout(resolve, 7000));

    let submissionId: number;
    try {
      const result = await db.insert(submissions).values({
        data,
        formSchema: pending.schema,
      });
      submissionId = result[0].insertId;

      await createNotification(
        'Processing Success',
        `Form processed and saved successfully with ID: ${submissionId}`,
      );

      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (err) {
      await createNotification('Processing Failed', 'Database insert failed');
      pendingSubmissions.delete(sessionId);
      Promise.all(uploadedUrls.map(url => deleteFile(url)));
      return;
    }

    // Start workflow if workflowId exists
    if (data.workflowId) {
      try {
        const workflowApi = process.env.WORKFLOW_API || '';
        const fileName = uploadedUrls[0]?.split('/').pop() || 'unknown.csv';

        await fetch(`http://localhost:3000/api/v1/workflows/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workflowId: data.workflowId,
            refId: submissionId.toString(),
            context: {
              fileName,
              path: uploadedUrls[0] || '',
            },
          }),
        });

        await new Promise(resolve => setTimeout(resolve, 3000));

        await createNotification(
          'Workflow Initiated',
          `Workflow process initiated for submission ${submissionId}`,
        );
      } catch (err) {
        console.error('Workflow start failed:', err);
      }
    }

    pendingSubmissions.delete(sessionId);
  })();

  return c.json({ success: true, message: 'Processing started' });
};
