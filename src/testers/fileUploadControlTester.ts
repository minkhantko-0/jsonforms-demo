import { rankWith, and, schemaMatches } from '@jsonforms/core';

export default rankWith(
  3,
  and(
    schemaMatches((schema) => schema.format === 'data-url' || schema.contentMediaType !== undefined)
  )
);
