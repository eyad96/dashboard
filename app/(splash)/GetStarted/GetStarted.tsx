"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Receipt, 
  Users, 
  BrainCircuit, 
  Check, 
  Zap, 
  Sparkles
} from "lucide-react";

export const GetStarted = () => {
  return (
    <div className="flex grow flex-col bg-background text-foreground selection:bg-primary/30">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-24 border-b">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-background to-indigo-500/5 -z-10" />
        <div className="container px-4 text-center max-w-4xl mx-auto flex flex-col items-center">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-primary/5 border-primary/20 text-primary dark:text-indigo-400 text-xs font-semibold mb-6 animate-pulse">
            <Sparkles className="h-3 w-3" />
            Next-Gen B2B Ledger Infrastructure
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-none mb-6">
            Smart Accounting for
            <span className="block mt-2 bg-gradient-to-r from-primary via-indigo-500 to-indigo-600 bg-clip-text text-transparent">
              Modern Organizations
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
            Manage ledgers, generate elegant invoices, delegate permissions with Clerk RBAC, and automate receipt tracking using Gemini-powered AI OCR. Built for seamless B2B scaling.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-14">
            <Button asChild size="lg" className="bg-primary hover:brightness-110 text-white font-semibold shadow-lg shadow-primary/20 rounded-xl px-8">
              <Link href="/product/dashboard">Go to B2B Dashboard</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-xl px-8 border-neutral-300 dark:border-neutral-800">
              <Link href="/product">Developer Chat Feed</Link>
            </Button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border rounded-2xl p-6 bg-background/50 backdrop-blur-md w-full max-w-3xl">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary dark:text-indigo-400">99.9%</div>
              <div className="text-xs text-muted-foreground mt-0.5">Real-time Sync</div>
            </div>
            <div className="text-center border-l">
              <div className="text-2xl font-bold text-primary dark:text-indigo-400">&lt; 2s</div>
              <div className="text-xs text-muted-foreground mt-0.5">AI OCR Scanning</div>
            </div>
            <div className="text-center border-l">
              <div className="text-2xl font-bold text-primary dark:text-indigo-400">100%</div>
              <div className="text-xs text-muted-foreground mt-0.5">B2B Org-Isolated</div>
            </div>
            <div className="text-center border-l">
              <div className="text-2xl font-bold text-primary dark:text-indigo-400">Zero</div>
              <div className="text-xs text-muted-foreground mt-0.5">Data Leaks</div>
            </div>
          </div>

        </div>
      </section>

      {/* Feature Pillars */}
      <section className="py-20 bg-muted/20">
        <div className="container px-4 max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center tracking-tight mb-14">
            Powerful B2B Pillars Built from Scratch
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col gap-4 p-6 bg-background border rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary dark:text-indigo-400">
                <Users className="h-5.5 w-5.5" />
              </div>
              <h3 className="font-bold text-lg">Clerk Multi-Tenant & RBAC</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Partition bookkeeping automatically. Assign dedicated roles such as **Accountants** (write ledger access) and **Viewers** (read-only graphs).
              </p>
            </div>

            <div className="flex flex-col gap-4 p-6 bg-background border rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <BrainCircuit className="h-5.5 w-5.5" />
              </div>
              <h3 className="font-bold text-lg">Gemini AI OCR Scanner</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Upload business receipts to scan them. Our integrated Gemini structured model parses merchant names, totals, and timestamps into the ledger.
              </p>
            </div>

            <div className="flex flex-col gap-4 p-6 bg-background border rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary dark:text-indigo-400">
                <Receipt className="h-5.5 w-5.5" />
              </div>
              <h3 className="font-bold text-lg">Elegant Seat-Based Invoicing</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Configure Clerk seat-based billing so plans automatically adjust price based on your active team member count.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Matrix Section */}
      <section className="py-20 border-t">
        <div className="container px-4 max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
              Flexible Plans to Fuel B2B Scaling
            </h2>
            <p className="text-muted-foreground">
              Integrate Clerk Billing with Stripe dynamically. All plans scale with active organization seats.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-start">
            
            {/* Free Tier */}
            <Card className="border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm">
              <CardHeader className="p-6">
                <CardTitle className="text-xl font-bold">Free Plan</CardTitle>
                <CardDescription className="text-xs">Ideal for solopreneurs</CardDescription>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold">$0</span>
                  <span className="text-muted-foreground text-xs">/ month</span>
                </div>
                <div className="text-[10px] font-semibold text-primary dark:text-indigo-400 mt-2">Max 1 seat quota</div>
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-0 flex flex-col gap-3">
                <hr />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>Read-only Dashboard</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>Basic Cash Flow charts</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground line-through opacity-40">
                  <XIcon className="h-4 w-4 shrink-0" />
                  <span>Multi-Seat Accountant Roles</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground line-through opacity-40">
                  <XIcon className="h-4 w-4 shrink-0" />
                  <span>Gemini AI Receipt OCR</span>
                </div>
              </CardContent>
              <CardFooter className="px-6 pb-6">
                <Button asChild className="w-full bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-background font-semibold rounded-xl">
                  <Link href="/product/dashboard">Start Free</Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Pro Tier */}
            <Card className="border-primary rounded-2xl shadow-lg relative bg-background">
              <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 px-3 py-1 rounded-full bg-primary text-white font-bold text-[10px] uppercase tracking-wider shadow-sm">
                Most Popular
              </div>
              <CardHeader className="p-6">
                <CardTitle className="text-xl font-bold flex items-center gap-1.5">
                  Pro Plan 
                  <Zap className="h-4 w-4 text-primary fill-primary" />
                </CardTitle>
                <CardDescription className="text-xs">Perfect for scaling teams</CardDescription>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold">$19</span>
                  <span className="text-muted-foreground text-xs">/ month</span>
                </div>
                <div className="text-[10px] font-semibold text-primary dark:text-indigo-400 mt-2">+ $5/month per additional seat</div>
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-0 flex flex-col gap-3">
                <hr />
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>Unlimited Ledger Transactions</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>Interactive Invoicing Dashboard</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>Clerk Accountant/Viewer RBAC</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground line-through opacity-40">
                  <XIcon className="h-4 w-4 shrink-0" />
                  <span>Gemini AI Receipt OCR</span>
                </div>
              </CardContent>
              <CardFooter className="px-6 pb-6">
                <Button asChild className="w-full bg-primary hover:brightness-110 text-white font-semibold rounded-xl shadow-md shadow-primary/10">
                  <Link href="/product/dashboard">Upgrade to Pro</Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Business Tier */}
            <Card className="border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm">
              <CardHeader className="p-6">
                <CardTitle className="text-xl font-bold flex items-center gap-1.5">
                  Business Plan
                  <Sparkles className="h-4 w-4 text-primary fill-primary" />
                </CardTitle>
                <CardDescription className="text-xs">Advanced features & automation</CardDescription>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold">$49</span>
                  <span className="text-muted-foreground text-xs">/ month</span>
                </div>
                <div className="text-[10px] font-semibold text-primary dark:text-indigo-400 mt-2">+ $10/month per additional seat</div>
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-0 flex flex-col gap-3">
                <hr />
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span className="font-semibold text-primary dark:text-indigo-400">Gemini AI Receipt Scanner (OCR)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>Unlimited Invoices & Transactions</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>Advanced B2B Seat Billing Allocation</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>Priority Premium Support 24/7</span>
                </div>
              </CardContent>
              <CardFooter className="px-6 pb-6">
                <Button asChild className="w-full bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-background font-semibold rounded-xl">
                  <Link href="/product/dashboard">Go Business</Link>
                </Button>
              </CardFooter>
            </Card>

          </div>
        </div>
      </section>

      {/* Helpful Links footer */}
      <footer className="border-t py-12 bg-neutral-50 dark:bg-neutral-950/20">
        <div className="container px-4 text-center max-w-md mx-auto text-xs text-muted-foreground">
          <p>© 2026 ECompany Books Inc. All rights reserved.</p>
          <p className="mt-2">
            Secure multi-tenant operations mapped over Convex endpoints.
          </p>
        </div>
      </footer>

    </div>
  );
};

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}
