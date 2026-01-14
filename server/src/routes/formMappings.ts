import { Context } from 'hono';
import { db } from '../db';
import { formMappings } from '../db/schema';
import { eq } from 'drizzle-orm';

// Get all form mappings
export const getFormMappingsHandler = async (c: Context) => {
  try {
    const mappings = await db.select().from(formMappings);
    return c.json({
      success: true,
      data: mappings,
    });
  } catch (error) {
    console.error('Error fetching form mappings:', error);
    return c.json({ error: 'Failed to fetch form mappings' }, 500);
  }
};

// Get single form mapping by ID
export const getFormMappingByIdHandler = async (c: Context) => {
  try {
    const id = parseInt(c.req.param('id'));
    const mapping = await db
      .select()
      .from(formMappings)
      .where(eq(formMappings.id, id));

    if (mapping.length === 0) {
      return c.json({ error: 'Form mapping not found' }, 404);
    }

    return c.json({
      success: true,
      data: mapping[0],
    });
  } catch (error) {
    console.error('Error fetching form mapping:', error);
    return c.json({ error: 'Failed to fetch form mapping' }, 500);
  }
};

// Create new form mapping
export const createFormMappingHandler = async (c: Context) => {
  try {
    const body = await c.req.json();
    const { name, formSchema, uiSchema, workflowId, description } = body;

    if (!name || !formSchema || !workflowId) {
      return c.json(
        { error: 'Name, formSchema, and workflowId are required' },
        400,
      );
    }

    const result = await db.insert(formMappings).values({
      name,
      formSchema,
      uiSchema: uiSchema || null,
      workflowId,
      description: description || null,
    });

    return c.json({
      success: true,
      id: result[0].insertId,
      message: 'Form mapping created successfully',
    });
  } catch (error) {
    console.error('Error creating form mapping:', error);
    return c.json({ error: 'Failed to create form mapping' }, 500);
  }
};

// Update form mapping
export const updateFormMappingHandler = async (c: Context) => {
  try {
    const id = parseInt(c.req.param('id'));
    const body = await c.req.json();
    const { name, formSchema, uiSchema, workflowId, description } = body;

    if (!name || !formSchema || !workflowId) {
      return c.json(
        { error: 'Name, formSchema, and workflowId are required' },
        400,
      );
    }

    const result = await db
      .update(formMappings)
      .set({
        name,
        formSchema,
        uiSchema: uiSchema || null,
        workflowId,
        description: description || null,
        updatedAt: new Date(),
      })
      .where(eq(formMappings.id, id));

    if (result[0].affectedRows === 0) {
      return c.json({ error: 'Form mapping not found' }, 404);
    }

    return c.json({
      success: true,
      message: 'Form mapping updated successfully',
    });
  } catch (error) {
    console.error('Error updating form mapping:', error);
    return c.json({ error: 'Failed to update form mapping' }, 500);
  }
};

// Delete form mapping
export const deleteFormMappingHandler = async (c: Context) => {
  try {
    const id = parseInt(c.req.param('id'));

    const result = await db.delete(formMappings).where(eq(formMappings.id, id));

    if (result[0].affectedRows === 0) {
      return c.json({ error: 'Form mapping not found' }, 404);
    }

    return c.json({
      success: true,
      message: 'Form mapping deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting form mapping:', error);
    return c.json({ error: 'Failed to delete form mapping' }, 500);
  }
};
