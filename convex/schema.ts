import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table (for Replit Auth)
  users: defineTable({
    id: v.string(),
    email: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    profileImageUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_id", ["id"])
    .index("by_email", ["email"]),

  // Sessions table (for Replit Auth)
  sessions: defineTable({
    sid: v.string(),
    sess: v.any(),
    expire: v.number(),
  })
    .index("by_sid", ["sid"])
    .index("by_expire", ["expire"]),

  // Teams table
  teams: defineTable({
    name: v.string(),
    ownerId: v.string(),
    createdAt: v.number(),
  })
    .index("by_owner", ["ownerId"]),

  // Team members
  teamMembers: defineTable({
    teamId: v.id("teams"),
    userId: v.string(),
    joinedAt: v.number(),
  })
    .index("by_team", ["teamId"])
    .index("by_user", ["userId"])
    .index("by_team_user", ["teamId", "userId"]),

  // Wishlists
  wishlists: defineTable({
    teamId: v.id("teams"),
    userId: v.string(),
    brand: v.optional(v.string()),
    item: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_team", ["teamId"])
    .index("by_user", ["userId"])
    .index("by_team_user", ["teamId", "userId"]),

  // Assignments
  assignments: defineTable({
    teamId: v.id("teams"),
    giverId: v.string(),
    receiverId: v.string(),
    createdAt: v.number(),
  })
    .index("by_team", ["teamId"])
    .index("by_giver", ["giverId"])
    .index("by_team_giver", ["teamId", "giverId"]),
});

