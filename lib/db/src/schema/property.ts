import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const propertyTable = pgTable("property", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default(""),
  address: text("address").notNull().default(""),
  description: text("description").notNull().default(""),
  checkInTime: text("check_in_time").notNull().default("14:00"),
  checkOutTime: text("check_out_time").notNull().default("11:00"),
  maxGuests: integer("max_guests").notNull().default(2),
  wifiName: text("wifi_name").notNull().default(""),
  wifiPassword: text("wifi_password").notNull().default(""),
  contactPhone: text("contact_phone"),
  contactEmail: text("contact_email"),
  coverImageUrl: text("cover_image_url"),
  welcomeMessage: text("welcome_message"),
  reviewUrl: text("review_url"),
  checkoutNotes: text("checkout_notes"),
});

export const insertPropertySchema = createInsertSchema(propertyTable).omit({ id: true });
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof propertyTable.$inferSelect;
