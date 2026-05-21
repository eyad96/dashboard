"use client";

import React from "react";
import { useOrganization } from "@clerk/nextjs";
import { useQuery, useMutation, useAction, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { 
  ScanLine, 
  UploadCloud, 
  Sparkles, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Crown, 
  Lock,
  ChevronRight,
  TrendingUp,
  Receipt,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";

export default function ReceiptsPage() {
  const { organization, membership } = useOrganization();
  const { isAuthenticated } = useConvexAuth();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Loading and action state
  const [uploading, setUploading] = React.useState(false);
  const [scanProgress, setScanProgress] = React.useState<string | null>(null);
  const [convertedIds, setConvertedIds] = React.useState<Record<string, boolean>>({});

  // Convex hooks
  const orgPlan = useQuery(
    api.orgs.getOrgPlan,
    isAuthenticated && organization?.id ? { orgId: organization.id } : "skip"
  );

  const receipts = useQuery(
    api.receipts.listReceipts,
    isAuthenticated && organization?.id ? { orgId: organization.id } : "skip"
  );

  const generateUploadUrl = useMutation(api.receipts.generateUploadUrl);
  const saveReceipt = useMutation(api.receipts.saveReceipt);
  const scanReceipt = useAction(api.receipts.scanReceiptAction);
  const createTransaction = useMutation(api.transactions.createTransaction);

  if (!organization) return null;

  const userRole = membership?.role ?? "";
  const isViewer = userRole.replace(/^org:/, "") === "viewer";
  const plan = orgPlan?.plan ?? "free";
  const isBusiness = plan === "business";

  const isLoading = orgPlan === undefined || receipts === undefined;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !organization) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large. Please select an image under 5MB.");
      return;
    }

    setUploading(true);
    setScanProgress("Uploading receipt to secure cloud storage...");

    try {
      // 1. Obtain a secure file upload url from Convex storage
      const uploadUrl = await generateUploadUrl({ orgId: organization.id });

      // 2. Perform direct binary POST upload
      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error("Cloud upload handshake failed");
      }

      const { storageId } = await uploadResponse.json();

      setScanProgress("Gemini-2.5-flash reading transaction details...");

      // 3. Save receipt database record in 'processing' status
      const receiptId = await saveReceipt({
        orgId: organization.id,
        storageId,
      });

      // 4. Trigger Convex action for AI structured parsing
      const result = await scanReceipt({
        orgId: organization.id,
        receiptId,
        storageId,
      });

      setScanProgress(null);
      if (!result.success) {
        alert("AI scan failed: " + result.error);
      }
    } catch (err: any) {
      console.error("OCR Scanner failed:", err);
      alert("AI Scanning failed: " + (err.message || "Unknown error"));
      setScanProgress(null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleConvertToExpense = async (receipt: any) => {
    if (isViewer || !receipt.amount || !receipt.merchant) return;

    try {
      await createTransaction({
        orgId: organization.id,
        type: "expense",
        amount: receipt.amount,
        category: "Software", // Default category
        description: `AI OCR: ${receipt.merchant}`,
        date: receipt.date || Date.now(),
        status: "completed",
      });

      // Mark as successfully converted locally to prevent double posting
      setConvertedIds(prev => ({
        ...prev,
        [receipt._id]: true
      }));
    } catch (err) {
      console.error("Failed to convert receipt to expense:", err);
      alert("Failed to convert receipt to ledger expense.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 animate-spin">
          <ScanLine className="h-5 w-5" />
        </div>
        <span className="text-xs text-muted-foreground animate-pulse">Checking B2B service entitlements...</span>
      </div>
    );
  }

  // Paywall View for Free/Pro Plans
  if (!isBusiness) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Banner */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/10">
            <Crown className="h-3.5 w-3.5 fill-emerald-500/20" />
            Premium Business Benefit
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500 bg-clip-text text-transparent pb-1">
            Automate Bookkeeping with AI Receipts
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Stop logging expenses manually. Upload receipt photos or PDF invoices, and let our fine-tuned Gemini-2.5-flash models instantly compile ledger records for you.
          </p>
        </div>

        {/* Feature Comparison Cards */}
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          
          <Card className="rounded-2xl border-neutral-200 dark:border-neutral-800/80 bg-background/50 backdrop-blur-sm p-5 relative overflow-hidden flex flex-col justify-between h-48 hover:shadow-md transition-shadow">
            <div>
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
              <h3 className="font-bold text-sm">Gemini AI OCR</h3>
              <p className="text-xs text-muted-foreground mt-1.5">
                Automatically extracts merchant, tax values, line items, and date logs from any receipt structure.
              </p>
            </div>
          </Card>

          <Card className="rounded-2xl border-neutral-200 dark:border-neutral-800/80 bg-background/50 backdrop-blur-sm p-5 relative overflow-hidden flex flex-col justify-between h-48 hover:shadow-md transition-shadow">
            <div>
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3">
                <Receipt className="h-4.5 w-4.5" />
              </div>
              <h3 className="font-bold text-sm">Direct Ledger Syncing</h3>
              <p className="text-xs text-muted-foreground mt-1.5">
                Review extracted summaries and post them as official double-entry ledger transactions with one simple click.
              </p>
            </div>
          </Card>

          <Card className="rounded-2xl border-neutral-200 dark:border-neutral-800/80 bg-background/50 backdrop-blur-sm p-5 relative overflow-hidden flex flex-col justify-between h-48 hover:shadow-md transition-shadow sm:col-span-2 md:col-span-1">
            <div>
              <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3">
                <UploadCloud className="h-4.5 w-4.5" />
              </div>
              <h3 className="font-bold text-sm">Secure Audit File Cloud</h3>
              <p className="text-xs text-muted-foreground mt-1.5">
                Store uploaded receipt proof images directly within Convex's distributed secure file system forever.
              </p>
            </div>
          </Card>

        </div>

        {/* Upgrade Paywall Panel */}
        <Card className="rounded-3xl border border-emerald-500/20 bg-gradient-to-tr from-emerald-500/5 via-teal-500/5 to-indigo-500/5 backdrop-blur-lg overflow-hidden shadow-xl p-8 max-w-2xl mx-auto text-center space-y-6">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Lock className="h-5.5 w-5.5" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-extrabold text-foreground">AI Receipt Scanner is Locked</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Your organization <span className="font-bold text-foreground">{organization.name}</span> is currently on the <span className="capitalize font-bold text-emerald-600 dark:text-emerald-400">{plan} plan</span>. Upgrade to the B2B Business plan to activate instant AI receipt scanning.
            </p>
          </div>
          <div className="pt-2">
            <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl px-8 shadow-md shadow-emerald-500/15">
              <Link href="/product/dashboard/settings" className="flex items-center gap-1.5">
                Upgrade to Business Plan
                <ChevronRight className="h-4.5 w-4.5" />
              </Link>
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Upgrading immediately expands seat capacities and activates role management features.
          </p>
        </Card>

      </div>
    );
  }

  // Active AI Receipt scanning screen for B2B Business Tiers
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-2xl font-bold tracking-tight">AI Receipt Uploader</h1>
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 text-[10px] font-bold border border-emerald-500/10">
              <Sparkles className="h-3 w-3 fill-emerald-500/20" />
              Active Gemini OCR
            </span>
            {isViewer && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-500 text-[10px] font-bold border border-amber-500/10">
                <Lock className="h-3 w-3" />
                Read-Only (Viewer)
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Drag files, upload invoice captures, and audit receipt logs powered by AI.
          </p>
        </div>
      </div>

      {/* Main Drag/Drop Uploader card */}
      <div className="max-w-2xl mx-auto">
        <Card className="rounded-3xl border-dashed border-2 border-neutral-300 dark:border-neutral-800/80 bg-background/50 hover:border-emerald-500/50 hover:bg-emerald-500/[0.01] transition-all overflow-hidden">
          <CardContent className="p-10 flex flex-col items-center justify-center text-center space-y-4">
            
            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-md ${
              uploading ? "bg-emerald-500/10 text-emerald-600 animate-pulse" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
            }`}>
              <UploadCloud className="h-7 w-7" />
            </div>

            {scanProgress ? (
              <div className="space-y-2">
                <h3 className="font-bold text-sm text-foreground">{scanProgress}</h3>
                <div className="w-48 h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full mx-auto overflow-hidden relative">
                  <div className="absolute top-0 left-0 h-full bg-emerald-500 animate-infinite-loading w-1/3 rounded-full" />
                </div>
                <p className="text-[10px] text-muted-foreground">This normally takes less than 5 seconds.</p>
              </div>
            ) : (
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-foreground">
                  {isViewer ? "File Upload is Disabled" : "Upload your expense receipt"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Supports JPEG, PNG, and PDF invoice captures under 5MB.
                </p>
              </div>
            )}

            <div className="pt-2">
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleUpload}
                disabled={uploading || isViewer}
                accept="image/*,application/pdf"
                className="hidden"
                id="receipt-file-input"
              />
              <Button 
                disabled={uploading || isViewer}
                onClick={() => fileInputRef.current?.click()}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl px-5 shadow-md shadow-emerald-500/10"
              >
                {uploading ? "AI Reading..." : "Select File"}
              </Button>
            </div>

          </CardContent>
        </Card>
      </div>

      {/* Scanned Receipts History Ledger */}
      <Card className="rounded-2xl border-neutral-200 dark:border-neutral-800/80 overflow-hidden">
        <CardHeader className="bg-muted/10 border-b pb-4">
          <CardTitle className="text-base font-bold">Scanned Documents Audit Logs</CardTitle>
          <CardDescription className="text-xs">
            Review Gemini OCR readings and link them directly to ledger expenses.
          </CardDescription>
        </CardHeader>

        {receipts.length === 0 ? (
          <div className="text-center py-16 flex flex-col items-center justify-center gap-2">
            <FileText className="h-10 w-10 text-neutral-400" />
            <h3 className="font-bold text-sm">No Scanned Documents</h3>
            <p className="text-xs text-muted-foreground max-w-xs">
              Upload a receipt above. Gemini AI will scan it and compile details here.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/20">
              <TableRow>
                <TableHead>Storage Ref</TableHead>
                <TableHead>Merchant</TableHead>
                <TableHead>Extracted Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Extracted Amount</TableHead>
                {!isViewer && <TableHead className="w-36 text-center">Ledger Sync</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {receipts.map((rec) => {
                const isConverted = convertedIds[rec._id] === true;
                return (
                  <TableRow key={rec._id} className="hover:bg-muted/20">
                    <TableCell className="font-mono text-[10px] text-muted-foreground truncate max-w-[120px]">
                      {rec.storageId}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {rec.merchant || (rec.status === "processing" ? "Scanning..." : "—")}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {rec.date ? new Date(rec.date).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        rec.status === "completed" 
                          ? "bg-emerald-500/10 text-emerald-600" 
                          : rec.status === "failed" 
                            ? "bg-rose-500/10 text-rose-600" 
                            : "bg-amber-500/10 text-amber-600"
                      }`}>
                        {rec.status === "completed" ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : rec.status === "failed" ? (
                          <AlertTriangle className="h-3 w-3" />
                        ) : (
                          <Clock className="h-3 w-3" />
                        )}
                        {rec.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-bold text-foreground">
                      {rec.amount ? `$${rec.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "—"}
                    </TableCell>
                    {!isViewer && (
                      <TableCell className="text-center">
                        {rec.status === "completed" ? (
                          <Button 
                            variant="outline" 
                            size="sm"
                            disabled={isConverted}
                            onClick={() => handleConvertToExpense(rec)}
                            className={`text-[10px] font-bold rounded-lg px-2.5 py-1 h-6 transition-all ${
                              isConverted 
                                ? "bg-muted text-muted-foreground cursor-not-allowed border-neutral-200 dark:border-neutral-800"
                                : "border-emerald-200 text-emerald-600 hover:bg-emerald-500/5 dark:border-emerald-900/50"
                            }`}
                          >
                            {isConverted ? (
                              <span className="flex items-center gap-0.5">
                                <CheckCircle className="h-3 w-3 shrink-0" />
                                Synced
                              </span>
                            ) : (
                              <span className="flex items-center gap-0.5">
                                <Plus className="h-3 w-3 shrink-0" />
                                Post Ledger
                              </span>
                            )}
                          </Button>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">—</span>
                        )}
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
