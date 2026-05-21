import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Validates the caller's organization membership and role.
 * Clerk JWT tokens include custom claims for B2B tenancy.
 */
export async function verifyOrgAccess(
  ctx: any,
  orgId: string,
  allowedRoles?: string[]
) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthenticated: Please log in");
  }

  const org_id = identity.customClaims?.org_id as string | undefined;
  const org_role = identity.customClaims?.org_role as string | undefined;

  if (!org_id || org_id !== orgId) {
    throw new Error(`Unauthorized: Active organization does not match resource tenant`);
  }

  if (allowedRoles && allowedRoles.length > 0) {
    // Normalise role string to match either prefixed ('org:admin') or raw key ('admin')
    const matches = allowedRoles.some((role) => {
      const normalizedRole = role.replace(/^org:/, "");
      const normalizedUserRole = org_role ? org_role.replace(/^org:/, "") : "";
      return normalizedUserRole === normalizedRole;
    });

    if (!matches) {
      throw new Error(`Forbidden: Access requires role "${allowedRoles.join(" or ")}" (Active role: "${org_role || "none"}")`);
    }
  }

  return { identity, orgId, role: org_role };
}

/**
 * Lists accounting transactions for an organization.
 * Read-only access: allowed for Admin, Accountant, and Viewer.
 */
export const listTransactions = query({
  args: {
    orgId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Verify general organization access (Viewer, Accountant, and Admin allowed)
    await verifyOrgAccess(ctx, args.orgId, ["admin", "accountant", "viewer"]);

    const limit = args.limit ?? 200;

    return await ctx.db
      .query("transactions")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .order("desc")
      .take(limit);
  },
});

/**
 * Logs a new transaction inside the ledger.
 * Write access: restricted to Admin and Accountant roles.
 */
export const createTransaction = mutation({
  args: {
    orgId: v.string(),
    type: v.union(v.literal("income"), v.literal("expense")),
    amount: v.number(),
    category: v.string(),
    description: v.string(),
    date: v.number(),
    status: v.union(v.literal("pending"), v.literal("completed")),
  },
  handler: async (ctx, args) => {
    // Verify write permissions (Viewer is not allowed)
    await verifyOrgAccess(ctx, args.orgId, ["admin", "accountant"]);

    return await ctx.db.insert("transactions", {
      orgId: args.orgId,
      type: args.type,
      amount: args.amount,
      category: args.category,
      description: args.description,
      date: args.date,
      status: args.status,
    });
  },
});

/**
 * Removes a transaction entry from the ledger.
 * Write access: restricted to Admin and Accountant roles.
 */
export const deleteTransaction = mutation({
  args: {
    orgId: v.string(),
    id: v.id("transactions"),
  },
  handler: async (ctx, args) => {
    await verifyOrgAccess(ctx, args.orgId, ["admin", "accountant"]);

    const transaction = await ctx.db.get(args.id);
    if (!transaction || transaction.orgId !== args.orgId) {
      throw new Error("Transaction not found or unauthorized");
    }

    await ctx.db.delete(args.id);
    return true;
  },
});
