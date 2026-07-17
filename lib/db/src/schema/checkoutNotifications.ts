import { pgTable, serial, timestamp, boolean } from "drizzle-orm/pg-core";

export const checkoutNotificationsTable = pgTable("checkout_notifications", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  dismissed: boolean("dismissed").notNull().default(false),
});

export type CheckoutNotification = typeof checkoutNotificationsTable.$inferSelect;
