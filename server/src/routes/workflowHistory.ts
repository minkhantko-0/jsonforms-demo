import { Context } from 'hono';
import { db } from '../db';
import { workflowHistory, submissions } from '../db/schema';
import { eq } from 'drizzle-orm';

// Get all workflow history
export const getWorkflowHistoryHandler = async (c: Context) => {
  try {
    const history = await db.select().from(workflowHistory);
    return c.json({ success: true, data: history });
  } catch (error) {
    console.error('Error fetching workflow history:', error);
    return c.json(
      { success: false, error: 'Failed to fetch workflow history' },
      500,
    );
  }
};

// Get workflow history for a specific submission
export const getWorkflowHistoryBySubmissionHandler = async (c: Context) => {
  try {
    const submissionId = parseInt(c.req.param('submissionId'));

    const history = await db
      .select()
      .from(workflowHistory)
      .where(eq(workflowHistory.submissionId, submissionId));

    if (history.length === 0) {
      return c.json(
        { success: false, message: 'No workflow history found' },
        404,
      );
    }

    return c.json({ success: true, data: history[0] });
  } catch (error) {
    console.error('Error fetching workflow history:', error);
    return c.json(
      { success: false, error: 'Failed to fetch workflow history' },
      500,
    );
  }
};

// Create or update workflow history
export const createWorkflowHistoryHandler = async (c: Context) => {
  try {
    const data = await c.req.json();

    const result = await db.insert(workflowHistory).values({
      submissionId: data.submissionId,
      workflowDefinitionId: data.workflowDefinitionId,
      workflowName: data.workflowName,
      currentStage: data.currentStage,
      status: data.status,
      stages: data.stages,
    });

    return c.json({
      success: true,
      id: result[0].insertId,
      message: 'Workflow history created successfully',
    });
  } catch (error) {
    console.error('Error creating workflow history:', error);
    return c.json(
      { success: false, error: 'Failed to create workflow history' },
      500,
    );
  }
};

// Update workflow history
export const updateWorkflowHistoryHandler = async (c: Context) => {
  try {
    const id = parseInt(c.req.param('id'));
    const data = await c.req.json();

    await db
      .update(workflowHistory)
      .set({
        currentStage: data.currentStage,
        status: data.status,
        stages: data.stages,
        updatedAt: new Date(),
      })
      .where(eq(workflowHistory.id, id));

    return c.json({
      success: true,
      message: 'Workflow history updated successfully',
    });
  } catch (error) {
    console.error('Error updating workflow history:', error);
    return c.json(
      { success: false, error: 'Failed to update workflow history' },
      500,
    );
  }
};

// Get submissions with their workflow history
export const getSubmissionsWithWorkflowHandler = async (c: Context) => {
  try {
    const submissionsData = await db.select().from(submissions);
    const historyData = await db.select().from(workflowHistory);

    // Merge submissions with their workflow history
    const result = submissionsData.map(submission => {
      const history = historyData.find(h => h.submissionId === submission.id);
      return {
        ...submission,
        workflowHistory: history || null,
      };
    });

    return c.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching submissions with workflow:', error);
    return c.json({ success: false, error: 'Failed to fetch data' }, 500);
  }
};
