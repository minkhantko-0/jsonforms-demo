import type { Context } from 'hono';
import { db } from '../db';
import { slaTimerDefinitions } from '../db/schema';
import { eq } from 'drizzle-orm';

// Handler for fetching SLA definitions
export const getSlaDefinitionsHandler = async (c: Context) => {
  try {
    const result = await db
      .select()
      .from(slaTimerDefinitions)
      .orderBy(slaTimerDefinitions.id);

    // Filter and extract SLA definitions
    const slaDefinitions = result
      .filter(row => row.data?.type === 'sla' && row.data?.slaDefinition)
      .map(row => row.data.slaDefinition);

    return c.json({
      timestamp: new Date().toISOString(),
      status: 200,
      reqId: crypto.randomUUID(),
      message: 'SLAs fetched successfully',
      data: slaDefinitions,
    });
  } catch (error) {
    console.error('Error fetching SLA definitions:', error);
    return c.json(
      {
        timestamp: new Date().toISOString(),
        status: 500,
        message: 'Failed to fetch SLA definitions',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      500,
    );
  }
};

// Handler for uploading SLA definitions
export const createSlaDefinitionsHandler = async (c: Context) => {
  try {
    const slaDefinition = await c.req.json();

    // Store in database with a type identifier
    const result = await db.insert(slaTimerDefinitions).values({
      data: { slaDefinition, type: 'sla' },
    });

    return c.json({
      success: true,
      id: result[0].insertId,
      message: 'SLA definition saved successfully',
      count: 1,
    });
  } catch (error) {
    console.error('Error saving SLA definition:', error);
    return c.json({ error: 'Failed to save SLA definition' }, 500);
  }
};

// Handler for uploading Timer definitions
export const createTimerDefinitionsHandler = async (c: Context) => {
  try {
    const timerDefinitions = await c.req.json();

    // Store in database with a type identifier
    const result = await db.insert(slaTimerDefinitions).values({
      data: { timerDefinitions, type: 'timer' },
    });

    return c.json({
      success: true,
      id: result[0].insertId,
      message: 'Timer definitions saved successfully',
      count: Array.isArray(timerDefinitions) ? timerDefinitions.length : 0,
    });
  } catch (error) {
    console.error('Error saving Timer definitions:', error);
    return c.json({ error: 'Failed to save Timer definitions' }, 500);
  }
};
