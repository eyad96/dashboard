import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { verifyOrgAccess } from "./transactions";

/**
 * Retrieves the cached subscription plan and seat details for an organization.
 * Fallback to standard "free" plan if the organization hasn't been cached yet.
 */
export const getOrgPlan = query({
  args: {
    orgId: v.string(),
  },
  handler: async (ctx, args) => {
    await verifyOrgAccess(ctx, args.orgId, ["admin", "accountant", "viewer"]);

    const cached = await ctx.db
      .query("organizations")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .unique();

    if (cached) {
      return cached;
    }

    // Default to the FREE tier with 1 seat
    return {
      orgId: args.orgId,
      plan: "free" as const,
      seats: 1,
    };
  },
});

/**
 * Updates or creates the organization's cached subscription tier.
 * Restricted to Admins.
 */
export const updateOrgPlan = mutation({
  args: {
    orgId: v.string(),
    plan: v.union(
      v.literal("free"),
      v.literal("pro"),
      v.literal("business")
    ),
    stripeSubscriptionId: v.optional(v.string()),
    seats: v.number(),
  },
  handler: async (ctx, args) => {
    // Only Admin can configure or sync plans
    await verifyOrgAccess(ctx, args.orgId, ["admin"]);

    const existing = await ctx.db
      .query("organizations")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        plan: args.plan,
        stripeSubscriptionId: args.stripeSubscriptionId,
        seats: args.seats,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("organizations", {
        orgId: args.orgId,
        plan: args.plan,
        stripeSubscriptionId: args.stripeSubscriptionId,
        seats: args.seats,
      });
    }
  },
});
