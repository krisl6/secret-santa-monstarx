import { pgTable, varchar, text, timestamp, uuid, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

export * from "./models/auth";

// Teams table - each company/group has its own team
export const teams = pgTable("teams", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  ownerId: varchar("owner_id").notNull(), // User ID who created the team
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTeamSchema = createInsertSchema(teams).omit({ id: true, createdAt: true });
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Team = typeof teams.$inferSelect;

// Team members - tracks who belongs to which team
export const teamMembers = pgTable("team_members", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: uuid("team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull(), // User ID from auth
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({ id: true, joinedAt: true });
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;

// Wishlists - each user in a team has their wishlist
export const wishlists = pgTable("wishlists", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: uuid("team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull(), // User ID from auth
  brand: varchar("brand", { length: 255 }),
  item: text("item"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  unique("wishlists_team_user_unique").on(table.teamId, table.userId)
]);

export const insertWishlistSchema = createInsertSchema(wishlists).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertWishlist = z.infer<typeof insertWishlistSchema>;
export type Wishlist = typeof wishlists.$inferSelect;

// Secret Santa assignments - who is gifting to whom
export const assignments = pgTable("assignments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: uuid("team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
  giverId: varchar("giver_id").notNull(), // User ID who gives the gift
  receiverId: varchar("receiver_id").notNull(), // User ID who receives the gift
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAssignmentSchema = createInsertSchema(assignments).omit({ id: true, createdAt: true });
export type InsertAssignment = z.infer<typeof insertAssignmentSchema>;
export type Assignment = typeof assignments.$inferSelect;
