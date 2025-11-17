import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core"

export const userTable = pgTable("user", {
  id: text().primaryKey(),
  name: text().notNull(),
  email: text().notNull().unique(),
  emailVerified: boolean().notNull().default(false),

  role: text(),
  banned: boolean().default(false),
  banReason: text(),
  banExpires: timestamp(),

  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp()
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})

export const sessionTable = pgTable("session", {
  id: text().primaryKey(),
  expiresAt: timestamp().notNull(),
  token: text().notNull().unique(),
  ipAddress: text(),
  userAgent: text(),

  impersonatedBy: text(),

  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp()
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),

  userId: text()
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
})

export const accountTable = pgTable("account", {
  id: text().primaryKey(),
  accountId: text().notNull(),
  providerId: text().notNull(),
  password: text(),

  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp()
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),

  userId: text()
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
})

export const verificationTable = pgTable("verification", {
  id: text().primaryKey(),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: timestamp().notNull(),

  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp()
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})

export type User = typeof userTable.$inferSelect
