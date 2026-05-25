import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { verifyOrgAccess } from "./transactions";

/**
 * Instantly seeds highly detailed mock ledger datasets for testing and development.
 * Clears prior records to avoid double-seeding, and forces tenant role verification.
 */
export const seedMockData = mutation({
  args: {
    orgId: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Authorise execution: Must be Admin or Accountant within the active tenant
    await verifyOrgAccess(ctx, args.orgId, ["admin", "accountant"]);

    // ── 2. CLEANUP EXISTING DATA ──────────────────────────────────────────
    const existingTx = await ctx.db
      .query("transactions")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect();

    for (const tx of existingTx) {
      await ctx.db.delete(tx._id);
    }

    const existingInvoices = await ctx.db
      .query("invoices")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect();

    for (const inv of existingInvoices) {
      await ctx.db.delete(inv._id);
    }

    // ── 3. SEED PREMIUM TRANSACTIONS ──────────────────────────────────────
    const mockTransactions = [
      {
        orgId: args.orgId,
        type: "income" as const,
        amount: 4500,
        category: "Consulting",
        description: "B2B Cloud Infrastructure Consulting Fee",
        date: Date.now() - 4 * 24 * 60 * 60 * 1000, // 4 days ago
        status: "completed" as const,
      },
      {
        orgId: args.orgId,
        type: "income" as const,
        amount: 1200,
        category: "Software",
        description: "Monthly Enterprise Software License subscriptions",
        date: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
        status: "completed" as const,
      },
      {
        orgId: args.orgId,
        type: "expense" as const,
        amount: 850,
        category: "Cloud Hosting",
        description: "Amazon Web Services (EC2 & RDS production databases)",
        date: Date.now() - 3 * 24 * 60 * 60 * 1000,
        status: "completed" as const,
      },
      {
        orgId: args.orgId,
        type: "expense" as const,
        amount: 320,
        category: "SaaS Utilities",
        description: "Github Enterprise organizational seats subscription",
        date: Date.now() - 1 * 24 * 60 * 60 * 1000,
        status: "completed" as const,
      },
      {
        orgId: args.orgId,
        type: "expense" as const,
        amount: 280,
        category: "Collaboration",
        description: "Slack Business communications workspace billing",
        date: Date.now() - 12 * 60 * 60 * 1000, // 12 hours ago
        status: "completed" as const,
      },
    ];

    for (const tx of mockTransactions) {
      await ctx.db.insert("transactions", tx);
    }

    // ── 4. SEED B2B CLIENT INVOICES ──────────────────────────────────────
    const mockInvoices = [
      {
        orgId: args.orgId,
        invoiceNumber: "INV-2026-001",
        customerName: "Stark Industries",
        customerEmail: "finance@starkindustries.com",
        amount: 4500,
        dueDate: Date.now() + 10 * 24 * 60 * 60 * 1000, // 10 days in future
        status: "paid" as const,
      },
      {
        orgId: args.orgId,
        invoiceNumber: "INV-2026-002",
        customerName: "Wayne Enterprises",
        customerEmail: "accounts@wayneenterprises.com",
        amount: 3200,
        dueDate: Date.now() + 15 * 24 * 60 * 60 * 1000,
        status: "sent" as const,
      },
      {
        orgId: args.orgId,
        invoiceNumber: "INV-2026-003",
        customerName: "Acme Corporation",
        customerEmail: "billing@acme.com",
        amount: 1500,
        dueDate: Date.now() + 5 * 24 * 60 * 60 * 1000,
        status: "sent" as const,
      },
      {
        orgId: args.orgId,
        invoiceNumber: "INV-2026-004",
        customerName: "Oscorp Technologies",
        customerEmail: "ledger@oscorp.com",
        amount: 2800,
        dueDate: Date.now() - 5 * 24 * 60 * 60 * 1000, // Overdue by 5 days
        status: "overdue" as const,
      },
    ];

    for (const inv of mockInvoices) {
      await ctx.db.insert("invoices", inv);
    }

    // ── 5. SEED/UPGRADE THE ACTIVE ORGANIZATION SUBSCRIPTION TIER ─────────
    const existingOrg = await ctx.db
      .query("organizations")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .unique();

    if (existingOrg) {
      await ctx.db.patch(existingOrg._id, {
        plan: "business",
        seats: 5,
      });
    } else {
      await ctx.db.insert("organizations", {
        orgId: args.orgId,
        plan: "business",
        seats: 5,
      });
    }

    return { success: true, seededCount: mockTransactions.length + mockInvoices.length };
  },
});

/**
 * Removes and deletes all transactions and client invoices associated with this B2B organization.
 * Allows starting with a clean slate inside the sandbox environment.
 */
export const clearMockData = mutation({
  args: {
    orgId: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Authorise execution
    await verifyOrgAccess(ctx, args.orgId, ["admin", "accountant"]);

    // 2. Delete all ledger transactions
    const existingTx = await ctx.db
      .query("transactions")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect();

    for (const tx of existingTx) {
      await ctx.db.delete(tx._id);
    }

    // 3. Delete all invoices
    const existingInvoices = await ctx.db
      .query("invoices")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect();

    for (const inv of existingInvoices) {
      await ctx.db.delete(inv._id);
    }

    // 4. Downgrade/Reset Org cache back to Free
    const existingOrg = await ctx.db
      .query("organizations")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .unique();

    if (existingOrg) {
      await ctx.db.patch(existingOrg._id, {
        plan: "free",
        seats: 1,
      });
    }

    return { success: true };
  },
});
