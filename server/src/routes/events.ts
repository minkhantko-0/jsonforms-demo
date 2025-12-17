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

export const eventsHandler = (c: Context) => {
  const sessionId = c.req.param('sessionId');

  return streamSSE(c, async (stream) => {
    const pending = pendingSubmissions.get(sessionId);
    if (!pending) {
      const errorMsg = 'Session not found';
      await createNotification('Error', errorMsg);
      await stream.writeSSE({
        data: JSON.stringify({ message: errorMsg }),
        event: 'error',
      });
      return;
    }

    let data = pending.data;
    const uploadedUrls: string[] = [];

    if (pending.formData) {
      for (const [key, value] of pending.formData.entries()) {
        if (key !== 'data' && key !== 'schema' && value instanceof File) {
          const url = await uploadFile(value);
          if (!url) {
            const errorMsg = 'File upload failed';
            await createNotification('Upload Error', errorMsg);
            await stream.writeSSE({
              data: JSON.stringify({ message: errorMsg }),
              event: 'error',
            });
            pendingSubmissions.delete(sessionId);
            return;
          }
          data[key] = url;
          uploadedUrls.push(url);
        }
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 7000));

    try {
      const result = await db.insert(submissions).values({
        data,
        formSchema: pending.schema,
      });
      
      await createNotification('Processing Success', `Form processed and saved successfully with ID: ${result[0].insertId}`);
    } catch (err) {
      const errorMsg = 'Database insert failed';
      await createNotification('Processing Failed', errorMsg);
      await stream.writeSSE({
        data: JSON.stringify({ message: errorMsg }),
        event: 'error',
      });
      pendingSubmissions.delete(sessionId);
      
      // Delete uploaded files in background
      Promise.all(uploadedUrls.map(url => deleteFile(url)));
      return;
    }

    pendingSubmissions.delete(sessionId);
    const successMsg = 'Processing completed successfully!';
    await stream.writeSSE({
      data: JSON.stringify({ message: successMsg }),
      event: 'complete',
    });
  });
};
