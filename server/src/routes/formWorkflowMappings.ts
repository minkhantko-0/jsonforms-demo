import { Context } from 'hono';
import { and, eq } from 'drizzle-orm';
import { db } from '../db';
import { formWorkflowMappings } from '../db/schema';

const isValidStatus = (status?: string) =>
  !status || status === 'active' || status === 'inactive';

export const getFormWorkflowMappingsHandler = async (c: Context) => {
  try {
    const mappings = await db.select().from(formWorkflowMappings);
    return c.json({ success: true, data: mappings });
  } catch (error) {
    console.error('Error fetching form workflow mappings:', error);
    return c.json(
      { success: false, message: 'Failed to fetch form workflow mappings' },
      500,
    );
  }
};

export const getFormWorkflowMappingByIdHandler = async (c: Context) => {
  try {
    const id = Number(c.req.param('id'));
    if (Number.isNaN(id)) {
      return c.json({ success: false, message: 'Invalid mapping id' }, 400);
    }

    const mapping = await db
      .select()
      .from(formWorkflowMappings)
      .where(eq(formWorkflowMappings.id, id));

    if (!mapping.length) {
      return c.json({ success: false, message: 'Mapping not found' }, 404);
    }

    return c.json({ success: true, data: mapping[0] });
  } catch (error) {
    console.error('Error fetching form workflow mapping:', error);
    return c.json(
      { success: false, message: 'Failed to fetch form workflow mapping' },
      500,
    );
  }
};

export const createFormWorkflowMappingHandler = async (c: Context) => {
  try {
    const body = await c.req.json();
    const { formKey, workflowKey, status } = body ?? {};

    if (!formKey || !workflowKey) {
      return c.json(
        { success: false, message: 'formKey and workflowKey are required' },
        400,
      );
    }

    if (!isValidStatus(status)) {
      return c.json(
        { success: false, message: 'status must be active or inactive' },
        400,
      );
    }

    const duplicate = await db
      .select()
      .from(formWorkflowMappings)
      .where(
        and(
          eq(formWorkflowMappings.formKey, formKey),
          eq(formWorkflowMappings.workflowKey, workflowKey),
        ),
      );

    if (duplicate.length) {
      return c.json(
        {
          success: false,
          message: 'Mapping already exists for this formKey and workflowKey',
        },
        409,
      );
    }

    const insertResult = await db.insert(formWorkflowMappings).values({
      formKey,
      workflowKey,
      status: status ?? 'active',
    });

    const newId = insertResult[0].insertId;
    const created = await db
      .select()
      .from(formWorkflowMappings)
      .where(eq(formWorkflowMappings.id, newId));

    return c.json({
      success: true,
      data: created[0],
      message: 'Form workflow mapping created successfully',
    });
  } catch (error) {
    console.error('Error creating form workflow mapping:', error);
    return c.json(
      { success: false, message: 'Failed to create form workflow mapping' },
      500,
    );
  }
};

export const updateFormWorkflowMappingHandler = async (c: Context) => {
  try {
    const id = Number(c.req.param('id'));
    if (Number.isNaN(id)) {
      return c.json({ success: false, message: 'Invalid mapping id' }, 400);
    }

    const body = await c.req.json();
    const { formKey, workflowKey, status } = body ?? {};

    if (!formKey || !workflowKey) {
      return c.json(
        { success: false, message: 'formKey and workflowKey are required' },
        400,
      );
    }

    if (!isValidStatus(status)) {
      return c.json(
        { success: false, message: 'status must be active or inactive' },
        400,
      );
    }

    const duplicate = await db
      .select()
      .from(formWorkflowMappings)
      .where(
        and(
          eq(formWorkflowMappings.formKey, formKey),
          eq(formWorkflowMappings.workflowKey, workflowKey),
        ),
      );

    if (duplicate.length && duplicate[0].id !== id) {
      return c.json(
        {
          success: false,
          message: 'Mapping already exists for this formKey and workflowKey',
        },
        409,
      );
    }

    const updateResult = await db
      .update(formWorkflowMappings)
      .set({
        formKey,
        workflowKey,
        status: status ?? 'active',
        updatedAt: new Date(),
      })
      .where(eq(formWorkflowMappings.id, id));

    if (updateResult[0].affectedRows === 0) {
      return c.json({ success: false, message: 'Mapping not found' }, 404);
    }

    const updated = await db
      .select()
      .from(formWorkflowMappings)
      .where(eq(formWorkflowMappings.id, id));

    return c.json({
      success: true,
      data: updated[0],
      message: 'Form workflow mapping updated successfully',
    });
  } catch (error) {
    console.error('Error updating form workflow mapping:', error);
    return c.json(
      { success: false, message: 'Failed to update form workflow mapping' },
      500,
    );
  }
};

export const deleteFormWorkflowMappingHandler = async (c: Context) => {
  try {
    const id = Number(c.req.param('id'));
    if (Number.isNaN(id)) {
      return c.json({ success: false, message: 'Invalid mapping id' }, 400);
    }

    const deleteResult = await db
      .delete(formWorkflowMappings)
      .where(eq(formWorkflowMappings.id, id));

    if (deleteResult[0].affectedRows === 0) {
      return c.json({ success: false, message: 'Mapping not found' }, 404);
    }

    return c.json({
      success: true,
      message: 'Form workflow mapping deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting form workflow mapping:', error);
    return c.json(
      { success: false, message: 'Failed to delete form workflow mapping' },
      500,
    );
  }
};
