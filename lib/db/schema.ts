import { pgTable, serial, varchar, text, timestamp, boolean, integer, pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const consultationTypeEnum = pgEnum("consultation_type", ["phone", "in_person"]);
export const slotStatusEnum = pgEnum("slot_status", ["available", "requested", "booked", "declined"]);
export const appointmentTypeEnum = pgEnum("appointment_type", ["consultation", "extension"]);
export const appointmentStatusEnum = pgEnum("appointment_status", ["pending", "confirmed", "completed", "cancelled"]);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  password: varchar("password", { length: 255 }),
  role: userRoleEnum("role").default("user").notNull(),
  emailVerified: timestamp("email_verified"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Consultation slots (freie Beratungstermine)
export const consultationSlots = pgTable("consultation_slots", {
  id: serial("id").primaryKey(),
  datetime: timestamp("datetime").notNull(),
  type: consultationTypeEnum("type").notNull(),
  status: slotStatusEnum("status").default("available").notNull(),
  userId: integer("user_id").references(() => users.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Appointments (Haarverlängerungstermine)
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  datetime: timestamp("datetime").notNull(),
  type: appointmentTypeEnum("type").notNull(),
  status: appointmentStatusEnum("status").default("pending").notNull(),
  address: text("address").default("Graf-zu-Toerring-Straße"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Messages (Chat)
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  receiverId: integer("receiver_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Gallery images
export const galleryImages = pgTable("gallery_images", {
  id: serial("id").primaryKey(),
  url: varchar("url", { length: 500 }).notNull(),
  caption: varchar("caption", { length: 500 }),
  carousel: boolean("carousel").default(false).notNull(),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type ConsultationSlot = typeof consultationSlots.$inferSelect;
export type NewConsultationSlot = typeof consultationSlots.$inferInsert;
export type Appointment = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
export type GalleryImage = typeof galleryImages.$inferSelect;
export type NewGalleryImage = typeof galleryImages.$inferInsert;
