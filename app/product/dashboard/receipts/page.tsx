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
  Receipt,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Doc } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


export default function ReceiptsPage() {
  const { organization, membership } = useOrganization();
  const { isAuthenticated } = useConvexAuth();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Loading and action state
  const [uploading, setUploading] = React.useState(false);
  const [scanProgress, setScanProgress] = React.useState<string | null>(null);
  const [convertedIds, setConvertedIds] = React.useState<Record<string, boolean>>({});

  // Manual OCR verification states
  const [selectedReceipt, setSelectedReceipt] = React.useState<Doc<"receipts"> | null>(null);
  const [isReviewOpen, setIsReviewOpen] = React.useState(false);
  const [reviewMerchant, setReviewMerchant] = React.useState("");
  const [reviewAmount, setReviewAmount] = React.useState("");
  const [reviewCategory, setReviewCategory] = React.useState("Software");
  const [reviewDate, setReviewDate] = React.useState("");
  const [reviewStatus, setReviewStatus] = React.useState<"pending" | "completed">("completed");

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
    } catch (err: unknown) {
      console.error("OCR Scanner failed:", err);
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      alert("AI Scanning failed: " + errorMsg);
      setScanProgress(null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleOpenReview = (receipt: Doc<"receipts">) => {
    setSelectedReceipt(receipt);
    setReviewMerchant(receipt.merchant || "");
    setReviewAmount(receipt.amount?.toString() || "");
    setReviewCategory("Software");
    
    // Format date as YYYY-MM-DD for input type="date"
    const dateObj = receipt.date ? new Date(receipt.date) : new Date();
    const formattedDate = dateObj.toISOString().split("T")[0];
    setReviewDate(formattedDate);
    
    setReviewStatus("completed");
    setIsReviewOpen(true);
  };

  const handleConfirmReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReceipt || isViewer) return;

    const parsedAmount = parseFloat(reviewAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    const epochDate = new Date(reviewDate).getTime();

    try {
      await createTransaction({
        orgId: organization.id,
        type: "expense",
        amount: parsedAmount,
        category: reviewCategory,
        description: `Receipt: ${reviewMerchant}`,
        date: epochDate,
        status: reviewStatus,
      });

      // Mark as successfully converted locally
      setConvertedIds(prev => ({
        ...prev,
        [selectedReceipt._id]: true
      }));

      setIsReviewOpen(false);
      setSelectedReceipt(null);
    } catch (err) {
      console.error("Failed to post receipt transaction:", err);
      alert("Failed to record the transaction.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary animate-spin">
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary dark:text-indigo-400 text-xs font-bold border border-primary/10">
            <Crown className="h-3.5 w-3.5 fill-primary/20" />
            Premium Business Benefit
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-indigo-500 to-indigo-600 bg-clip-text text-transparent pb-1">
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
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary dark:text-indigo-400 mb-3">
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
                Store uploaded receipt proof images directly within Convex&apos;s distributed secure file system forever.
              </p>
            </div>
          </Card>

        </div>

        {/* Upgrade Paywall Panel */}
        <Card className="rounded-3xl border border-primary/20 bg-gradient-to-tr from-primary/5 via-indigo-500/5 to-accent/20 backdrop-blur-lg overflow-hidden shadow-xl p-8 max-w-2xl mx-auto text-center space-y-6">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <Lock className="h-5.5 w-5.5" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-extrabold text-foreground">AI Receipt Scanner is Locked</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Your organization <span className="font-bold text-foreground">{organization.name}</span> is currently on the <span className="capitalize font-bold text-primary">{plan} plan</span>. Upgrade to the B2B Business plan to activate instant AI receipt scanning.
            </p>
          </div>
          <div className="pt-2">
            <Button asChild size="lg" className="bg-primary hover:brightness-110 text-white font-bold rounded-2xl px-8 shadow-md shadow-primary/15">
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
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary dark:text-indigo-400 text-[10px] font-bold border border-primary/10">
              <Sparkles className="h-3 w-3 fill-primary/20" />
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
        <Card className="rounded-3xl border-dashed border-2 border-neutral-300 dark:border-neutral-800/80 bg-background/50 hover:border-primary/50 hover:bg-primary/[0.01] transition-all overflow-hidden">
          <CardContent className="p-10 flex flex-col items-center justify-center text-center space-y-4">
            
            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-md ${
              uploading ? "bg-primary/10 text-primary animate-pulse" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
            }`}>
              <UploadCloud className="h-7 w-7" />
            </div>

            {scanProgress ? (
              <div className="space-y-2">
                <h3 className="font-bold text-sm text-foreground">{scanProgress}</h3>
                <div className="w-48 h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full mx-auto overflow-hidden relative">
                  <div className="absolute top-0 left-0 h-full bg-primary animate-infinite-loading w-1/3 rounded-full" />
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
                className="bg-primary hover:brightness-110 text-white font-semibold rounded-xl px-5 shadow-md shadow-primary/10"
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
                            onClick={() => handleOpenReview(rec)}
                            className={`text-[10px] font-bold rounded-lg px-2.5 py-1 h-6 transition-all ${
                              isConverted 
                                ? "bg-muted text-muted-foreground cursor-not-allowed border-neutral-200 dark:border-neutral-800"
                                : "border-primary/20 text-primary bg-primary/5 hover:bg-primary/10 dark:border-primary/30"
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
        {/* Manual OCR Review & Approval Dialog */}
        <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
          <DialogContent className="sm:max-w-[425px] rounded-2xl">
            <form onSubmit={handleConfirmReview}>
              <DialogHeader>
                <DialogTitle>Review AI OCR Receipt</DialogTitle>
                <DialogDescription>
                  Verify and correct extracted information before committing to the official ledger.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                
                {/* Merchant Name */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="reviewMerchant">Merchant / Payee</Label>
                  <Input 
                    id="reviewMerchant" 
                    value={reviewMerchant}
                    onChange={(e) => setReviewMerchant(e.target.value)}
                    placeholder="e.g. AWS Cloud Services"
                    required
                  />
                </div>

                {/* Amount and Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="reviewAmount">Amount ($)</Label>
                    <Input 
                      id="reviewAmount" 
                      type="number"
                      step="0.01"
                      value={reviewAmount}
                      onChange={(e) => setReviewAmount(e.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="reviewDate">Date</Label>
                    <Input 
                      id="reviewDate" 
                      type="date"
                      value={reviewDate}
                      onChange={(e) => setReviewDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Category and Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="reviewCategory">Expense Category</Label>
                    <Select value={reviewCategory} onValueChange={setReviewCategory}>
                      <SelectTrigger id="reviewCategory">
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
                    <Label htmlFor="reviewStatus">Clearance Status</Label>
                    <Select value={reviewStatus} onValueChange={(val: "pending" | "completed") => setReviewStatus(val)}>
                      <SelectTrigger id="reviewStatus">
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
                  Approve & Post Ledger
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </Card>

    </div>
  );
}
