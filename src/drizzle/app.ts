import { relations, sql } from "drizzle-orm"
import { pgTable, text, timestamp, unique, numeric } from "drizzle-orm/pg-core"
import { userTable } from "./auth"

const uuid = text()
  .primaryKey()
  .default(sql`gen_random_uuid()`)

export const companyTable = pgTable("company", {
  id: uuid,
  slug: text().notNull().unique(),
  name: text().notNull(),
  description: text(),
  stage: text(),
  valuation: numeric(),
  askingAmount: numeric(),
})

export const companyRelations = relations(companyTable, ({ many }) => ({
  uploads: many(uploadTable),
  members: many(relationTable),
}))

export const uploadTable = pgTable("upload", {
  id: uuid,
  name: text().notNull(),
  type: text({ enum: ["material", "work"] }).notNull(),
  extension: text().notNull(),

  companyId: text()
    .notNull()
    .references(() => companyTable.id, { onDelete: "cascade" }),
  userId: text().references(() => userTable.id, { onDelete: "set null" }),

  summary: text(),
  processed: timestamp(),
  error: text(),
})

export const uploadRelations = relations(uploadTable, ({ one }) => ({
  company: one(companyTable, {
    fields: [uploadTable.companyId],
    references: [companyTable.id],
  }),
  user: one(userTable, {
    fields: [uploadTable.userId],
    references: [userTable.id],
  }),
}))

export const relationTable = pgTable(
  "relation",
  {
    id: uuid,
    role: text({ enum: ["owner", "editor", "viewer"] })
      .notNull()
      .default("viewer"),
    joined: timestamp().notNull().defaultNow(),

    companyId: text()
      .notNull()
      .references(() => companyTable.id, { onDelete: "cascade" }),
    userId: text()
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
  },
  (table) => [unique().on(table.companyId, table.userId)],
)

export const relationRelations = relations(relationTable, ({ one }) => ({
  company: one(companyTable, {
    fields: [relationTable.companyId],
    references: [companyTable.id],
  }),
  user: one(userTable, {
    fields: [relationTable.userId],
    references: [userTable.id],
  }),
}))

export type Upload = typeof uploadTable.$inferSelect
export type Relation = typeof relationTable.$inferSelect
