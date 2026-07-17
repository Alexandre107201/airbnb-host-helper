import { pgTable, text, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const localTipsTable = pgTable("local_tips", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull().default("Geral"),
  address: text("address"),
});

export const insertLocalTipSchema = createInsertSchema(localTipsTable).omit({ id: true });
export type InsertLocalTip = z.infer<typeof insertLocalTipSchema>;
export type LocalTip = typeof localTipsTable.$inferSelect;
