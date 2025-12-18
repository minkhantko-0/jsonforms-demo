import { Context } from 'hono';
import { streamSSE } from 'hono/streaming';

const clients = new Set<ReadableStreamDefaultController>();

export const notificationStreamHandler = (c: Context) => {
  return streamSSE(c, async (stream) => {
    clients.add(stream);
    console.log('New SSE client connected. Total clients:', clients.size);

    // Send initial ping to confirm connection
    await stream.writeSSE({ data: 'connected', event: 'ping' });

    stream.onAbort(() => {
      console.log('SSE client disconnected. Remaining clients:', clients.size - 1);
      clients.delete(stream);
    });

    // Keep connection alive with ping every 30 seconds
    while (true) {
      await stream.sleep(30000);
      try {
        await stream.writeSSE({ data: 'ping', event: 'ping' });
      } catch {
        clients.delete(stream);
        break;
      }
    }
  });
};

export const broadcastNotification = async (notification: { id: number; title: string; message: string; isRead: boolean; createdAt: Date }) => {
  const disconnected: ReadableStreamDefaultController[] = [];
  
  for (const client of clients) {
    try {
      await client.writeSSE({
        data: JSON.stringify(notification),
        event: 'notification',
      });
    } catch {
      disconnected.push(client);
    }
  }

  disconnected.forEach(client => clients.delete(client));
};
