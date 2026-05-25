"use client";

import React from "react";
import { useOrganization } from "@clerk/nextjs";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Receipt,
  Plus,
  Lock,
  Check,
  CalendarDays,
  BadgeAlert,
  HelpCircle,
  FolderSync,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { invoiceSchema } from "./schema";
import { Id } from "@/convex/_generated/dataModel";

export default function InvoicesPage() {
  const { organization, membership } = useOrganization();
  const { isAuthenticated } = useConvexAuth();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [now, setNow] = React.useState<number>(0);
  React.useEffect(() => {
    const timer = setTimeout(() => setNow(Date.now()), 0);
    return () => clearTimeout(timer);
  }, []);

  // Form states
  const [customerName, setCustomerName] = React.useState("");
  const [customerEmail, setCustomerEmail] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [dueDateDays, setDueDateDays] = React.useState("30");
  const [status, setStatus] = React.useState<"draft" | "sent" | "paid">("sent");
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Convex hooks
  const invoices = useQuery(
    api.invoices.listInvoices,
    isAuthenticated && organization?.id ? { orgId: organization.id } : "skip"
  );

  const createInvoice = useMutation(api.invoices.createInvoice);
  const updateInvoiceStatus = useMutation(api.invoices.updateInvoiceStatus);

  if (!organization) return null;

  const userRole = membership?.role ?? "";
  const isViewer = userRole.replace(/^org:/, "") === "viewer";

  const isLoading = invoices === undefined;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewer) return;

    const result = invoiceSchema.safeParse({
      customerName,
      customerEmail,
      amount,
      dueDateDays,
      status,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        fieldErrors[path] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    const data = result.data;
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    const dueTime = Date.now() + data.dueDateDays * 24 * 60 * 60 * 1000;

    try {
      await createInvoice({
        orgId: organization.id,
        invoiceNumber,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        amount: data.amount,
        dueDate: dueTime,
        status: data.status,
      });

      // Reset form
      setCustomerName("");
      setCustomerEmail("");
      setAmount("");
      setErrors({});
      setIsDialogOpen(false);
    } catch (err) {
      console.error("Failed to create invoice:", err);
    }
  };

  const handleTogglePaid = async (id: Id<"invoices">, currentStatus: string) => {
    if (isViewer) return;
    const nextStatus = currentStatus === "paid" ? "sent" : "paid";
    try {
      await updateInvoiceStatus({
        orgId: organization.id,
        id,
        status: nextStatus,
      });
    } catch (err) {
      console.error("Toggle paid status failed:", err);
    }
  };

  const handleExportCSV = () => {
    if (!invoices || invoices.length === 0) return;
    
    // CSV Header
    const headers = ["Invoice Number", "Client Company", "Billing Email", "Due Date", "Status", "Amount"];
    
    // CSV Rows
    const rows = invoices.map((inv) => [
      inv.invoiceNumber,
      `"${inv.customerName.replace(/"/g, '""')}"`,
      `"${inv.customerEmail.replace(/"/g, '""')}"`,
      new Date(inv.dueDate).toLocaleDateString(),
      inv.status,
      inv.amount
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `billing_invoices_${organization.name.toLowerCase().replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-2xl font-bold tracking-tight">Sales Invoices</h1>
            {isViewer && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-500 text-[10px] font-bold border border-amber-500/10">
                <Lock className="h-3 w-3" />
                Read-Only (Viewer)
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Issue bills, track payment timelines, and run collections for {organization.name}.
          </p>
        </div>

        {/* Invoice Creation Trigger */}
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setErrors({});
          }
        }}>
          <DialogTrigger asChild>
            <Button
              disabled={isViewer}
              className="bg-primary hover:brightness-110 text-primary-foreground font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-primary/10"
            >
              <Plus className="h-4.5 w-4.5" />
              New Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-2xl">
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Issue Client Invoice</DialogTitle>
                <DialogDescription>
                  Generate a new QuickBooks-style item invoice for B2B billing.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">

                {/* Customer Details */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="customerName">Client Company Name</Label>
                  <Input
                    id="customerName"
                    placeholder="e.g. Stark Industries"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />
                  {errors.customerName && (
                    <span className="text-[10px] text-rose-500 font-semibold mt-0.5 animate-in fade-in duration-200">
                      {errors.customerName}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="customerEmail">Client Billing Email</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    placeholder="billing@stark.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    required
                  />
                  {errors.customerEmail && (
                    <span className="text-[10px] text-rose-500 font-semibold mt-0.5 animate-in fade-in duration-200">
                      {errors.customerEmail}
                    </span>
                  )}
                </div>

                {/* Amount and Terms */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="amount">Total Amount ($)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="1200.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                    {errors.amount && (
                      <span className="text-[10px] text-rose-500 font-semibold mt-0.5 animate-in fade-in duration-200">
                        {errors.amount}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="terms">Payment Terms</Label>
                    <Select value={dueDateDays} onValueChange={setDueDateDays}>
                      <SelectTrigger id="terms">
                        <SelectValue placeholder="Due terms" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">Net 15 Days</SelectItem>
                        <SelectItem value="30">Net 30 Days</SelectItem>
                        <SelectItem value="45">Net 45 Days</SelectItem>
                        <SelectItem value="60">Net 60 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Invoice Status */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="status">Initial Status</Label>
                  <Select value={status} onValueChange={(val: "draft" | "sent" | "paid") => setStatus(val)}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sent">Sent (Unpaid, Pending)</SelectItem>
                      <SelectItem value="draft">Draft (Unsent)</SelectItem>
                      <SelectItem value="paid">Paid (Cleared Immediately)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  className="bg-primary hover:brightness-110 text-primary-foreground font-semibold rounded-xl w-full sm:w-auto"
                >
                  Generate Invoice
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary / Actions Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-2xl bg-background/50 backdrop-blur-sm">
        <div className="text-xs text-muted-foreground font-semibold">
          Showing {invoices?.length ?? 0} invoice records
        </div>
        <Button 
          variant="outline"
          size="sm"
          onClick={handleExportCSV}
          disabled={!invoices || invoices.length === 0}
          className="text-[11px] h-8 rounded-lg font-semibold flex items-center gap-1.5 border-neutral-200 dark:border-neutral-800"
        >
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </Button>
      </div>

      {/* Invoice Grid Feed */}
      <Card className="rounded-2xl border-neutral-200 dark:border-neutral-800/80 overflow-hidden">
        {isLoading ? (
          <div className="text-center py-12 text-xs text-muted-foreground animate-pulse">
            Compiling client ledger accounts...
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-16 flex flex-col items-center justify-center gap-2">
            <Receipt className="h-10 w-10 text-neutral-400" />
            <h3 className="font-bold text-sm">No Invoices Found</h3>
            <p className="text-xs text-muted-foreground max-w-xs">
              No bills recorded for this tenant organization. {isViewer ? "" : "Generate an invoice to start billing."}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/20">
              <TableRow>
                <TableHead>Invoice Number</TableHead>
                <TableHead>Client Company</TableHead>
                <TableHead>Billing Email</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                {!isViewer && <TableHead className="w-28 text-center">Action</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => {
                const isOverdue = inv.status !== "paid" && inv.dueDate < now;
                return (
                  <TableRow key={inv._id} className="hover:bg-muted/20">
                    <TableCell className="font-bold text-foreground">{inv.invoiceNumber}</TableCell>
                    <TableCell className="font-semibold">{inv.customerName}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{inv.customerEmail}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {new Date(inv.dueDate).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${inv.status === "paid"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : isOverdue
                          ? "bg-rose-500/10 text-rose-600"
                          : "bg-amber-500/10 text-amber-600"
                        }`}>
                        {inv.status === "paid" ? (
                          <Check className="h-3 w-3" />
                        ) : isOverdue ? (
                          <BadgeAlert className="h-3 w-3" />
                        ) : (
                          <HelpCircle className="h-3 w-3" />
                        )}
                        {inv.status === "paid" ? "Paid" : isOverdue ? "Overdue" : "Unpaid"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-extrabold text-foreground">
                      ${inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    {!isViewer && (
                      <TableCell className="text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTogglePaid(inv._id, inv.status)}
                          className={`text-[10px] font-bold rounded-lg px-2 py-1 h-6 transition-all ${inv.status === "paid"
                            ? "border-amber-200 text-amber-600 hover:bg-amber-500/5 dark:border-amber-900/50"
                            : "border-primary/20 text-primary bg-primary/5 hover:bg-primary/10 dark:border-primary/30"
                            }`}
                        >
                          <FolderSync className="h-3 w-3 shrink-0 mr-1" />
                          {inv.status === "paid" ? "Mark Unpaid" : "Mark Paid"}
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

    </div>
  );
}
