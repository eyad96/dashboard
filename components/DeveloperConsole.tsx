"use client";

import React, { useState, useEffect, useRef } from "react";
import { useOrganization } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useDeveloperMode } from "./DeveloperModeContext";
import {
  Terminal as TerminalIcon,
  Database,
  Code as CodeIcon,
  Activity,
  Palette,
  Trash2,
  Plus,
  Folder,
  FileCode,
  Sparkles,
  Server,
  Layers,
  ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Id } from "@/convex/_generated/dataModel";

// Standalone code strings for Code Inspector (highly responsive client rendering)
const CODE_RESOURCES = {
  "convex/schema.ts": `import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
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
});`,
  "convex/transactions.ts": `import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { verifyOrgAccess } from "./transactions";

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
});`,
  "convex/seeder.ts": `import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { verifyOrgAccess } from "./transactions";

export const seedMockData = mutation({
  args: { orgId: v.string() },
  handler: async (ctx, args) => {
    await verifyOrgAccess(ctx, args.orgId, ["admin", "accountant"]);
    // Clears active transactions and invoices, then populates 9 clean records.
  }
});`,
  "components/DeveloperModeContext.tsx": `"use client";
import React, { createContext, useContext, useState } from "react";

export interface StyleOptions {
  accentTheme: "indigo" | "emerald" | "amber" | "rose" | "sapphire";
  borderRadius: "sharp" | "rounded" | "premium" | "extra";
  gridStyle: "clean" | "dots" | "grid";
}
// Manages global active split-screen IDE switches and visual canvas configurations...`
};

