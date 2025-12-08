import { Context } from 'hono';
import { streamSSE } from 'hono/streaming';
import { db } from '../db/index';
import { submissions } from '../db/schema';
import { uploadFile, deleteFile } from '../services/fileUpload';
import { pendingSubmissions } from './submit';

export const eventsHandler = (c: Context) => {
  const sessionId = c.req.param('sessionId');

  return streamSSE(c, async (stream) => {
    const pending = pendingSubmissions.get(sessionId);
    if (!pending) {
      await stream.writeSSE({
        data: JSON.stringify({ message: 'Session not found' }),
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
            await stream.writeSSE({
              data: JSON.stringify({ message: 'File upload failed' }),
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
      
      // Delete uploaded files in background
      Promise.all(uploadedUrls.map(url => deleteFile(url)));
      return;
    }

    pendingSubmissions.delete(sessionId);
    await stream.writeSSE({
      data: JSON.stringify({ message: 'Processing completed successfully!' }),
      event: 'complete',
    });
  });
};
