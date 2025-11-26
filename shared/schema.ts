import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const incidents = pgTable("incidents", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  latitude: text("latitude"),
  longitude: text("longitude"),
  isAnonymous: boolean("is_anonymous").notNull().default(false),
  reportedAt: timestamp("reported_at").notNull().defaultNow(),
});

export const insertIncidentSchema = createInsertSchema(incidents).omit({
  id: true,
  reportedAt: true,
});

export type InsertIncident = z.infer<typeof insertIncidentSchema>;
export type Incident = typeof incidents.$inferSelect;

export const goBagItems = pgTable("go_bag_items", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  name: text("name").notNull(),
  checked: boolean("checked").notNull().default(false),
});

export const insertGoBagItemSchema = createInsertSchema(goBagItems).omit({
  id: true,
});

export type InsertGoBagItem = z.infer<typeof insertGoBagItemSchema>;
export type GoBagItem = typeof goBagItems.$inferSelect;

export const evacuationCenters = pgTable("evacuation_centers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  distance: text("distance").notNull(),
  capacity: text("capacity").notNull(),
  status: text("status").notNull().default("Open"),
  latitude: text("latitude"),
  longitude: text("longitude"),
});

export const insertEvacuationCenterSchema = createInsertSchema(evacuationCenters).omit({
  id: true,
});

export type InsertEvacuationCenter = z.infer<typeof insertEvacuationCenterSchema>;
export type EvacuationCenter = typeof evacuationCenters.$inferSelect;

export const households = pgTable("households", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
});

export const insertHouseholdSchema = createInsertSchema(households).omit({
  id: true,
});

export type InsertHousehold = z.infer<typeof insertHouseholdSchema>;
export type Household = typeof households.$inferSelect;

export const members = pgTable("members", {
  id: serial("id").primaryKey(),
  householdId: integer("household_id").notNull().references(() => households.id),
  name: text("name").notNull(),
  contact: text("contact"),
  lastKnownLocation: text("last_known_location"),
  status: text("status").notNull().default("unknown"),
});

export const insertMemberSchema = createInsertSchema(members).omit({
  id: true,
});

export type InsertMember = z.infer<typeof insertMemberSchema>;
export type Member = typeof members.$inferSelect;

export const checkIns = pgTable("check_ins", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull().references(() => members.id),
  location: text("location"),
  isSafe: boolean("is_safe").notNull().default(true),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertCheckInSchema = createInsertSchema(checkIns).omit({
  id: true,
  timestamp: true,
});

export type InsertCheckIn = z.infer<typeof insertCheckInSchema>;
export type CheckIn = typeof checkIns.$inferSelect;

export const hazardZones = pgTable("hazard_zones", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  coordinates: text("coordinates").array().notNull(),
  severity: text("severity").notNull().default("medium"),
});

export const insertHazardZoneSchema = createInsertSchema(hazardZones).omit({
  id: true,
});

export type InsertHazardZone = z.infer<typeof insertHazardZoneSchema>;
export type HazardZone = typeof hazardZones.$inferSelect;

export const pois = pgTable("pois", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  address: text("address"),
  available: boolean("available").notNull().default(true),
});

export const insertPoiSchema = createInsertSchema(pois).omit({
  id: true,
});

export type InsertPoi = z.infer<typeof insertPoiSchema>;
export type Poi = typeof pois.$inferSelect;
