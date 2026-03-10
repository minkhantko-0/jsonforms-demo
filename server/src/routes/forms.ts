import { Context } from 'hono';
import { and, eq, ne } from 'drizzle-orm';
import { db } from '../db';
import { forms } from '../db/schema';

export const getFormsHandler = async (c: Context) => {
  try {
    const result = await db.select().from(forms);
    return c.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching forms:', error);
    return c.json({ success: false, message: 'Failed to fetch forms' }, 500);
  }
};

export const getFormByIdHandler = async (c: Context) => {
  try {
    const id = Number(c.req.param('id'));
    if (Number.isNaN(id)) {
      return c.json({ success: false, message: 'Invalid form id' }, 400);
    }

    const result = await db.select().from(forms).where(eq(forms.id, id));
    if (!result.length) {
      return c.json({ success: false, message: 'Form not found' }, 404);
    }

    return c.json({ success: true, data: result[0] });
  } catch (error) {
    console.error('Error fetching form by id:', error);
    return c.json({ success: false, message: 'Failed to fetch form' }, 500);
  }
};

export const createFormHandler = async (c: Context) => {
  try {
    const body = await c.req.json();
    const { name, key, schema, uiSchema } = body ?? {};

    if (!name || !key || !schema) {
      return c.json(
        { success: false, message: 'name, key, and schema are required' },
        400,
      );
    }

    const duplicate = await db.select().from(forms).where(eq(forms.key, key));
    if (duplicate.length) {
      return c.json(
        { success: false, message: 'Form key already exists' },
        409,
      );
    }

    const insertResult = await db.insert(forms).values({
      name,
      key,
      schema,
      uiSchema: uiSchema ?? null,
    });

    const newId = insertResult[0].insertId;
    const created = await db.select().from(forms).where(eq(forms.id, newId));

    return c.json({
      success: true,
      data: created[0],
      message: 'Form created successfully',
    });
  } catch (error) {
    console.error('Error creating form:', error);
    return c.json({ success: false, message: 'Failed to create form' }, 500);
  }
};

export const updateFormHandler = async (c: Context) => {
  try {
    const id = Number(c.req.param('id'));
    if (Number.isNaN(id)) {
      return c.json({ success: false, message: 'Invalid form id' }, 400);
    }

    const body = await c.req.json();
    const { name, key, schema, uiSchema } = body ?? {};

    if (!name || !key || !schema) {
      return c.json(
        { success: false, message: 'name, key, and schema are required' },
        400,
      );
    }

    const duplicate = await db
      .select()
      .from(forms)
      .where(and(eq(forms.key, key), ne(forms.id, id)));

    if (duplicate.length) {
      return c.json(
        { success: false, message: 'Form key already exists' },
        409,
      );
    }

    const updateResult = await db
      .update(forms)
      .set({
        name,
        key,
        schema,
        uiSchema: uiSchema ?? null,
        updatedAt: new Date(),
      })
      .where(eq(forms.id, id));

    if (updateResult[0].affectedRows === 0) {
      return c.json({ success: false, message: 'Form not found' }, 404);
    }

    const updated = await db.select().from(forms).where(eq(forms.id, id));
    return c.json({
      success: true,
      data: updated[0],
      message: 'Form updated successfully',
    });
  } catch (error) {
    console.error('Error updating form:', error);
    return c.json({ success: false, message: 'Failed to update form' }, 500);
  }
};

export const deleteFormHandler = async (c: Context) => {
  try {
    const id = Number(c.req.param('id'));
    if (Number.isNaN(id)) {
      return c.json({ success: false, message: 'Invalid form id' }, 400);
    }

    const deleteResult = await db.delete(forms).where(eq(forms.id, id));
    if (deleteResult[0].affectedRows === 0) {
      return c.json({ success: false, message: 'Form not found' }, 404);
    }

    return c.json({ success: true, message: 'Form deleted successfully' });
  } catch (error) {
    console.error('Error deleting form:', error);
    return c.json({ success: false, message: 'Failed to delete form' }, 500);
  }
};
