import { Context } from 'hono';
import { db } from '../db';
import { workflowDefinitions } from '../db/schema';

// Mock workflow data - Replace this with actual database query
const workflows = [
  {
    id: 'workflow-1',
    name: 'Standard Approval',
    description: 'Regular approval process',
  },
  {
    id: 'workflow-2',
    name: 'Manager Approval',
    description: 'Requires manager sign-off',
  },
  {
    id: 'workflow-3',
    name: 'Executive Approval',
    description: 'Requires executive approval',
  },
  {
    id: 'workflow-4',
    name: 'Board Approval',
    description: 'Requires board of directors approval',
  },
  {
    id: 'workflow-5',
    name: 'Emergency Approval',
    description: 'Fast-track emergency process',
  },
];

export const getWorkflowsHandler = async (c: Context) => {
  try {
    // In a real application, you would fetch this from a database
    // Example: const workflows = await db.select().from(workflowsTable);

    return c.json(workflows);
  } catch (error) {
    console.error('Error fetching workflows:', error);
    return c.json({ error: 'Failed to fetch workflows' }, 500);
  }
};

// Handler for uploading Workflow definitions (first object only)
export const createWorkflowHandler = async (c: Context) => {
  try {
    const workflowDefinition = await c.req.json();

    // Store in database - wrap single object back into array format for storage
    const result = await db.insert(workflowDefinitions).values({
      name: workflowDefinition.name,
      data: { workflowDefinitions: [workflowDefinition] },
    });

    return c.json({
      success: true,
      id: result[0].insertId,
      message: 'Workflow definition saved successfully',
    });
  } catch (error) {
    console.error('Error saving Workflow definition:', error);
    return c.json({ error: 'Failed to save Workflow definition' }, 500);
  }
};
