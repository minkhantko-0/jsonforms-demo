import { Context } from 'hono';
import { db } from '../db/index';
import { submissions } from '../db/schema';
import { eq } from 'drizzle-orm';
import { broadcastNotification } from './notificationStream';
import { notifications } from '../db/schema';

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

export const processCsvHandler = async (c: Context) => {
  try {
    const { refId } = await c.req.json();
    const submissionId = parseInt(refId);

    // Get submission from database
    const submission = await db
      .select()
      .from(submissions)
      .where(eq(submissions.id, submissionId))
      .limit(1);

    if (!submission.length) {
      return c.json({ success: false, error: 'Submission not found' }, 404);
    }

    const csvUrl = submission[0].data.filePicker;

    // Fetch CSV file
    const response = await fetch(csvUrl);
    const csvText = await response.text();

    // Parse CSV
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());

    // Process in background
    (async () => {
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const row: any = {};
        headers.forEach((header, idx) => {
          row[header] = values[idx];
        });

        const success = row.status?.toLowerCase() === 'true';
        const message = success
          ? `${row.name}(${row.employee_id}) has finished ${row.action}.`
          : `${row.name}(${row.employee_id}) has failed ${row.action}.`;

        await createNotification(
          success ? 'Action Success' : 'Action Failed',
          message,
        );
        await new Promise(resolve => setTimeout(resolve, 5000));
      }

      // Final notification
      await new Promise(resolve => setTimeout(resolve, 5000));
      await createNotification(
        'Workflow Complete',
        'Workflow process completed.',
      );
    })();

    return c.json({ success: true, message: 'CSV processing started' });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
};
