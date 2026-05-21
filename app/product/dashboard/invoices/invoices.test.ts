import { describe, it, expect } from "vitest";
import { invoiceSchema } from "./schema";

describe("Client Invoice Input Validation (Zod Schema)", () => {
  
  it("should successfully validate correct B2B invoice parameters", () => {
    const validData = {
      customerName: "Stark Industries",
      customerEmail: "billing@stark.com",
      amount: "1500.50",
      dueDateDays: "30",
      status: "sent",
    };

    const parsed = invoiceSchema.safeParse(validData);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.customerName).toBe("Stark Industries");
      expect(parsed.data.customerEmail).toBe("billing@stark.com");
      expect(parsed.data.amount).toBe(1500.50); // coerced to number
      expect(parsed.data.dueDateDays).toBe(30); // coerced to number
      expect(parsed.data.status).toBe("sent");
    }
  });

  it("should enforce non-empty client company names", () => {
    const invalidData = {
      customerName: "",
      customerEmail: "billing@stark.com",
      amount: "500",
      dueDateDays: "15",
      status: "paid",
    };

    const parsed = invoiceSchema.safeParse(invalidData);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const error = parsed.error.format();
      expect(error.customerName?._errors[0]).toBe("Client company name is required");
    }
  });

  it("should reject malformed email structures", () => {
    const invalidData = {
      customerName: "Wayne Enterprises",
      customerEmail: "invalid-email-string",
      amount: "100.00",
      dueDateDays: "45",
      status: "draft",
    };

    const parsed = invoiceSchema.safeParse(invalidData);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const error = parsed.error.format();
      expect(error.customerEmail?._errors[0]).toBe("Invalid email address");
    }
  });

  it("should reject zero or negative invoice amounts", () => {
    const invalidData = {
      customerName: "Oscorp Corp",
      customerEmail: "billing@oscorp.com",
      amount: "-150.00",
      dueDateDays: "30",
      status: "sent",
    };

    const parsed = invoiceSchema.safeParse(invalidData);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const error = parsed.error.format();
      expect(error.amount?._errors[0]).toBe("Amount must be a positive number");
    }
  });

  it("should reject invalid invoice statuses", () => {
    const invalidData = {
      customerName: "Stark Industries",
      customerEmail: "billing@stark.com",
      amount: "150.50",
      dueDateDays: "30",
      status: "overdue", // Schema only allows "draft", "sent", or "paid" for client input state
    };

    const parsed = invoiceSchema.safeParse(invalidData);
    expect(parsed.success).toBe(false);
  });
});
