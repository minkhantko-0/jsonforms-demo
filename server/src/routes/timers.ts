import type { Context } from 'hono';
import { db } from '../db';
import { slaTimerDefinitions } from '../db/schema';

// Handler for fetching Timer definitions
export const getTimerDefinitionsHandler = async (c: Context) => {
  try {
    const result = await db
      .select()
      .from(slaTimerDefinitions)
      .orderBy(slaTimerDefinitions.id);

    // Filter and extract Timer definitions
    const timerDefinitions = result
      .filter(row => row.data?.type === 'timer' && row.data?.timerDefinition)
      .map(row => row.data.timerDefinition);

    return c.json({
      timestamp: new Date().toISOString(),
      status: 200,
      reqId: crypto.randomUUID(),
      message: 'Timers fetched successfully',
      data: timerDefinitions,
    });
  } catch (error) {
    console.error('Error fetching Timer definitions:', error);
    return c.json(
      {
        timestamp: new Date().toISOString(),
        status: 500,
        message: 'Failed to fetch Timer definitions',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      500,
    );
  }
};

// Handler for uploading Timer definitions
export const createTimerDefinitionsHandler = async (c: Context) => {
  try {
    const timerDefinition = await c.req.json();

    // Store in database with a type identifier
    const result = await db.insert(slaTimerDefinitions).values({
      data: { timerDefinition, type: 'timer' },
    });

    return c.json({
      success: true,
      id: result[0].insertId,
      message: 'Timer definition saved successfully',
      count: 1,
    });
  } catch (error) {
    console.error('Error saving Timer definition:', error);
    return c.json({ error: 'Failed to save Timer definition' }, 500);
  }
};
