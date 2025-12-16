import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get session by sid
export const get = query({
  args: { sid: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sessions")
      .withIndex("by_sid", (q) => q.eq("sid", args.sid))
      .first();
  },
});

// Set session
export const set = mutation({
  args: {
    sid: v.string(),
    sess: v.any(),
    expire: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("sessions")
      .withIndex("by_sid", (q) => q.eq("sid", args.sid))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        sess: args.sess,
        expire: args.expire,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("sessions", {
        sid: args.sid,
        sess: args.sess,
        expire: args.expire,
      });
    }
  },
});

// Destroy session
export const destroy = mutation({
  args: { sid: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_sid", (q) => q.eq("sid", args.sid))
      .first();

    if (session) {
      await ctx.db.delete(session._id);
    }
  },
});

// Clear expired sessions
export const clearExpired = mutation({
  handler: async (ctx) => {
    const now = Date.now();
    const expired = await ctx.db
      .query("sessions")
      .withIndex("by_expire", (q) => q.lt("expire", now))
      .collect();

    for (const session of expired) {
      await ctx.db.delete(session._id);
    }
  },
});

