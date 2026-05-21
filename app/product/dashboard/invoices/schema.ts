import { z } from "zod";

export const invoiceSchema = z.object({
  customerName: z.string().min(1, "Client company name is required"),
  customerEmail: z.string().email("Invalid email address"),
  amount: z.coerce.number().positive("Amount must be a positive number"),
  dueDateDays: z.coerce.number().positive(),
  status: z.enum(["draft", "sent", "paid"])
});

export type InvoiceInput = z.infer<typeof invoiceSchema>;
