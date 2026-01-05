import type { Context } from 'hono';
import { db } from '../db';
import { workflowDefinitions } from '../db/schema';
import { eq } from 'drizzle-orm';

export const getWorkflowDefinitionsHandler = async (c: Context) => {
  try {
    const result = await db
      .select()
      .from(workflowDefinitions)
      .orderBy(workflowDefinitions.id);
    return c.json(result);
  } catch (error) {
    console.error('Error fetching workflow definitions:', error);
    return c.json({ error: 'Failed to fetch workflow definitions' }, 500);
  }
};

export const getWorkflowDefinitionByIdHandler = async (c: Context) => {
  try {
    const id = parseInt(c.req.param('id'));
    const result = await db
      .select()
      .from(workflowDefinitions)
      .where(eq(workflowDefinitions.id, id));

    if (result.length === 0) {
      return c.json({ error: 'Workflow not found' }, 404);
    }

    return c.json(result[0]);
  } catch (error) {
    console.error('Error fetching workflow definition:', error);
    return c.json({ error: 'Failed to fetch workflow definition' }, 500);
  }
};

export const createWorkflowDefinitionHandler = async (c: Context) => {
  try {
    const body = await c.req.json();

    const result = await db.insert(workflowDefinitions).values({
      name: body.name || 'Untitled Workflow',
      data: body,
    });

    return c.json({
      success: true,
      id: result[0].insertId,
      message: 'Workflow saved successfully',
    });
  } catch (error) {
    console.error('Error saving workflow definition:', error);
    return c.json({ error: 'Failed to save workflow definition' }, 500);
  }
};

export const updateWorkflowDefinitionHandler = async (c: Context) => {
  try {
    const id = parseInt(c.req.param('id'));
    const body = await c.req.json();

    await db
      .update(workflowDefinitions)
      .set({
        name: body.name || 'Untitled Workflow',
        data: body,
        updatedAt: new Date(),
      })
      .where(eq(workflowDefinitions.id, id));

    return c.json({
      success: true,
      message: 'Workflow updated successfully',
    });
  } catch (error) {
    console.error('Error updating workflow definition:', error);
    return c.json({ error: 'Failed to update workflow definition' }, 500);
  }
};

export const deleteWorkflowDefinitionHandler = async (c: Context) => {
  try {
    const id = parseInt(c.req.param('id'));
    await db.delete(workflowDefinitions).where(eq(workflowDefinitions.id, id));

    return c.json({
      success: true,
      message: 'Workflow deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting workflow definition:', error);
    return c.json({ error: 'Failed to delete workflow definition' }, 500);
  }
};
