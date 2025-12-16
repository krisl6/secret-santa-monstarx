import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get user by ID
export const get = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_id", (q) => q.eq("id", args.id))
      .first();
  },
});

// Upsert user
export const upsert = mutation({
  args: {
    id: v.string(),
    email: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    profileImageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_id", (q) => q.eq("id", args.id))
      .first();

    if (existing) {
      // Update existing
      await ctx.db.patch(existing._id, {
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        profileImageUrl: args.profileImageUrl,
        updatedAt: Date.now(),
      });
      return existing._id;
    } else {
      // Create new
      const userId = await ctx.db.insert("users", {
        id: args.id,
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        profileImageUrl: args.profileImageUrl,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      return userId;
    }
  },
});

