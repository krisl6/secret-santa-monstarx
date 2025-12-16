import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Upsert wishlist
export const upsert = mutation({
  args: {
    teamId: v.id("teams"),
    userId: v.string(),
    brand: v.optional(v.string()),
    item: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if wishlist exists
    const existing = await ctx.db
      .query("wishlists")
      .withIndex("by_team_user", (q) =>
        q.eq("teamId", args.teamId).eq("userId", args.userId)
      )
      .first();

    if (existing) {
      // Update existing
      await ctx.db.patch(existing._id, {
        brand: args.brand,
        item: args.item,
        updatedAt: Date.now(),
      });
      return existing._id;
    } else {
      // Create new
      const wishlistId = await ctx.db.insert("wishlists", {
        teamId: args.teamId,
        userId: args.userId,
        brand: args.brand,
        item: args.item,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      return wishlistId;
    }
  },
});

// Get wishlist for a user in a team
export const get = query({
  args: {
    teamId: v.id("teams"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("wishlists")
      .withIndex("by_team_user", (q) =>
        q.eq("teamId", args.teamId).eq("userId", args.userId)
      )
      .first();
  },
});

// Get all wishlists for a team
export const getByTeam = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("wishlists")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();
  },
});

