import { relations, sql } from "drizzle-orm"
import { pgTable, text } from "drizzle-orm/pg-core"
import { userTable } from "./auth"

const uuid = text()
  .primaryKey()
  .default(sql`gen_random_uuid()`)

export const companyTable = pgTable("company", {
  id: uuid,
  slug: text().notNull().unique(),
  name: text().notNull(),
})

export const companyRelations = relations(companyTable, ({ many }) => ({
  uploads: many(uploadTable),
}))

export const uploadTable = pgTable("upload", {
  id: uuid,
  name: text().notNull(),
  type: text({ enum: ["material", "work"] }).notNull(),

  companyId: text()
    .notNull()
    .references(() => companyTable.id, { onDelete: "cascade" }),
  userId: text().references(() => userTable.id, { onDelete: "set null" }),
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

export type Upload = typeof uploadTable.$inferSelect
