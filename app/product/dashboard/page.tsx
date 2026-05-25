"use client";

import React, { useEffect, useContext } from "react";
import { useOrganization } from "@clerk/nextjs";
import { useQuery, useConvexAuth, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { DeveloperModeContext } from "@/components/DeveloperModeContext";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Layers, 
  Sparkles,
  ArrowRightLeft,
  CalendarDays,
  AlertCircle,
  Terminal,
  Database,
  Cpu,
  RefreshCw,
  Trash2,
  ChevronDown,
  ChevronUp,
  Server,
  Activity,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CashFlowChart } from "@/components/CashFlowChart";
import { InvoiceStatusChart } from "@/components/InvoiceStatusChart";
import Link from "next/link";

const NOOP_LOG = () => {};

export default function DashboardHome() {
  const { organization } = useOrganization();
  const { isAuthenticated } = useConvexAuth();
  
  // DevMode hook
  const devContext = useContext(DeveloperModeContext);
  const isDevMode = devContext?.isDevMode ?? false;
  const addLog = devContext?.addLog ?? NOOP_LOG;

  // Log active viewport mounts
  useEffect(() => {
    addLog("query", "DashboardHome view mounted. Fetching listTransactions, listInvoices, getOrgPlan...");
  }, [addLog]);

  // Collapsible Developer Control Center State
  const [isSandboxOpen, setIsSandboxOpen] = React.useState(true);
  const [seeding, setSeeding] = React.useState(false);
  const [wiping, setWiping] = React.useState(false);
  const [feedbackMsg, setFeedbackMsg] = React.useState<string | null>(null);

  // Mutations
  const seedMock = useMutation(api.seeder.seedMockData);
  const clearMock = useMutation(api.seeder.clearMockData);

  // Real-time B2B ledger data hooks
  const transactions = useQuery(
    api.transactions.listTransactions,
    isAuthenticated && organization?.id ? { orgId: organization.id } : "skip"
  );
  
  const invoices = useQuery(
    api.invoices.listInvoices,
    isAuthenticated && organization?.id ? { orgId: organization.id } : "skip"
  );

  const orgPlan = useQuery(
    api.orgs.getOrgPlan,
    isAuthenticated && organization?.id ? { orgId: organization.id } : "skip"
  );

  if (!organization) return null;

  const isLoading = transactions === undefined || invoices === undefined || orgPlan === undefined;

  if (isLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary animate-spin">
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

  const handleSeed = async () => {
    setSeeding(true);
    setFeedbackMsg(null);
    try {
      addLog("mutation", "seedMockData mutation triggered from B2B home dashboard");
      const res = await seedMock({ orgId: organization.id });
      setFeedbackMsg(`Seeded ${res.seededCount} records!`);
      addLog("info", `Successfully populated pristine financial ledger segments for ${organization.name}`);
      setTimeout(() => setFeedbackMsg(null), 5000);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setFeedbackMsg(`Seeding failed: ${errMsg}`);
      addLog("error", `Seed failed: ${errMsg}`);
    } finally {
      setSeeding(false);
    }
  };

  const handleClear = async () => {
    setWiping(true);
    setFeedbackMsg(null);
    try {
      addLog("mutation", "clearMockData mutation triggered from B2B home dashboard");
      await clearMock({ orgId: organization.id });
      setFeedbackMsg("Ledger records successfully wiped clean.");
      addLog("info", `Wiped ledger records, organization tier reverted to free for ${organization.name}`);
      setTimeout(() => setFeedbackMsg(null), 5000);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setFeedbackMsg(`Wipe failed: ${errMsg}`);
      addLog("error", `Wipe failed: ${errMsg}`);
    } finally {
      setWiping(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Premium Developer Sandbox & Control Center */}
      {!isDevMode && (
        <div className="border rounded-2xl bg-zinc-950 dark:bg-black/90 text-zinc-100 overflow-hidden shadow-xl shadow-indigo-500/5 border-indigo-500/20 transition-all duration-300 hover:border-indigo-500/40">
          
          {/* Console Header Bar */}
          <div 
            onClick={() => setIsSandboxOpen(!isSandboxOpen)}
            className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-zinc-900 to-zinc-950 border-b border-indigo-500/10 cursor-pointer select-none group"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-400 group-hover:scale-105 transition-transform">
                <Terminal className="h-3.5 w-3.5" />
              </div>
              <span className="text-[11px] font-mono tracking-wider text-indigo-400 uppercase font-bold flex items-center gap-2">
                B2B Developer Control Center
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </span>
            </div>
            
            <div className="flex items-center gap-4 text-xs font-mono text-zinc-500">
              <span className="hidden sm:inline text-[10px]">HOST: dev:animated-deer-35</span>
              {isSandboxOpen ? (
                <ChevronUp className="h-4 w-4 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
              ) : (
                <ChevronDown className="h-4 w-4 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
              )}
            </div>
          </div>

          {/* Collapsible Console Content */}
          {isSandboxOpen && (
            <div className="p-5 space-y-5 bg-zinc-950/80 animate-in slide-in-from-top-1 duration-200">
              
              {/* Upper Grid: Statuses and metrics */}
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 text-xs font-mono">
                
                {/* Database status card */}
                <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800/80 flex flex-col justify-between gap-1">
                  <span className="text-zinc-500 text-[10px] uppercase font-bold flex items-center gap-1">
                    <Database className="h-3 w-3 text-indigo-400" /> Convex Cloud
                  </span>
                  <span className="text-zinc-200 font-semibold truncate mt-1">dev:animated-deer-35</span>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1 font-semibold">
                    <Server className="h-3 w-3" /> Live Serverless Sync
                  </span>
                </div>

                {/* B2B identity status card */}
                <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800/80 flex flex-col justify-between gap-1">
                  <span className="text-zinc-500 text-[10px] uppercase font-bold flex items-center gap-1">
                    <Cpu className="h-3 w-3 text-indigo-400" /> B2B Tenant Sandbox
                  </span>
                  <span className="text-zinc-200 font-semibold truncate mt-1">Tenant: {organization.id}</span>
                  <span className="text-[10px] text-indigo-400 flex items-center gap-1 mt-1 font-semibold">
                    <Activity className="h-3 w-3" /> Isolation Enforced
                  </span>
                </div>

                {/* RBAC Role status card */}
                <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800/80 flex flex-col justify-between gap-1">
                  <span className="text-zinc-500 text-[10px] uppercase font-bold flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-indigo-400" /> Access Permissions
                  </span>
                  <span className="text-zinc-200 font-semibold mt-1">Simulated Role: Admin</span>
                  <span className="text-[10px] text-amber-400 flex items-center gap-1 mt-1 font-semibold">
                    <CheckCircle2 className="h-3 w-3" /> Full Ledger Access
                  </span>
                </div>

              </div>

              {/* Middle bar: Feedback Alert Message */}
              {feedbackMsg && (
                <div className="px-4 py-2.5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 text-indigo-300 font-mono text-[11px] flex items-center gap-2 animate-in fade-in duration-200">
                  <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span>{feedbackMsg}</span>
                </div>
              )}

              {/* Lower controls section */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-zinc-900">
                
                <div className="flex flex-col gap-0.5 text-left w-full sm:w-auto">
                  <span className="text-[11px] font-mono text-zinc-300 font-bold">Ledger Sandbox Simulation</span>
                  <span className="text-[10px] text-zinc-500 font-mono">Seed pristine mock transactions and invoices to test visual aggregates.</span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  
                  {/* Seed button */}
                  <Button 
                    onClick={handleSeed}
                    disabled={seeding || wiping}
                    className="rounded-xl px-4 text-xs font-mono font-bold bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white border-0 shadow-md shadow-indigo-500/10 shrink-0"
                  >
                    {seeding ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                        Seeding...
                      </>
                    ) : (
                      <>
                        <Cpu className="h-3.5 w-3.5 mr-1.5" />
                        Populate Sandbox Ledger
                      </>
                    )}
                  </Button>

                  {/* Wipe button */}
                  <Button 
                    onClick={handleClear}
                    disabled={seeding || wiping}
                    variant="outline"
                    className="rounded-xl px-4 text-xs font-mono font-bold border-zinc-800 text-zinc-400 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20 bg-zinc-900 shrink-0"
                  >
                    {wiping ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                        Wiping...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                        Wipe Sandbox
                      </>
                    )}
                  </Button>

                </div>

              </div>

            </div>
          )}

        </div>
      )}

      {/* Top Banner introducing subscription status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border p-5 rounded-2xl bg-gradient-to-r from-primary/5 to-accent/20 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-primary font-bold mb-1">
            <Sparkles className="h-3.5 w-3.5 fill-primary/20" />
            Financial Health Overview
          </div>
          <h2 className="text-xl font-bold tracking-tight">ECompany Accounting Dashboard</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time books compiled for organization <span className="font-semibold text-foreground">{organization.name}</span>.
          </p>
        </div>
        
        {/* Tier indicators */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col text-left md:text-right">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">Active Plan</span>
            <span className="text-sm font-bold capitalize text-primary flex items-center gap-1">
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
            <Button asChild size="sm" variant="ghost" className="text-xs text-primary hover:text-primary/80 hover:bg-primary/5 rounded-lg">
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
            <Button asChild size="sm" variant="ghost" className="text-xs text-primary hover:text-primary/80 hover:bg-primary/5 rounded-lg">
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
