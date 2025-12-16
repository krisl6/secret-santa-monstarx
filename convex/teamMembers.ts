import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Add a team member
export const add = mutation({
  args: {
    teamId: v.id("teams"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if already a member
    const existing = await ctx.db
      .query("teamMembers")
      .withIndex("by_team_user", (q) =>
        q.eq("teamId", args.teamId).eq("userId", args.userId)
      )
      .first();

    if (existing) {
      return existing._id;
    }

    const memberId = await ctx.db.insert("teamMembers", {
      teamId: args.teamId,
      userId: args.userId,
      joinedAt: Date.now(),
    });
    return memberId;
  },
});

// Get all members of a team
export const getByTeam = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("teamMembers")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();
  },
});

// Check if user is a team member
export const isMember = query({
  args: {
    teamId: v.id("teams"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const member = await ctx.db
      .query("teamMembers")
      .withIndex("by_team_user", (q) =>
        q.eq("teamId", args.teamId).eq("userId", args.userId)
      )
      .first();
    return !!member;
  },
});

