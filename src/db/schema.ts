import { relations } from 'drizzle-orm';
import { account, user } from './auth-schema';
import { pgTable, text, pgEnum, primaryKey } from 'drizzle-orm/pg-core';
import z from 'zod';

export * from './auth-schema';

const APP_SCOPES = ['projects_portal', 'padavali'] as const;
export const AppScopeEnum = z.enum(APP_SCOPES);
export type app_scope_type = (typeof APP_SCOPES)[number];
export const app_scope_enum_db = pgEnum('app_scope', APP_SCOPES);

export const user_app_scope_join = pgTable(
  'user_app_scope_join',
  {
    user_id: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    scope: app_scope_enum_db('scope').notNull()
  },
  (table) => [primaryKey({ columns: [table.user_id, table.scope] })]
);

// relations

export const userRelation = relations(user, ({ one, many }) => ({
  accounts: many(account),
  app_scopes: many(user_app_scope_join)
}));

export const accountRelation = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] })
}));
