// importing all modules
import { relations, sql } from "drizzle-orm";
import {
  boolean,
  int,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { email } from "zod/v4";

// creating all tables
export const sessionTable = mysqlTable("session_table", {
  id: int().autoincrement().primaryKey(),
  userId: int("user_id")
    .notNull()
    .references(() => usersTable.id),
  valid: boolean().default(true).notNull(),
  userAgent: text("user_agent").notNull(),
  ip: varchar("user_ip", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const verifyEmail = mysqlTable("verify_email", {
  id: int().autoincrement().primaryKey(),
  userId: int("user_id")
    .notNull()
    .references(() => usersTable.id),
  valid: boolean().default(true).notNull(),
  token: varchar({ length: 8 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expireAt: timestamp("expire_at")
    .default(sql`(CURRENT_TIMESTAMP + INTERVAL 15 MINUTE)`)
    .notNull(),
});

export const usersTable = mysqlTable("users_table", {
  id: int().autoincrement().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  userName: varchar("user_name", { length: 255 }).notNull().unique(),
  email: varchar({ length: 255 }).notNull().unique(),
  isVerified: boolean("is_verified_email").default(false).notNull(),
  password: varchar({ length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// defining all relations
const usersTableRelation = relations(usersTable, ({ many }) => ({
  session: many(sessionTable),
  verifyEmail: many(verifyEmail),
}));

const verifyEmailRelation = relations(verifyEmail, ({ one }) => ({
  session: one(usersTable, {
    fields: [verifyEmail.userId],
    references: [usersTable.id],
  }),
}));

const sessionTableRelation = relations(sessionTable, ({ one }) => ({
  user: one(sessionTable, {
    fields: [sessionTable.userId],
    references: [usersTable.id],
  }),
}));
