import { Context } from 'hono';

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
