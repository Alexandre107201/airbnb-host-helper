import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const rulesTable = pgTable("rules", {
  id: serial("id").primaryKey(),
  order: integer("order").notNull().default(0),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull().default("Geral"),
});

export const insertRuleSchema = createInsertSchema(rulesTable).omit({ id: true });
export type InsertRule = z.infer<typeof insertRuleSchema>;
export type Rule = typeof rulesTable.$inferSelect;
