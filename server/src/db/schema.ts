import {
  mysqlTable,
  int,
  json,
  timestamp,
  varchar,
  boolean,
  uniqueIndex,
} from 'drizzle-orm/mysql-core';

export const submissions = mysqlTable('submissions', {
  id: int('id').primaryKey().autoincrement(),
  data: json('data').notNull(),
  formSchema: json('form_schema').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const notifications = mysqlTable('notifications', {
  id: int('id').primaryKey().autoincrement(),
  title: varchar('title', { length: 255 }).notNull(),
  message: varchar('message', { length: 500 }).notNull(),
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const workflowDefinitions = mysqlTable('workflow_definitions', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  data: json('data').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const slaTimerDefinitions = mysqlTable('sla_timer_definitions', {
  id: int('id').primaryKey().autoincrement(),
  data: json('data').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const formMappings = mysqlTable('form_mappings', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  formSchema: json('form_schema').notNull(),
  uiSchema: json('ui_schema'),
  workflowId: varchar('workflow_id', { length: 255 }).notNull(),
  description: varchar('description', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const forms = mysqlTable(
  'forms',
  {
    id: int('id').primaryKey().autoincrement(),
    name: varchar('name', { length: 255 }).notNull(),
    key: varchar('key', { length: 255 }).notNull(),
    schema: json('schema').notNull(),
    uiSchema: json('ui_schema'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => ({
    formKeyUnique: uniqueIndex('forms_key_unique').on(table.key),
  }),
);

export const formWorkflowMappings = mysqlTable(
  'form_workflow_mappings',
  {
    id: int('id').primaryKey().autoincrement(),
    formKey: varchar('form_key', { length: 255 }).notNull(),
    workflowKey: varchar('workflow_key', { length: 255 }).notNull(),
    status: varchar('status', { length: 32 }).notNull().default('active'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => ({
    formWorkflowUnique: uniqueIndex('form_workflow_unique').on(
      table.formKey,
      table.workflowKey,
    ),
  }),
);
