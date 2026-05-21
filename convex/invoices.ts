import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { verifyOrgAccess } from "./transactions";

/**
 * Lists invoicing entries for an organization.
 * Read-only access: allowed for Admin, Accountant, and Viewer.
 */
export const listInvoices = query({
  args: {
    orgId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await verifyOrgAccess(ctx, args.orgId, ["admin", "accountant", "viewer"]);

    const limit = args.limit ?? 200;

    return await ctx.db
      .query("invoices")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .order("desc")
      .take(limit);
  },
});

/**
 * Creates a new B2B client invoice.
 * Write access: restricted to Admin and Accountant roles.
 */
export const createInvoice = mutation({
  args: {
    orgId: v.string(),
    invoiceNumber: v.string(),
    customerName: v.string(),
    customerEmail: v.string(),
    amount: v.number(),
    dueDate: v.number(),
    status: v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("paid"),
      v.literal("overdue")
    ),
  },
  handler: async (ctx, args) => {
    await verifyOrgAccess(ctx, args.orgId, ["admin", "accountant"]);

    return await ctx.db.insert("invoices", {
      orgId: args.orgId,
      invoiceNumber: args.invoiceNumber,
      customerName: args.customerName,
      customerEmail: args.customerEmail,
      amount: args.amount,
      dueDate: args.dueDate,
      status: args.status,
    });
  },
});

/**
 * Updates an invoice payment status.
 * Write access: restricted to Admin and Accountant roles.
 */
export const updateInvoiceStatus = mutation({
  args: {
    orgId: v.string(),
    id: v.id("invoices"),
    status: v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("paid"),
      v.literal("overdue")
    ),
  },
  handler: async (ctx, args) => {
    await verifyOrgAccess(ctx, args.orgId, ["admin", "accountant"]);

    const invoice = await ctx.db.get(args.id);
    if (!invoice || invoice.orgId !== args.orgId) {
      throw new Error("Invoice not found or unauthorized");
    }

    await ctx.db.patch(args.id, { status: args.status });
    return true;
  },
});
