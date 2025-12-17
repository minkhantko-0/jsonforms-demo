import { mysqlTable, int, json, timestamp, varchar, boolean } from 'drizzle-orm/mysql-core';

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
