import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create assignments (replaces all existing ones for the team)
export const create = mutation({
  args: {
    teamId: v.id("teams"),
    assignments: v.array(
      v.object({
        giverId: v.string(),
        receiverId: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Clear existing assignments
    const existing = await ctx.db
      .query("assignments")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();

    for (const assignment of existing) {
      await ctx.db.delete(assignment._id);
    }

    // Create new assignments
    const assignmentIds: any[] = [];
    for (const assignment of args.assignments) {
      const id = await ctx.db.insert("assignments", {
        teamId: args.teamId,
        giverId: assignment.giverId,
        receiverId: assignment.receiverId,
        createdAt: Date.now(),
      });
      assignmentIds.push(id);
    }

    return assignmentIds;
  },
});

// Get assignment for a giver
export const get = query({
  args: {
    teamId: v.id("teams"),
    giverId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("assignments")
      .withIndex("by_team_giver", (q) =>
        q.eq("teamId", args.teamId).eq("giverId", args.giverId)
      )
      .first();
  },
});

// Check if team has assignments
export const hasAssignments = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    const assignment = await ctx.db
      .query("assignments")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .first();
    return !!assignment;
  },
});

