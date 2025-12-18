import { Context } from 'hono';
import { db } from '../db/index';
import { notifications } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { broadcastNotification } from './notificationStream';

export const getNotificationsHandler = async (c: Context) => {
  try {
    const allNotifications = await db
      .select()
      .from(notifications)
      .orderBy(desc(notifications.createdAt));
    return c.json({ success: true, data: allNotifications });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
};

export const createNotificationHandler = async (c: Context) => {
  try {
    const { title, message } = await c.req.json();
    const result = await db.insert(notifications).values({ title, message });
    const newNotification = {
      id: result[0].insertId,
      title,
      message,
      isRead: false,
      createdAt: new Date(),
    };
    console.log('newNotification', newNotification);
    await broadcastNotification(newNotification);
    return c.json({ success: true, id: result[0].insertId });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
};

export const markAsReadHandler = async (c: Context) => {
  try {
    const id = parseInt(c.req.param('id'));
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
};

export const deleteNotificationHandler = async (c: Context) => {
  try {
    const id = parseInt(c.req.param('id'));
    await db.delete(notifications).where(eq(notifications.id, id));
    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
};

export const markAllAsReadHandler = async (c: Context) => {
  try {
    await db.update(notifications).set({ isRead: true });
    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
};
