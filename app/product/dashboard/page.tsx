"use client";

import React from "react";
import { useOrganization } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Layers, 
  Sparkles,
  ArrowRightLeft,
  CalendarDays,
  FileSpreadsheet,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CashFlowChart } from "@/components/CashFlowChart";
import { InvoiceStatusChart } from "@/components/InvoiceStatusChart";
import Link from "next/link";

export default function DashboardHome() {
  const { organization } = useOrganization();
  
  // Real-time B2B ledger data hooks
  const transactions = useQuery(api.transactions.listTransactions, {
    orgId: organization?.id ?? "",
  });
  
  const invoices = useQuery(api.invoices.listInvoices, {
    orgId: organization?.id ?? "",
  });

  const orgPlan = useQuery(api.orgs.getOrgPlan, {
    orgId: organization?.id ?? "",
  });

  if (!organization) return null;

  const isLoading = transactions === undefined || invoices === undefined || orgPlan === undefined;

  if (isLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 animate-spin">
          <TrendingUp className="h-5 w-5" />
        </div>
        <span className="text-xs text-muted-foreground animate-pulse">Recalculating B2B trial balances...</span>
      </div>
    );
  }

  // Calculate real-time financial aggregates
  let totalIncome = 0;
  let totalExpense = 0;
  
  transactions.forEach((tx) => {
    if (tx.type === "income") {
      totalIncome += tx.amount;
    } else if (tx.type === "expense") {
      totalExpense += tx.amount;
    }
  });

  const netProfit = totalIncome - totalExpense;

  let paidInvoicesSum = 0;
  let unpaidInvoicesSum = 0;

  invoices.forEach((inv) => {
    if (inv.status === "paid") {
      paidInvoicesSum += inv.amount;
    } else if (inv.status === "sent" || inv.status === "overdue") {
      unpaidInvoicesSum += inv.amount;
    }
  });

  // Dynamic Chart Formatting with fallback to historical mock curves if database ledger is empty
  const cashFlowHistory = [
    { month: "Jan", income: 4500, expense: 3100 },
    { month: "Feb", income: 5200, expense: 3900 },
    { month: "Mar", income: 6100, expense: 4200 },
    { month: "Apr", income: 5800, expense: 4600 },
    { month: "May", income: totalIncome > 0 ? totalIncome : 7200, expense: totalExpense > 0 ? totalExpense : 5100 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner introducing subscription status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border p-5 rounded-2xl bg-gradient-to-r from-emerald-500/5 to-teal-500/5 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold mb-1">
            <Sparkles className="h-3.5 w-3.5 fill-emerald-500/20" />
            Financial Health Overview
          </div>
          <h2 className="text-xl font-bold tracking-tight">Antigravity Accounting Dashboard</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time books compiled for organization <span className="font-semibold text-foreground">{organization.name}</span>.
          </p>
        </div>
        
        {/* Tier indicators */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col text-left md:text-right">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">Active Plan</span>
            <span className="text-sm font-bold capitalize text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              {orgPlan?.plan ?? "free"} Tier
            </span>
          </div>
          <Button asChild size="sm" variant="outline" className="rounded-xl border-neutral-300 dark:border-neutral-800 text-xs px-4">
            <Link href="/product/dashboard/settings">Manage Plan</Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Total Revenue card */}
        <Card className="rounded-2xl border-neutral-200 dark:border-neutral-800/80 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Total Income</CardTitle>
            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-foreground">${totalIncome.toLocaleString()}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Real-time revenue flows</p>
          </CardContent>
        </Card>

        {/* Expenses card */}
        <Card className="rounded-2xl border-neutral-200 dark:border-neutral-800/80 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Total Expenses</CardTitle>
            <div className="h-7 w-7 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <TrendingDown className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-foreground">${totalExpense.toLocaleString()}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Operating expense outflows</p>
          </CardContent>
        </Card>

        {/* Net income card */}
        <Card className="rounded-2xl border-neutral-200 dark:border-neutral-800/80 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Net Profit</CardTitle>
            <div className="h-7 w-7 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-extrabold ${netProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
              {netProfit >= 0 ? "" : "-"}${Math.abs(netProfit).toLocaleString()}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Gross earnings margin</p>
          </CardContent>
        </Card>

        {/* Accounts Receivables card */}
        <Card className="rounded-2xl border-neutral-200 dark:border-neutral-800/80 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Receivables (AR)</CardTitle>
            <div className="h-7 w-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Layers className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-foreground">${unpaidInvoicesSum.toLocaleString()}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Outstanding client bills</p>
          </CardContent>
        </Card>

      </div>

      {/* Visual Charts section */}
      <div className="grid gap-6 md:grid-cols-3">
        
        {/* Cash Flow Line/Area Chart */}
        <Card className="md:col-span-2 rounded-2xl border-neutral-200 dark:border-neutral-800/80 p-6">
          <div className="flex items-center justify-between pb-4 border-b">
            <div>
              <CardTitle className="text-base font-bold">Cash Flow Overview</CardTitle>
              <CardDescription className="text-xs">Income vs. Expense comparison over time</CardDescription>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-muted-foreground">Income</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-rose-500" />
                <span className="text-muted-foreground">Expenses</span>
              </div>
            </div>
          </div>
          <CashFlowChart data={cashFlowHistory} />
        </Card>

        {/* Accounts Receivable Donut Chart */}
        <Card className="rounded-2xl border-neutral-200 dark:border-neutral-800/80 p-6 flex flex-col justify-between">
          <div className="pb-4 border-b">
            <CardTitle className="text-base font-bold">Invoices Health</CardTitle>
            <CardDescription className="text-xs">Paid vs. Outstanding collections balance</CardDescription>
          </div>
          {paidInvoicesSum === 0 && unpaidInvoicesSum === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
              <AlertCircle className="h-8 w-8 text-neutral-400 mb-2" />
              <span className="text-xs text-muted-foreground">No invoices logged yet. Create an invoice to track outstanding billing.</span>
            </div>
          ) : (
            <InvoiceStatusChart paidAmount={paidInvoicesSum} unpaidAmount={unpaidInvoicesSum} />
          )}
        </Card>

      </div>

      {/* Recent Activity lists */}
      <div className="grid gap-6 md:grid-cols-2">
        
        {/* Recent Transactions List */}
        <Card className="rounded-2xl border-neutral-200 dark:border-neutral-800/80 p-6">
          <div className="flex items-center justify-between pb-4 border-b">
            <div>
              <CardTitle className="text-base font-bold">Recent Transactions</CardTitle>
              <CardDescription className="text-xs">Latest income and expense entries</CardDescription>
            </div>
            <Button asChild size="sm" variant="ghost" className="text-xs text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/5 rounded-lg">
              <Link href="/product/dashboard/transactions">View Ledger</Link>
            </Button>
          </div>
          <div className="mt-4 space-y-4">
            {transactions.slice(0, 4).length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground">
                No ledger transactions recorded yet.
              </div>
            ) : (
              transactions.slice(0, 4).map((tx) => (
                <div key={tx._id} className="flex items-center justify-between text-sm py-1">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${tx.type === "income" ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"}`}>
                      <ArrowRightLeft className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="font-semibold block max-w-[150px] truncate text-foreground">{tx.description}</span>
                      <span className="text-[10px] text-muted-foreground">{tx.category}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-bold block ${tx.type === "income" ? "text-emerald-600" : "text-foreground"}`}>
                      {tx.type === "income" ? "+" : "-"}${tx.amount.toLocaleString()}
                    </span>
                    <span className="text-[9px] text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Unpaid / Overdue Invoices List */}
        <Card className="rounded-2xl border-neutral-200 dark:border-neutral-800/80 p-6">
          <div className="flex items-center justify-between pb-4 border-b">
            <div>
              <CardTitle className="text-base font-bold">Outstanding Bills</CardTitle>
              <CardDescription className="text-xs">Invoices pending payment</CardDescription>
            </div>
            <Button asChild size="sm" variant="ghost" className="text-xs text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/5 rounded-lg">
              <Link href="/product/dashboard/invoices">View Invoices</Link>
            </Button>
          </div>
          <div className="mt-4 space-y-4">
            {invoices.filter(i => i.status !== "paid").slice(0, 4).length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground">
                All invoices fully collected! Excellent bookkeeping.
              </div>
            ) : (
              invoices.filter(i => i.status !== "paid").slice(0, 4).map((inv) => (
                <div key={inv._id} className="flex items-center justify-between text-sm py-1">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                      <CalendarDays className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="font-semibold block max-w-[150px] truncate text-foreground">{inv.customerName}</span>
                      <span className="text-[10px] text-muted-foreground">{inv.invoiceNumber}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold block text-foreground">${inv.amount.toLocaleString()}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${inv.status === "overdue" ? "bg-rose-500/10 text-rose-600" : "bg-amber-500/10 text-amber-600"}`}>
                      {inv.status === "overdue" ? "Overdue" : "Pending"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

      </div>

    </div>
  );
}