export function DeveloperConsole() {
  const { organization } = useOrganization();
  const { setIsDevMode, logs, addLog, clearLogs, styleOptions, setStyleOptions } = useDeveloperMode();

  const [activeTab, setActiveTab] = useState<"terminal" | "db" | "code" | "logs" | "styles">("terminal");

  // Terminal state
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalHistory, setTerminalHistory] = useState<Array<{ type: "input" | "output" | "error"; text: string }>>([
    { type: "output", text: "ECompany Books Developer Sandbox CLI Shell [v1.0.4]" },
    { type: "output", text: "Type 'help' to review simulated operations & cloud commands." },
  ]);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // DB Explorer state
  const [activeTable, setActiveTable] = useState<"transactions" | "invoices" | "receipts" | "organizations">("transactions");
  const [isInserting, setIsInserting] = useState(false);
  const [dbStatusMsg, setDbStatusMsg] = useState<string | null>(null);

  // Code Inspector state
  const [selectedFile, setSelectedFile] = useState<keyof typeof CODE_RESOURCES>("convex/schema.ts");

  // Convex integration
  const seedMock = useMutation(api.seeder.seedMockData);
  const clearMock = useMutation(api.seeder.clearMockData);
  const createTx = useMutation(api.transactions.createTransaction);
  const deleteTx = useMutation(api.transactions.deleteTransaction);
  const createInv = useMutation(api.invoices.createInvoice);
  const deleteInv = useMutation(api.invoices.deleteInvoice);
  const deleteRec = useMutation(api.receipts.deleteReceipt);
  const updateOrg = useMutation(api.orgs.updateOrgPlan);

  // DB queries reactively wired
  const listTx = useQuery(api.transactions.listTransactions, organization ? { orgId: organization.id } : "skip") || [];
  const listInv = useQuery(api.invoices.listInvoices, organization ? { orgId: organization.id } : "skip") || [];
  const listRec = useQuery(api.receipts.listReceipts, organization ? { orgId: organization.id } : "skip") || [];
  const listOrg = useQuery(api.orgs.getOrgPlan, organization ? { orgId: organization.id } : "skip");

  // Inline forms state
  const [txForm, setTxForm] = useState({
    description: "",
    amount: 150,
    type: "expense" as "income" | "expense",
    category: "Software",
    status: "completed" as "pending" | "completed"
  });

  const [invForm, setInvForm] = useState({
    customerName: "",
    customerEmail: "",
    amount: 1200,
    invoiceNumber: "INV-2026-005",
    status: "sent" as "draft" | "sent" | "paid" | "overdue"
  });

  // Scroll terminal to bottom
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalHistory]);

  if (!organization) return null;

  // Execute terminal commands
  const handleTerminalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = terminalInput.trim().toLowerCase();
    if (!cmd) return;

    setTerminalHistory(prev => [...prev, { type: "input", text: `eyad@animated-deer-35:~$ ${terminalInput}` }]);
    setTerminalInput("");
    addLog("info", `CLI Input: ${cmd}`);

    const parts = cmd.split(" ");
    const primaryCmd = parts[0];

    switch (primaryCmd) {
      case "help":
        setTerminalHistory(prev => [
          ...prev,
          { type: "output", text: "Available Sandbox Terminal Commands:" },
          { type: "output", text: "  seed            - Populate pristine mock ledgers in Convex Cloud." },
          { type: "output", text: "  wipe            - Delete transactions and invoices clean." },
          { type: "output", text: "  typecheck       - Execute simulated TypeScript compiler audits." },
          { type: "output", text: "  db list         - Display database record metrics count." },
          { type: "output", text: "  db query [tbl]  - Fetch table JSON (tbl: transactions | invoices)" },
          { type: "output", text: "  git status      - Inspect active branch staging values." },
          { type: "output", text: "  clear           - Wipe CLI scroll history." },
        ]);
        break;

      case "clear":
        setTerminalHistory([]);
        break;

      case "seed":
        setTerminalHistory(prev => [...prev, { type: "output", text: "Invoking mutation: api.seeder.seedMockData..." }]);
        try {
          addLog("mutation", "seedMockData mutation invoked via CLI shell");
          const res = await seedMock({ orgId: organization.id });
          setTerminalHistory(prev => [
            ...prev,
            { type: "output", text: `✔ Seeding Success! Saved ${res.seededCount} records to Convex Cloud.` }
          ]);
          addLog("info", `Seed Success: loaded ${res.seededCount} records`);
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : String(err);
          setTerminalHistory(prev => [...prev, { type: "error", text: `✖ Seeding Failed: ${errMsg}` }]);
          addLog("error", `CLI Seeding Failed: ${errMsg}`);
        }
        break;

      case "wipe":
        setTerminalHistory(prev => [...prev, { type: "output", text: "Invoking mutation: api.seeder.clearMockData..." }]);
        try {
          addLog("mutation", "clearMockData mutation invoked via CLI shell");
          await clearMock({ orgId: organization.id });
          setTerminalHistory(prev => [...prev, { type: "output", text: "✔ Database successfully wiped clean. Subscription reset to Free." }]);
          addLog("info", "CLI database wipe success");
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : String(err);
          setTerminalHistory(prev => [...prev, { type: "error", text: `✖ Wipe Failed: ${errMsg}` }]);
          addLog("error", `CLI Wipe Failed: ${errMsg}`);
        }
        break;

      case "typecheck":
        setTerminalHistory(prev => [...prev, { type: "output", text: "$ tsc --noEmit && convex typecheck" }]);
        setTerminalHistory(prev => [...prev, { type: "output", text: "Scanning 232 active project files..." }]);
        await new Promise(resolve => setTimeout(resolve, 800));
        setTerminalHistory(prev => [
          ...prev,
          { type: "output", text: "✔ Typecheck passed: `tsc --noEmit` completed with exit code 0." }
        ]);
        addLog("info", "Compiler pass completed cleanly");
        break;

      case "git":
        if (parts[1] === "status") {
          setTerminalHistory(prev => [
            ...prev,
            { type: "output", text: "On branch main" },
            { type: "output", text: "Your branch is up to date with 'origin/main'." },
            { type: "output", text: "nothing to commit, working tree clean" }
          ]);
        } else {
          setTerminalHistory(prev => [...prev, { type: "error", text: "Simulated Git: Try typing 'git status'" }]);
        }
        break;

      case "db":
        if (parts[1] === "list") {
          setTerminalHistory(prev => [
            ...prev,
            { type: "output", text: "Convex Collections Segment Count:" },
            { type: "output", text: `  - transactions : ${listTx.length} records` },
            { type: "output", text: `  - invoices     : ${listInv.length} records` },
            { type: "output", text: `  - receipts     : ${listRec.length} records` },
          ]);
        } else if (parts[1] === "query") {
          const table = parts[2];
          if (table === "transactions") {
            setTerminalHistory(prev => [
              ...prev,
              { type: "output", text: `transactions JSON data [${listTx.length} items]:` },
              { type: "output", text: JSON.stringify(listTx.slice(0, 3), null, 2) },
              listTx.length > 3 ? { type: "output", text: "... and more items available in DB tab" } : { type: "output", text: "" }
            ]);
          } else if (table === "invoices") {
            setTerminalHistory(prev => [
              ...prev,
              { type: "output", text: `invoices JSON data [${listInv.length} items]:` },
              { type: "output", text: JSON.stringify(listInv.slice(0, 3), null, 2) },
              listInv.length > 3 ? { type: "output", text: "... and more items available in DB tab" } : { type: "output", text: "" }
            ]);
          } else {
            setTerminalHistory(prev => [...prev, { type: "error", text: "Specify table: db query transactions | invoices" }]);
          }
        } else {
          setTerminalHistory(prev => [...prev, { type: "error", text: "Usage: db list | db query [table]" }]);
        }
        break;

      default:
        setTerminalHistory(prev => [
          ...prev,
          { type: "error", text: `bash: ${primaryCmd}: command not found. Type 'help' for instructions.` }
        ]);
        break;
    }
  };

  // Submit dynamic transaction
  const handleTxSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInserting(true);
    setDbStatusMsg(null);
    try {
      addLog("mutation", `createTransaction invoked for amount $${txForm.amount}`);
      await createTx({
        orgId: organization.id,
        description: txForm.description || "Uncategorized Expense",
        amount: Number(txForm.amount),
        type: txForm.type,
        category: txForm.category,
        date: Date.now(),
        status: txForm.status
      });
      setTxForm({ description: "", amount: 150, type: "expense", category: "Software", status: "completed" });
      setDbStatusMsg("Transaction created reactively!");
      addLog("info", "Transaction successfully added to ledger");
      setTimeout(() => setDbStatusMsg(null), 3000);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setDbStatusMsg(`Error: ${errMsg}`);
      addLog("error", `Transaction insert failed: ${errMsg}`);
    } finally {
      setIsInserting(false);
    }
  };

  // Submit dynamic invoice
  const handleInvSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInserting(true);
    setDbStatusMsg(null);
    try {
      addLog("mutation", `createInvoice invoked for amount $${invForm.amount}`);
      await createInv({
        orgId: organization.id,
        invoiceNumber: invForm.invoiceNumber || `INV-2026-00${listInv.length + 5}`,
        customerName: invForm.customerName || "Default Customer",
        customerEmail: invForm.customerEmail || "accounts@customer.com",
        amount: Number(invForm.amount),
        dueDate: Date.now() + 10 * 24 * 60 * 60 * 1000,
        status: invForm.status
      });
      setInvForm({ customerName: "", customerEmail: "", amount: 1200, invoiceNumber: `INV-2026-00${listInv.length + 6}`, status: "sent" });
      setDbStatusMsg("Invoice created reactively!");
      addLog("info", "Invoice successfully added to ledger");
      setTimeout(() => setDbStatusMsg(null), 3000);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setDbStatusMsg(`Error: ${errMsg}`);
      addLog("error", `Invoice insert failed: ${errMsg}`);
    } finally {
      setIsInserting(false);
    }
  };

  // Execute row deletions
  const handleDeleteTx = async (id: Id<"transactions">) => {
    try {
      addLog("mutation", `deleteTransaction invoked for ID: ${id}`);
      await deleteTx({ orgId: organization.id, id });
      addLog("info", `Deleted transaction ID: ${id}`);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      addLog("error", `Failed to delete transaction: ${errMsg}`);
    }
  };

  const handleDeleteInv = async (id: Id<"invoices">) => {
    try {
      addLog("mutation", `deleteInvoice invoked for ID: ${id}`);
      await deleteInv({ orgId: organization.id, id });
      addLog("info", `Deleted invoice ID: ${id}`);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      addLog("error", `Failed to delete invoice: ${errMsg}`);
    }
  };

  const handleDeleteRec = async (id: Id<"receipts">) => {
    try {
      addLog("mutation", `deleteReceipt invoked for ID: ${id}`);
      await deleteRec({ orgId: organization.id, id });
      addLog("info", `Deleted receipt ID: ${id}`);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      addLog("error", `Failed to delete receipt: ${errMsg}`);
    }
  };

  // Update subscriber tiers
  const handleUpgradeTier = async (plan: "free" | "pro" | "business") => {
    try {
      addLog("mutation", `updateOrgPlan updating plan to ${plan}`);
      await updateOrg({
        orgId: organization.id,
        plan,
        seats: plan === "free" ? 1 : plan === "pro" ? 3 : 5
      });
      addLog("info", `Subscribed organization to ${plan.toUpperCase()} tier`);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      addLog("error", `Failed to upgrade tier: ${errMsg}`);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 border-l border-zinc-900 selection:bg-indigo-500/30">

      {/* Console Tab Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800 shrink-0 select-none">

        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse shadow-sm shadow-indigo-500/50" />
          <span className="font-mono text-xs text-zinc-300 font-bold uppercase tracking-wider">ECompany Console</span>
        </div>

        {/* Action tags */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 font-mono text-[9px] text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
            <Server className="h-2.5 w-2.5 text-indigo-400" />
            <span>CLOUD SYNC</span>
          </div>
          <button
            onClick={() => setIsDevMode(false)}
            className="text-[10px] font-mono text-zinc-500 hover:text-zinc-200 transition-colors font-bold uppercase"
          >
            [Close IDE]
          </button>
        </div>

      </div>

      {/* Tabs list bar */}
      <div className="flex border-b border-zinc-900 bg-zinc-950 text-xs shrink-0 select-none font-mono">

        <button
          onClick={() => setActiveTab("terminal")}
          className={`flex items-center gap-1.5 px-4 py-2 border-b-2 transition-all ${activeTab === "terminal" ? "border-indigo-500 bg-zinc-900/60 text-zinc-100 font-bold" : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/20"}`}
        >
          <TerminalIcon className="h-3 w-3 shrink-0" />
          <span>&gt;_ Shell</span>
        </button>

        <button
          onClick={() => setActiveTab("db")}
          className={`flex items-center gap-1.5 px-4 py-2 border-b-2 transition-all ${activeTab === "db" ? "border-indigo-500 bg-zinc-900/60 text-zinc-100 font-bold" : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/20"}`}
        >
          <Database className="h-3 w-3 shrink-0" />
          <span>📂 DB Explorer</span>
        </button>

        <button
          onClick={() => setActiveTab("code")}
          className={`flex items-center gap-1.5 px-4 py-2 border-b-2 transition-all ${activeTab === "code" ? "border-indigo-500 bg-zinc-900/60 text-zinc-100 font-bold" : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/20"}`}
        >
          <CodeIcon className="h-3 w-3 shrink-0" />
          <span>📝 Source</span>
        </button>

        <button
          onClick={() => setActiveTab("logs")}
          className={`flex items-center gap-1.5 px-4 py-2 border-b-2 transition-all ${activeTab === "logs" ? "border-indigo-500 bg-zinc-900/60 text-zinc-100 font-bold" : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/20"}`}
        >
          <Activity className="h-3 w-3 shrink-0" />
          <span>📡 Logs</span>
        </button>

        <button
          onClick={() => setActiveTab("styles")}
          className={`flex items-center gap-1.5 px-4 py-2 border-b-2 transition-all ${activeTab === "styles" ? "border-indigo-500 bg-zinc-900/60 text-zinc-100 font-bold" : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/20"}`}
        >
          <Palette className="h-3 w-3 shrink-0" />
          <span>🎨 Style</span>
        </button>

      </div>

      {/* Pane Content body container */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0 bg-zinc-950/40">

        {/* Tab 1: Terminal CLI */}
        {activeTab === "terminal" && (
          <div className="h-full flex flex-col font-mono text-xs select-text">
            <div className="flex-1 space-y-1.5 overflow-y-auto pr-1">
              {terminalHistory.map((item, idx) => (
                <div
                  key={idx}
                  className={`leading-relaxed whitespace-pre-wrap ${item.type === "input" ? "text-zinc-300" :
                      item.type === "error" ? "text-rose-400 font-semibold" :
                        "text-indigo-300/90"
                    }`}
                >
                  {item.text}
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>

            <form onSubmit={handleTerminalSubmit} className="flex items-center gap-2 border-t border-zinc-900 pt-3 mt-2">
              <span className="text-zinc-400 shrink-0 select-none">eyad@animated-deer-35:~$</span>
              <input
                type="text"
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                placeholder="Type command e.g. seed, wipe, typecheck, help..."
                className="flex-1 bg-transparent border-0 outline-none text-zinc-100 focus:ring-0 placeholder:text-zinc-700"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />
            </form>
          </div>
        )}

        {/* Tab 2: Live Database Explorer */}
        {activeTab === "db" && (
          <div className="space-y-6 font-mono text-xs">

            {/* Database dropdown list */}
            <div className="flex items-center justify-between gap-3 border-b border-zinc-900 pb-3">
              <span className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">Segment Tables</span>
              <select
                value={activeTable}
                onChange={(e) => {
                  setActiveTable(e.target.value as "transactions" | "invoices" | "receipts" | "organizations");
                  setDbStatusMsg(null);
                }}
                className="bg-zinc-900 border border-zinc-800 text-zinc-200 rounded px-2.5 py-1 text-xs outline-none focus:border-indigo-500"
              >
                <option value="transactions">transactions ({listTx.length})</option>
                <option value="invoices">invoices ({listInv.length})</option>
                <option value="receipts">receipts ({listRec.length})</option>
                <option value="organizations">organizations (Config)</option>
              </select>
            </div>

            {/* Status alerts */}
            {dbStatusMsg && (
              <div className="px-3 py-1.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] animate-in fade-in duration-200">
                {dbStatusMsg}
              </div>
            )}

            {/* Dynamic Insertion Form Card */}
            <Card className="rounded-xl border-zinc-900 bg-zinc-900/40 p-4">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-3 flex items-center gap-1.5">
                <Plus className="h-3 w-3 text-indigo-400" /> [+] Create Document (Insert Mutation)
              </span>

              {activeTable === "transactions" && (
                <form onSubmit={handleTxSubmit} className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-500 uppercase font-semibold">Type</label>
                      <select
                        value={txForm.type}
                        onChange={(e) => setTxForm(p => ({ ...p, type: e.target.value as "income" | "expense" }))}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-1 text-[11px] outline-none text-zinc-200"
                      >
                        <option value="income">Income (+)</option>
                        <option value="expense">Expense (-)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-500 uppercase font-semibold">Amount ($)</label>
                      <input
                        type="number"
                        value={txForm.amount}
                        onChange={(e) => setTxForm(p => ({ ...p, amount: Number(e.target.value) }))}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-1 text-[11px] outline-none text-zinc-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 uppercase font-semibold">Description</label>
                    <input
                      type="text"
                      placeholder="e.g. AWS RDS Cloud database bill"
                      value={txForm.description}
                      onChange={(e) => setTxForm(p => ({ ...p, description: e.target.value }))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-1 text-[11px] outline-none text-zinc-200 placeholder:text-zinc-800"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-500 uppercase font-semibold">Category</label>
                      <input
                        type="text"
                        value={txForm.category}
                        onChange={(e) => setTxForm(p => ({ ...p, category: e.target.value }))}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-1 text-[11px] outline-none text-zinc-200"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-500 uppercase font-semibold">Status</label>
                      <select
                        value={txForm.status}
                        onChange={(e) => setTxForm(p => ({ ...p, status: e.target.value as "pending" | "completed" }))}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-1 text-[11px] outline-none text-zinc-200"
                      >
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                      </select>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isInserting}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[11px] h-7 font-bold shrink-0 border-0"
                  >
                    {isInserting ? "Inserting Mutation..." : "Insert into transactions"}
                  </Button>
                </form>
              )}

              {activeTable === "invoices" && (
                <form onSubmit={handleInvSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-500 uppercase font-semibold">Client Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Stark Ind."
                        value={invForm.customerName}
                        onChange={(e) => setInvForm(p => ({ ...p, customerName: e.target.value }))}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-1 text-[11px] outline-none text-zinc-200 placeholder:text-zinc-800"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-500 uppercase font-semibold">Email</label>
                      <input
                        type="email"
                        placeholder="accounts@corp.com"
                        value={invForm.customerEmail}
                        onChange={(e) => setInvForm(p => ({ ...p, customerEmail: e.target.value }))}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-1 text-[11px] outline-none text-zinc-200 placeholder:text-zinc-800"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1 col-span-2">
                      <label className="text-[9px] text-zinc-500 uppercase font-semibold">Invoice No.</label>
                      <input
                        type="text"
                        value={invForm.invoiceNumber}
                        onChange={(e) => setInvForm(p => ({ ...p, invoiceNumber: e.target.value }))}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-1 text-[11px] outline-none text-zinc-200"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-500 uppercase font-semibold">Amount ($)</label>
                      <input
                        type="number"
                        value={invForm.amount}
                        onChange={(e) => setInvForm(p => ({ ...p, amount: Number(e.target.value) }))}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-1 text-[11px] outline-none text-zinc-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 uppercase font-semibold">Collection Status</label>
                    <select
                      value={invForm.status}
                      onChange={(e) => setInvForm(p => ({ ...p, status: e.target.value as "draft" | "sent" | "paid" | "overdue" }))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-1 text-[11px] outline-none text-zinc-200"
                    >
                      <option value="sent">Sent (Unpaid)</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>

                  <Button
                    type="submit"
                    disabled={isInserting}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[11px] h-7 font-bold shrink-0 border-0"
                  >
                    {isInserting ? "Inserting Mutation..." : "Insert into invoices"}
                  </Button>
                </form>
              )}

              {activeTable === "receipts" && (
                <div className="text-center py-4 text-[11px] text-zinc-500 space-y-2">
                  <ShieldAlert className="h-6 w-6 text-zinc-600 mx-auto" />
                  <p>Receipt attachments utilize active Convex OCR pipelines. Upload physical images in the &quot;AI Receipt Scanner&quot; view to insert scanned records.</p>
                </div>
              )}

              {activeTable === "organizations" && (
                <div className="space-y-3">
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Select Simulated Plan Tier:</span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleUpgradeTier("free")}
                      className={`h-7 rounded text-[10px] font-bold border transition-all ${listOrg?.plan === "free" ? "bg-zinc-800 border-zinc-700 text-zinc-100" : "bg-zinc-950 border-zinc-900 text-zinc-500 hover:text-zinc-300"}`}
                    >
                      FREE TIER
                    </button>
                    <button
                      onClick={() => handleUpgradeTier("pro")}
                      className={`h-7 rounded text-[10px] font-bold border transition-all ${listOrg?.plan === "pro" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" : "bg-zinc-950 border-zinc-900 text-zinc-500 hover:text-zinc-300"}`}
                    >
                      PRO TIER
                    </button>
                    <button
                      onClick={() => handleUpgradeTier("business")}
                      className={`h-7 rounded text-[10px] font-bold border transition-all ${listOrg?.plan === "business" ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" : "bg-zinc-950 border-zinc-900 text-zinc-500 hover:text-zinc-300"}`}
                    >
                      BUSINESS
                    </button>
                  </div>
                  <span className="text-[9px] text-zinc-600 leading-normal block">This changes plan boundaries immediately, altering page elements, seat settings, and trial aggregates.</span>
                </div>
              )}

            </Card>

            {/* Table Rows list */}
            <div className="space-y-2.5">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Live Cloud Documents ({
                activeTable === "transactions" ? listTx.length :
                  activeTable === "invoices" ? listInv.length :
                    activeTable === "receipts" ? listRec.length : 1
              } items)</span>

              <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">

                {activeTable === "transactions" && (
                  listTx.length === 0 ? (
                    <div className="text-center py-6 text-zinc-700 bg-zinc-900/10 rounded">No transaction records in segment.</div>
                  ) : (
                    listTx.map((row) => (
                      <div key={row._id} className="p-2.5 rounded bg-zinc-900/30 border border-zinc-900/90 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <span className="font-semibold text-zinc-300 block truncate max-w-[180px]">{row.description}</span>
                          <span className="text-[9px] text-zinc-600 block mt-0.5 truncate font-mono">ID: {row._id}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`font-bold ${row.type === "income" ? "text-emerald-500" : "text-rose-400"}`}>
                            {row.type === "income" ? "+" : "-"}${row.amount}
                          </span>
                          <button
                            onClick={() => handleDeleteTx(row._id)}
                            className="text-zinc-600 hover:text-rose-400 transition-colors p-1"
                            title="Delete Document"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )
                )}

                {activeTable === "invoices" && (
                  listInv.length === 0 ? (
                    <div className="text-center py-6 text-zinc-700 bg-zinc-900/10 rounded">No invoice records in segment.</div>
                  ) : (
                    listInv.map((row) => (
                      <div key={row._id} className="p-2.5 rounded bg-zinc-900/30 border border-zinc-900/90 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <span className="font-semibold text-zinc-300 block truncate max-w-[180px]">{row.customerName}</span>
                          <span className="text-[9px] text-zinc-600 block mt-0.5 truncate font-mono">ID: {row._id} | {row.invoiceNumber}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-bold text-zinc-300">${row.amount}</span>
                          <span className={`text-[9px] font-bold px-1 py-0.5 rounded capitalize ${row.status === "paid" ? "bg-emerald-500/10 text-emerald-500" :
                              row.status === "overdue" ? "bg-rose-500/10 text-rose-400" :
                                "bg-amber-500/10 text-amber-500"
                            }`}>
                            {row.status}
                          </span>
                          <button
                            onClick={() => handleDeleteInv(row._id)}
                            className="text-zinc-600 hover:text-rose-400 transition-colors p-1"
                            title="Delete Document"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )
                )}

                {activeTable === "receipts" && (
                  listRec.length === 0 ? (
                    <div className="text-center py-6 text-zinc-700 bg-zinc-900/10 rounded">No receipt documents in segment.</div>
                  ) : (
                    listRec.map((row) => (
                      <div key={row._id} className="p-2.5 rounded bg-zinc-900/30 border border-zinc-900/90 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <span className="font-semibold text-zinc-300 block truncate max-w-[180px]">{row.merchant || "Processing Receipt..."}</span>
                          <span className="text-[9px] text-zinc-600 block mt-0.5 truncate font-mono">ID: {row._id}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-bold text-zinc-300">${row.amount || 0}</span>
                          <span className={`text-[9px] font-bold px-1 py-0.5 rounded capitalize ${row.status === "completed" ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-800 text-zinc-500"}`}>
                            {row.status}
                          </span>
                          <button
                            onClick={() => handleDeleteRec(row._id)}
                            className="text-zinc-600 hover:text-rose-400 transition-colors p-1"
                            title="Delete Document"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )
                )}

                {activeTable === "organizations" && listOrg && (
                  <div className="p-3 rounded bg-zinc-900/30 border border-zinc-900/95 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-500">Document ID:</span>
                      <span className="font-mono text-zinc-300">{("_id" in listOrg ? listOrg._id : null) || "Default Cache"}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-500">Clerk B2B Tenant:</span>
                      <span className="font-mono text-zinc-300">{organization.id}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-500">Calculated Plan:</span>
                      <span className="font-mono text-indigo-400 font-bold capitalize">{listOrg.plan} Tier</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-500">Active Member Seats:</span>
                      <span className="font-mono text-zinc-300">{listOrg.seats} seats allocation</span>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>
        )}

        {/* Tab 3: Code Inspector */}
        {activeTab === "code" && (
          <div className="h-full flex gap-3 text-xs font-mono min-h-0 select-text">

            {/* Sidebar file browser */}
            <div className="w-40 border-r border-zinc-900 pr-2 overflow-y-auto shrink-0 select-none space-y-3">
              <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider block">Workspace AST</span>

              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-zinc-500 py-0.5">
                  <Folder className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                  <span className="truncate">convex/</span>
                </div>
                {Object.keys(CODE_RESOURCES).filter(k => k.startsWith("convex/")).map(fileName => (
                  <button
                    key={fileName}
                    onClick={() => setSelectedFile(fileName as keyof typeof CODE_RESOURCES)}
                    className={`flex items-center gap-1 pl-4 py-0.5 w-full text-left truncate rounded hover:bg-zinc-900/60 ${selectedFile === fileName ? "text-indigo-400 font-semibold" : "text-zinc-500"}`}
                  >
                    <FileCode className="h-3 w-3 shrink-0" />
                    <span className="truncate">{fileName.split("/")[1]}</span>
                  </button>
                ))}

                <div className="flex items-center gap-1.5 text-zinc-500 py-0.5 pt-2">
                  <Folder className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                  <span className="truncate">components/</span>
                </div>
                {Object.keys(CODE_RESOURCES).filter(k => k.startsWith("components/")).map(fileName => (
                  <button
                    key={fileName}
                    onClick={() => setSelectedFile(fileName as keyof typeof CODE_RESOURCES)}
                    className={`flex items-center gap-1 pl-4 py-0.5 w-full text-left truncate rounded hover:bg-zinc-900/60 ${selectedFile === fileName ? "text-indigo-400 font-semibold" : "text-zinc-500"}`}
                  >
                    <FileCode className="h-3 w-3 shrink-0" />
                    <span className="truncate">{fileName.split("/")[1]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Syntax scrolling panel */}
            <div className="flex-1 flex flex-col min-h-0 bg-zinc-950 border border-zinc-900 rounded p-3 overflow-y-auto leading-relaxed">
              <span className="text-[10px] text-zinc-500 font-bold block mb-2 border-b border-zinc-900 pb-1.5 uppercase select-none">{selectedFile}</span>
              <pre className="text-[11px] text-zinc-300 font-mono whitespace-pre overflow-x-auto pr-1">
                {CODE_RESOURCES[selectedFile]}
              </pre>
            </div>

          </div>
        )}

        {/* Tab 4: Serverless Logs Feed */}
        {activeTab === "logs" && (
          <div className="h-full flex flex-col font-mono text-[11px] select-text">

            <div className="flex items-center justify-between border-b border-zinc-900 pb-2 mb-3 shrink-0 select-none">
              <span className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">Real-Time Execution Logs</span>
              <button
                onClick={clearLogs}
                className="text-[9px] text-zinc-500 hover:text-zinc-300 transition-colors uppercase border border-zinc-800 bg-zinc-900 px-2 py-0.5 rounded font-bold"
              >
                Clear Logs
              </button>
            </div>

            <div className="flex-1 space-y-1.5 overflow-y-auto pr-1">
              {logs.length === 0 ? (
                <div className="text-center py-10 text-zinc-700 text-xs">No execution traces captured yet. Navigate tabs or invoke seeding to log transactions.</div>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed border-b border-zinc-950 pb-1 flex gap-2">
                    <span className="text-zinc-600 shrink-0">[{log.timestamp}]</span>
                    <span className={`uppercase tracking-wide font-bold shrink-0 text-[9px] px-1 py-0.2 rounded border ${log.type === "mutation" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
                        log.type === "query" ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" :
                          log.type === "error" ? "bg-rose-500/10 border-rose-500/20 text-rose-400" :
                            "bg-zinc-900 border-zinc-800 text-zinc-400"
                      }`}>{log.type}</span>
                    <span className="text-zinc-300 break-words flex-1">{log.message}</span>
                  </div>
                ))
              )}
            </div>

          </div>
        )}

        {/* Tab 5: UI Canvas Style customizer */}
        {activeTab === "styles" && (
          <div className="space-y-5 font-mono text-xs select-none">

            <div className="border-b border-zinc-900 pb-2">
              <span className="text-zinc-500 font-bold uppercase tracking-wider text-[10px] block">Active Visual Style Engine</span>
              <span className="text-[10px] text-zinc-600 mt-0.5 block">Alter tailwind mappings instantly across B2B widgets.</span>
            </div>

            {/* Accent Theme controller */}
            <div className="space-y-2">
              <label className="text-[10px] text-zinc-500 uppercase font-semibold flex items-center gap-1.5">
                <Palette className="h-3.5 w-3.5 text-indigo-400" /> Theme Accent Palettes
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "indigo", label: "Indigo Insight", color: "bg-indigo-500" },
                  { id: "emerald", label: "Emerald Growth", color: "bg-emerald-500" },
                  { id: "amber", label: "Golden Sunset", color: "bg-amber-500" },
                  { id: "rose", label: "Rose Deficit", color: "bg-rose-500" },
                  { id: "sapphire", label: "Deep Sapphire", color: "bg-blue-600" }
                ].map(theme => (
                  <button
                    key={theme.id}
                    onClick={() => {
                      setStyleOptions(p => ({ ...p, accentTheme: theme.id as "indigo" | "emerald" | "amber" | "rose" | "sapphire" }));
                      addLog("info", `Custom styling palette changed to: ${theme.id}`);
                    }}
                    className={`flex items-center justify-between p-2 rounded border transition-all ${styleOptions.accentTheme === theme.id
                        ? "border-zinc-500 bg-zinc-900 text-zinc-100 font-bold"
                        : "border-zinc-900 bg-zinc-900/20 text-zinc-500 hover:text-zinc-300"
                      }`}
                  >
                    <span className="truncate">{theme.label}</span>
                    <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${theme.color}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Corners Radius controller */}
            <div className="space-y-2 pt-2 border-t border-zinc-900">
              <label className="text-[10px] text-zinc-500 uppercase font-semibold flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-indigo-400" /> Corner Border Radius
              </label>
              <div className="grid grid-cols-4 gap-1">
                {[
                  { id: "sharp", label: "Sharp" },
                  { id: "rounded", label: "Medium" },
                  { id: "premium", label: "Premium" },
                  { id: "extra", label: "Extra" }
                ].map(radius => (
                  <button
                    key={radius.id}
                    onClick={() => {
                      setStyleOptions(p => ({ ...p, borderRadius: radius.id as "sharp" | "rounded" | "premium" | "extra" }));
                      addLog("info", `Card corner radius set to: ${radius.id}`);
                    }}
                    className={`h-7 rounded text-[10px] border transition-all ${styleOptions.borderRadius === radius.id
                        ? "bg-zinc-800 border-zinc-700 text-zinc-100 font-bold"
                        : "bg-zinc-950 border-zinc-900 text-zinc-500 hover:text-zinc-300"
                      }`}
                  >
                    {radius.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dotted Grids controller */}
            <div className="space-y-2 pt-2 border-t border-zinc-900">
              <label className="text-[10px] text-zinc-500 uppercase font-semibold flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-indigo-400" /> Layout Grid Backdrops
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: "clean", label: "Clean" },
                  { id: "dots", label: "Subtle Dots" },
                  { id: "grid", label: "Graph Lines" }
                ].map(grid => (
                  <button
                    key={grid.id}
                    onClick={() => {
                      setStyleOptions(p => ({ ...p, gridStyle: grid.id as "clean" | "dots" | "grid" }));
                      addLog("info", `Canvas grid background style changed to: ${grid.id}`);
                    }}
                    className={`h-7 rounded text-[10px] border transition-all ${styleOptions.gridStyle === grid.id
                        ? "bg-zinc-800 border-zinc-700 text-zinc-100 font-bold"
                        : "bg-zinc-950 border-zinc-900 text-zinc-500 hover:text-zinc-300"
                      }`}
                  >
                    {grid.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Neon card glow */}
            <div className="space-y-2 pt-2 border-t border-zinc-900">
              <label className="text-[10px] text-zinc-500 uppercase font-semibold flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" /> Card Glow Effects
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: "off", label: "No Glow" },
                  { id: "subtle", label: "Subtle" },
                  { id: "neon", label: "Neon Pulsing" }
                ].map(glow => (
                  <button
                    key={glow.id}
                    onClick={() => {
                      setStyleOptions(p => ({ ...p, glowIntensity: glow.id as "off" | "subtle" | "neon" }));
                      addLog("info", `Visual card glow set to: ${glow.id}`);
                    }}
                    className={`h-7 rounded text-[10px] border transition-all ${styleOptions.glowIntensity === glow.id
                        ? "bg-zinc-800 border-zinc-700 text-zinc-100 font-bold"
                        : "bg-zinc-950 border-zinc-900 text-zinc-500 hover:text-zinc-300"
                      }`}
                  >
                    {glow.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Chart curves customizer */}
            <div className="space-y-2 pt-2 border-t border-zinc-900">
              <label className="text-[10px] text-zinc-500 uppercase font-semibold flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-indigo-400" /> Recharts Curve Lines
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: "monotone", label: "Smooth" },
                  { id: "linear", label: "Straight" },
                  { id: "step", label: "Step Steps" }
                ].map(chart => (
                  <button
                    key={chart.id}
                    onClick={() => {
                      setStyleOptions(p => ({ ...p, chartStyle: chart.id as "monotone" | "linear" | "step" }));
                      addLog("info", `Recharts curve mapping style set to: ${chart.id}`);
                    }}
                    className={`h-7 rounded text-[10px] border transition-all ${styleOptions.chartStyle === chart.id
                        ? "bg-zinc-800 border-zinc-700 text-zinc-100 font-bold"
                        : "bg-zinc-950 border-zinc-900 text-zinc-500 hover:text-zinc-300"
                      }`}
                  >
                    {chart.label}
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
