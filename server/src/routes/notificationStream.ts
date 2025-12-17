import { Context } from 'hono';
import { streamSSE } from 'hono/streaming';

const clients = new Set<ReadableStreamDefaultController>();

export const notificationStreamHandler = (c: Context) => {
  return streamSSE(c, async (stream) => {
    clients.add(stream);

    stream.onAbort(() => {
      clients.delete(stream);
    });

    // Keep connection alive
    const keepAlive = setInterval(async () => {
      try {
        await stream.writeSSE({ data: 'ping', event: 'ping' });
      } catch {
        clearInterval(keepAlive);
        clients.delete(stream);
      }
    }, 30000);
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
