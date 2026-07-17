import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const checkinStepsTable = pgTable("checkin_steps", {
  id: serial("id").primaryKey(),
  order: integer("order").notNull().default(0),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon"),
  requiresConfirmation: boolean("requires_confirmation").notNull().default(false),
});

export const insertCheckinStepSchema = createInsertSchema(checkinStepsTable).omit({ id: true });
export type InsertCheckinStep = z.infer<typeof insertCheckinStepSchema>;
export type CheckinStep = typeof checkinStepsTable.$inferSelect;

export const checkoutStepsTable = pgTable("checkout_steps", {
  id: serial("id").primaryKey(),
  order: integer("order").notNull().default(0),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon"),
  requiresConfirmation: boolean("requires_confirmation").notNull().default(false),
});

export const insertCheckoutStepSchema = createInsertSchema(checkoutStepsTable).omit({ id: true });
export type InsertCheckoutStep = z.infer<typeof insertCheckoutStepSchema>;
export type CheckoutStep = typeof checkoutStepsTable.$inferSelect;
