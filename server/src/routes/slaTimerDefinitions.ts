import type { Context } from 'hono';
import { db } from '../db';
import { slaTimerDefinitions } from '../db/schema';
import { eq } from 'drizzle-orm';

export const getSlaTimerDefinitionsHandler = async (c: Context) => {
  try {
    const result = await db
      .select()
      .from(slaTimerDefinitions)
      .orderBy(slaTimerDefinitions.id);

    if (result.length === 0) {
      return c.json({ slaDefinitions: [], timerDefinitions: [] });
    }

    // Return the latest definition
    const latest = result[result.length - 1];
    return c.json(latest.data);
  } catch (error) {
    console.error('Error fetching SLA/Timer definitions:', error);
    return c.json({ error: 'Failed to fetch definitions' }, 500);
  }
};

export const createSlaTimerDefinitionsHandler = async (c: Context) => {
  try {
    const body = await c.req.json();

    const result = await db.insert(slaTimerDefinitions).values({
      data: body,
    });

    return c.json({
      success: true,
      id: result[0].insertId,
      message: 'SLA and Timer definitions saved successfully',
    });
  } catch (error) {
    console.error('Error saving SLA/Timer definitions:', error);
    return c.json({ error: 'Failed to save definitions' }, 500);
  }
};

export const getAllSlaTimerDefinitionsHandler = async (c: Context) => {
  try {
    const result = await db
      .select()
      .from(slaTimerDefinitions)
      .orderBy(slaTimerDefinitions.id);
    return c.json(result);
  } catch (error) {
    console.error('Error fetching all SLA/Timer definitions:', error);
    return c.json({ error: 'Failed to fetch definitions' }, 500);
  }
};

export const getSlaTimerDefinitionByIdHandler = async (c: Context) => {
  try {
    const id = parseInt(c.req.param('id'));
    const result = await db
      .select()
      .from(slaTimerDefinitions)
      .where(eq(slaTimerDefinitions.id, id));

    if (result.length === 0) {
      return c.json({ error: 'Definition not found' }, 404);
    }

    return c.json(result[0]);
  } catch (error) {
    console.error('Error fetching SLA/Timer definition:', error);
    return c.json({ error: 'Failed to fetch definition' }, 500);
  }
};
