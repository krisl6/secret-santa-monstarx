import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new team
export const create = mutation({
  args: {
    name: v.string(),
    ownerId: v.string(),
  },
  handler: async (ctx, args) => {
    const teamId = await ctx.db.insert("teams", {
      name: args.name,
      ownerId: args.ownerId,
      createdAt: Date.now(),
    });
    return teamId;
  },
});

// Get team by ID
export const get = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.teamId);
  },
});

// Get all teams for a user
export const getUserTeams = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const members = await ctx.db
      .query("teamMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const teams = await Promise.all(
      members.map(async (member) => {
        const team = await ctx.db.get(member.teamId);
        return team ? { ...team, _id: member.teamId } : null;
      })
    );

    return teams.filter((team): team is NonNullable<typeof team> => team !== null);
  },
});

