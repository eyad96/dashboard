"use client";

import React from "react";
import { useAuth, useOrganization, CreateOrganization } from "@clerk/nextjs";
import { DashboardNav } from "@/components/DashboardNav";
import { TrendingUp, Building2, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import { DeveloperModeProvider, useDeveloperMode } from "@/components/DeveloperModeContext";
import { DeveloperConsole } from "@/components/DeveloperConsole";
import { Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

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
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-indigo-500 text-white animate-spin">
          <TrendingUp className="h-6 w-6" />
        </div>
        <span className="text-sm font-semibold tracking-wide animate-pulse">Initializing ECompany B2B Engine...</span>
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
        <Button asChild className="bg-primary hover:brightness-110 text-white font-semibold">
          <Link href="/sign-in">Sign In</Link>
        </Button>
      </div>
    );
  }

  // Force Organization selection / creation
  if (!organization) {
    return (
      <div className="flex h-screen w-screen bg-muted/20 items-center justify-center px-4 overflow-y-auto py-8 selection:bg-primary/30">
        <div className="w-full max-w-md bg-background border rounded-3xl p-8 shadow-xl flex flex-col items-center text-center">
          
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6">
            <Building2 className="h-6 w-6" />
          </div>
 
          <h2 className="text-2xl font-bold tracking-tight mb-2">Create or Join an Organization</h2>
          <p className="text-muted-foreground text-sm max-w-xs mb-8 leading-relaxed">
            ECompany Books utilizes Clerk B2B tenancy. To view financial records, please select or create an organization.
          </p>

          {!showCreateOrg ? (
            <div className="flex flex-col gap-3.5 w-full">
              <Button 
                onClick={() => setShowCreateOrg(true)}
                className="w-full bg-primary hover:brightness-110 text-white font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-primary/10"
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
                    formButtonPrimary: "bg-primary hover:brightness-110 text-sm font-semibold rounded-lg",
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

  return (
    <DeveloperModeProvider>
      <DashboardLayoutContent organization={organization}>
        {children}
      </DashboardLayoutContent>
    </DeveloperModeProvider>
  );
}

function DashboardLayoutContent({ 
  children,
  organization
}: { 
  children: React.ReactNode;
  organization: { id: string; name: string };
}) {
  const { isDevMode, setIsDevMode, styleOptions } = useDeveloperMode();

  return (
    <div className={cn(
      "flex h-screen bg-muted/10 overflow-hidden dark:bg-neutral-950/20 transition-all",
      styleOptions.accentTheme === "emerald" && "[--primary:142_76%_36%] [--primary-foreground:355_0%_100%]",
      styleOptions.accentTheme === "amber" && "[--primary:38_92%_50%] [--primary-foreground:180_0%_0%]",
      styleOptions.accentTheme === "rose" && "[--primary:346_84%_50%] [--primary-foreground:355_0%_100%]",
      styleOptions.accentTheme === "sapphire" && "[--primary:221_83%_53%] [--primary-foreground:355_0%_100%]"
    )}>
      <DashboardNav />
      {/* Scrollable content panel */}
      <main className="flex-1 md:pl-64 overflow-hidden h-screen relative flex flex-col">
        {/* Dynamic Org Header */}
        <header className="hidden md:flex h-14 items-center justify-between border-b px-8 bg-background/50 backdrop-blur-md sticky top-0 z-30 shrink-0">
          
          <div className="flex items-center gap-3">
            <span className="text-xs bg-primary/15 text-primary font-semibold px-2 py-0.5 rounded-md border border-primary/10">Active Org</span>
            <span className="font-bold text-sm text-foreground">{organization.name}</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Developer Switcher Badge */}
            <button
              onClick={() => setIsDevMode(!isDevMode)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 text-[11px] font-mono rounded-lg border transition-all font-bold tracking-wide shadow-sm shrink-0",
                isDevMode 
                  ? "bg-indigo-600 hover:bg-indigo-500 border-indigo-500 text-white"
                  : "bg-zinc-950 hover:bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
              )}
            >
              <Terminal className="h-3.5 w-3.5" />
              <span>{isDevMode ? "DEV IDE: ACTIVE" : "🔌 DEVELOPER IDE MODE"}</span>
            </button>

            <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
              <Sparkles className="h-4.5 w-4.5 text-primary shrink-0" />
              Accounting Ledger Active
            </div>
          </div>

        </header>

        {/* Dynamic Split flex layout */}
        <div className="flex-1 flex min-h-0 overflow-hidden relative">
          
          {/* Left Pane: children page */}
          <div className={cn(
            "flex-1 overflow-y-auto min-w-0 transition-all",
            styleOptions.gridStyle === "dots" && "bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#1f2937_1.2px,transparent_1.2px)]",
            styleOptions.gridStyle === "grid" && "bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)]",
            // Apply border-radius override classes dynamically to target children cards
            "[&_.rounded-2xl]:rounded-none [&_.rounded-3xl]:rounded-none [&_.rounded-xl]:rounded-none",
            styleOptions.borderRadius === "rounded" && "[&_.rounded-2xl]:rounded-lg [&_.rounded-3xl]:rounded-lg [&_.rounded-xl]:rounded-lg",
            styleOptions.borderRadius === "premium" && "[&_.rounded-2xl]:rounded-2xl [&_.rounded-3xl]:rounded-2xl [&_.rounded-xl]:rounded-xl",
            styleOptions.borderRadius === "extra" && "[&_.rounded-2xl]:rounded-3xl [&_.rounded-3xl]:rounded-3xl [&_.rounded-xl]:rounded-2xl",
            // Glow intensity dynamic mappings
            styleOptions.glowIntensity === "neon" && "[&_div.border]:shadow-lg [&_div.border]:shadow-primary/5 [&_div.border]:border-primary/30"
          )}>
            <div className="p-6 md:p-8">
              {children}
            </div>
          </div>

          {/* Right Pane: Slideout dark-themed console */}
          {isDevMode && (
            <div className="w-[420px] lg:w-[480px] h-full border-l border-zinc-900 overflow-hidden hidden md:block shrink-0 animate-in slide-in-from-right duration-300">
              <DeveloperConsole />
            </div>
          )}

        </div>

      </main>
    </div>
  );
}
