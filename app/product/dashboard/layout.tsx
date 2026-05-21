"use client";

import React from "react";
import { useAuth, useOrganization, CreateOrganization } from "@clerk/nextjs";
import { DashboardNav } from "@/components/DashboardNav";
import { TrendingUp, Building2, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, userId } = useAuth();
  const { organization, isLoaded: isOrgLoaded } = useOrganization();
  const [showCreateOrg, setShowCreateOrg] = React.useState(false);

  // Loading states
  if (!isLoaded || !isOrgLoaded) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-background text-foreground gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white animate-spin">
          <TrendingUp className="h-6 w-6" />
        </div>
        <span className="text-sm font-semibold tracking-wide animate-pulse">Initializing Antigravity B2B Engine...</span>
      </div>
    );
  }

  // Force Login
  if (!userId) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-background px-4 text-center">
        <h2 className="text-2xl font-bold mb-2">Access Restricted</h2>
        <p className="text-muted-foreground text-sm max-w-sm mb-6">
          You must be authenticated to access your financial accounting dashboard.
        </p>
        <Button asChild className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold">
          <a href="/sign-in">Sign In</a>
        </Button>
      </div>
    );
  }

  // Force Organization selection / creation
  if (!organization) {
    return (
      <div className="flex h-screen w-screen bg-muted/20 items-center justify-center px-4 overflow-y-auto py-8 selection:bg-emerald-500/30">
        <div className="w-full max-w-md bg-background border rounded-3xl p-8 shadow-xl flex flex-col items-center text-center">
          
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-6">
            <Building2 className="h-6 w-6" />
          </div>

          <h2 className="text-2xl font-bold tracking-tight mb-2">Create or Join an Organization</h2>
          <p className="text-muted-foreground text-sm max-w-xs mb-8 leading-relaxed">
            Antigravity Books utilizes Clerk B2B tenancy. To view financial records, please select or create an organization.
          </p>

          {!showCreateOrg ? (
            <div className="flex flex-col gap-3.5 w-full">
              <Button 
                onClick={() => setShowCreateOrg(true)}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10"
              >
                <Plus className="h-4.5 w-4.5" />
                Create New Organization
              </Button>
              <div className="text-xs text-muted-foreground mt-4">
                Already member of an organization? Select one from your user panel.
              </div>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center">
              <CreateOrganization 
                appearance={{
                  elements: {
                    cardBox: "shadow-none border-0 p-0 max-w-full",
                    header: "hidden",
                    navbar: "hidden",
                    formButtonPrimary: "bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold rounded-lg",
                  }
                }}
                afterCreateOrganizationUrl="/product/dashboard"
              />
              <Button 
                variant="ghost" 
                onClick={() => setShowCreateOrg(false)}
                className="mt-4 text-xs text-muted-foreground rounded-lg"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Fully authenticated with an active organization selected
  return (
    <div className="flex h-screen bg-muted/10 overflow-hidden dark:bg-neutral-950/20">
      <DashboardNav />
      {/* Scrollable content panel */}
      <main className="flex-1 md:pl-64 overflow-y-auto h-screen relative flex flex-col">
        {/* Dynamic Org Header */}
        <header className="hidden md:flex h-14 items-center justify-between border-b px-8 bg-background/50 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded-md border border-emerald-500/10">Active Org</span>
            <span className="font-bold text-sm text-foreground">{organization.name}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
            <Sparkles className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
            Accounting Ledger Active
          </div>
        </header>
        {/* Children content page */}
        <div className="flex-1 p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
