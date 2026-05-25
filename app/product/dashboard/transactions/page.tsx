"use client";

import React from "react";
import { useOrganization } from "@clerk/nextjs";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { 
  ArrowRightLeft, 
  Plus, 
  Trash2, 
  Lock, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle,
  Clock,
  Filter,
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

export default function TransactionsPage() {
  const { organization, membership } = useOrganization();
  const { isAuthenticated } = useConvexAuth();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  // Filter states
  const [typeFilter, setTypeFilter] = React.useState<"all" | "income" | "expense">("all");

  // Form states
  const [description, setDescription] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [type, setType] = React.useState<"income" | "expense">("expense");
  const [category, setCategory] = React.useState("Office Supplies");
  const [status, setStatus] = React.useState<"pending" | "completed">("completed");

  // Convex real-time hooks
  const transactions = useQuery(
    api.transactions.listTransactions,
    isAuthenticated && organization?.id ? { orgId: organization.id } : "skip"
  );

  const createTransaction = useMutation(api.transactions.createTransaction);
  const deleteTransaction = useMutation(api.transactions.deleteTransaction);

  if (!organization) return null;

  // Check user role via Clerk B2B
  const userRole = membership?.role ?? ""; 
  const isViewer = userRole.replace(/^org:/, "") === "viewer";

  const isLoading = transactions === undefined;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewer) return;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    try {
      await createTransaction({
        orgId: organization.id,
        description: description || "Manual entry",
        amount: numAmount,
        type,
        category,
        status,
        date: Date.now(),
      });
      // Clear form
      setDescription("");
      setAmount("");
      setIsDialogOpen(false);
    } catch (err) {
      console.error("Create transaction failed:", err);
    }
  };

  const handleDelete = async (id: Id<"transactions">) => {
    if (isViewer) return;
    try {
      await deleteTransaction({
        orgId: organization.id,
        id,
      });
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleExportCSV = () => {
    if (!filteredTransactions || filteredTransactions.length === 0) return;
    
    // CSV Header
    const headers = ["Description", "Category", "Type", "Date", "Status", "Amount"];
    
    // CSV Rows
    const rows = filteredTransactions.map((tx) => [
      `"${tx.description.replace(/"/g, '""')}"`,
      `"${tx.category.replace(/"/g, '""')}"`,
      tx.type,
      new Date(tx.date).toLocaleDateString(),
      tx.status,
      tx.amount
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ledger_transactions_${organization.name.toLowerCase().replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredTransactions = transactions?.filter((tx) => {
    if (typeFilter === "all") return true;
    return tx.type === typeFilter;
  }) ?? [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-2xl font-bold tracking-tight">Ledger Transactions</h1>
            {isViewer && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-500 text-[10px] font-bold border border-amber-500/10">
                <Lock className="h-3 w-3" />
                Read-Only (Viewer)
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Double-entry bookkeeping registry for {organization.name}.
          </p>
        </div>

        {/* Add Transaction Button & Dialog Modal */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              disabled={isViewer}
              className="bg-primary hover:brightness-110 text-white font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-primary/10"
            >
              <Plus className="h-4.5 w-4.5" />
              New Transaction
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-2xl">
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Record Transaction</DialogTitle>
                <DialogDescription>
                  Enter ledger details. Writes are signed and logged to Convex.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                
                {/* Description */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="desc">Description</Label>
                  <Input 
                    id="desc" 
                    placeholder="e.g. AWS Web Hosting" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                {/* Amount and Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="amount">Amount ($)</Label>
                    <Input 
                      id="amount" 
                      type="number"
                      step="0.01"
                      placeholder="120.00" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="type">Ledger Direction</Label>
                    <Select value={type} onValueChange={(val: "income" | "expense") => setType(val)}>
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="expense">Expense (Outflow)</SelectItem>
                        <SelectItem value="income">Income (Inflow)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Category and Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sales">Sales Revenue</SelectItem>
                        <SelectItem value="Software">Software & SaaS</SelectItem>
                        <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                        <SelectItem value="Travel & Meals">Travel & Meals</SelectItem>
                        <SelectItem value="Marketing">Marketing & Ads</SelectItem>
                        <SelectItem value="Rent & Lease">Rent & Lease</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="status">Clearance Status</Label>
                    <Select value={status} onValueChange={(val: "pending" | "completed") => setStatus(val)}>
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

              </div>
              <DialogFooter>
                <Button 
                  type="submit" 
                  className="bg-primary hover:brightness-110 text-white font-semibold rounded-xl w-full sm:w-auto"
                >
                  Post Transaction
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter and summary toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-2xl bg-background/50 backdrop-blur-sm">
        
        {/* Filters */}
        <div className="flex items-center gap-2 text-xs">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-muted-foreground mr-2 font-semibold">Ledger Filter:</span>
          <div className="flex border rounded-lg overflow-hidden">
            <button 
              onClick={() => setTypeFilter("all")}
              className={`px-3 py-1.5 font-medium transition-colors ${typeFilter === "all" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50"}`}
            >
              All Records
            </button>
            <button 
              onClick={() => setTypeFilter("income")}
              className={`px-3 py-1.5 border-l font-medium transition-colors ${typeFilter === "income" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50"}`}
            >
              Income Only
            </button>
            <button 
              onClick={() => setTypeFilter("expense")}
              className={`px-3 py-1.5 border-l font-medium transition-colors ${typeFilter === "expense" ? "bg-rose-500/10 text-rose-600" : "text-muted-foreground hover:bg-muted/50"}`}
            >
              Expenses Only
            </button>
          </div>
        </div>

        {/* Counter & Export */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="text-muted-foreground">
            Showing {filteredTransactions?.length ?? 0} transaction records
          </span>
          <Button 
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={!filteredTransactions || filteredTransactions.length === 0}
            className="text-[11px] h-8 rounded-lg font-semibold flex items-center gap-1.5 border-neutral-200 dark:border-neutral-800"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Ledger Table */}
      <Card className="rounded-2xl border-neutral-200 dark:border-neutral-800/80 overflow-hidden">
        {isLoading ? (
          <div className="text-center py-12 text-xs text-muted-foreground animate-pulse">
            Compiling ledgers...
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-16 flex flex-col items-center justify-center gap-2">
            <ArrowRightLeft className="h-10 w-10 text-neutral-400" />
            <h3 className="font-bold text-sm">Ledger Empty</h3>
            <p className="text-xs text-muted-foreground max-w-xs">
              No transactions match the selected filter. {isViewer ? "" : "Log a new transaction to start bookkeeping."}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/20">
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                {!isViewer && <TableHead className="w-10"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((tx) => (
                <TableRow key={tx._id} className="hover:bg-muted/20">
                  <TableCell>
                    <span className="font-semibold text-foreground block max-w-[200px] truncate">{tx.description}</span>
                  </TableCell>
                  <TableCell className="text-xs">{tx.category}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${tx.type === "income" ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"}`}>
                      {tx.type === "income" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {tx.type === "income" ? "Income" : "Expense"}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(tx.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${tx.status === "completed" ? "text-emerald-600" : "text-amber-500"}`}>
                      {tx.status === "completed" ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      {tx.status}
                    </span>
                  </TableCell>
                  <TableCell className={`text-right font-bold ${tx.type === "income" ? "text-emerald-600" : "text-foreground"}`}>
                    {tx.type === "income" ? "+" : "-"}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>
                  {!isViewer && (
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(tx._id)}
                        className="h-7 w-7 text-neutral-400 hover:text-rose-600 hover:bg-rose-500/5 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

    </div>
  );
}
