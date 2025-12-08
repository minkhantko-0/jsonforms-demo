import { Context } from 'hono';
import { jsonSchemaToZod } from 'json-schema-to-zod';
import { z } from 'zod';

export const pendingSubmissions = new Map<
  string,
  { data: any; schema: any; formData?: FormData }
>();

export const submitHandler = async (c: Context) => {
  try {
    const contentType = c.req.header('content-type') || '';
    let data: any;
    let schema: any;
    let formData: FormData | null = null;

    if (contentType.includes('multipart/form-data')) {
      formData = await c.req.formData();
      schema = JSON.parse(formData.get('schema') as string);
      data = JSON.parse(formData.get('data') as string);
    } else {
      const body = await c.req.json();
      data = body.data;
      schema = body.schema;
    }

    const zodSchemaString = jsonSchemaToZod(schema);
    const zodSchema = new Function('z', `return ${zodSchemaString}`)(z);
    zodSchema.parse(data);

    const sessionId = Date.now().toString();
    pendingSubmissions.set(sessionId, {
      data,
      schema,
      formData: formData || undefined,
    });

    return c.json({ success: true, sessionId });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
};
