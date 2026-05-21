import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  messages: defineTable({
    author: v.string(),
    body: v.string(),
  }),

  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  }).index("by_clerkId", ["clerkId"]),

  transactions: defineTable({
    orgId: v.string(),
    type: v.union(v.literal("income"), v.literal("expense")),
    amount: v.number(),
    category: v.string(),
    description: v.string(),
    date: v.number(),
    status: v.union(v.literal("pending"), v.literal("completed")),
  })
    .index("by_orgId", ["orgId"])
    .index("by_orgId_and_type", ["orgId", "type"]),

  invoices: defineTable({
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
  }).index("by_orgId", ["orgId"]),

  receipts: defineTable({
    orgId: v.string(),
    storageId: v.string(), // Convex file storage reference ID
    merchant: v.optional(v.string()),
    amount: v.optional(v.number()),
    date: v.optional(v.number()),
    status: v.union(
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
  }).index("by_orgId", ["orgId"]),

  organizations: defineTable({
    orgId: v.string(),
    plan: v.union(
      v.literal("free"),
      v.literal("pro"),
      v.literal("business")
    ),
    stripeSubscriptionId: v.optional(v.string()),
    seats: v.number(),
  }).index("by_orgId", ["orgId"]),
});

