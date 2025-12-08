import { Context } from 'hono';
import { db } from '../db/index';
import { submissions } from '../db/schema';

export const getSubmissionsHandler = async (c: Context) => {
  try {
    const allSubmissions = await db.select().from(submissions);
    return c.json({ success: true, data: allSubmissions });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
};
