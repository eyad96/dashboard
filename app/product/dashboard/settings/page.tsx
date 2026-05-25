"use client";

import React from "react";
import { useOrganization, OrganizationProfile } from "@clerk/nextjs";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { 
  Users, 
  CreditCard, 
  Crown, 
  CheckCircle,
  AlertTriangle,
  Lock,
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PLANS = [
  {
    id: "free" as const,
    name: "Free Tier",
    price: "$0",
    maxSeats: 1,
    features: [
      "1 Member seat limit",
      "Standard ledger registry",
      "Basic Cash Flow analytics",
      "Draft invoice generation"
    ],
    bg: "from-neutral-500/5 to-neutral-400/5",
    border: "border-neutral-200 dark:border-neutral-800"
  },
  {
    id: "pro" as const,
    name: "Pro Accounting",
    price: "$29",
    maxSeats: 5,
    features: [
      "Up to 5 Member seats",
      "Advanced cash flow forecasts",
      "Sales invoices with Net payment terms",
      "Priority system notifications"
    ],
    bg: "from-blue-500/5 to-indigo-500/5",
    border: "border-blue-500/20 dark:border-blue-500/30"
  },
  {
    id: "business" as const,
    name: "Business Suite",
    price: "$99",
    maxSeats: 10,
    features: [
      "Up to 10 Member seats",
      "Gemini AI Receipt OCR scanning",
      "Clerk Custom RBAC controls",
      "Secure cloud storage vaults"
    ],
    bg: "from-primary/5 to-indigo-500/5",
    border: "border-primary/20 dark:border-primary/30"
  }
];

export default function SettingsPage() {
  const { organization, membership } = useOrganization();
  const { isAuthenticated } = useConvexAuth();
  const [activeTab, setActiveTab] = React.useState<"subscription" | "members">("subscription");
  const [upgradingId, setUpgradingId] = React.useState<string | null>(null);

  // Convex hooks
  const orgPlan = useQuery(
    api.orgs.getOrgPlan,
    isAuthenticated && organization?.id ? { orgId: organization.id } : "skip"
  );

  const updateOrgPlan = useMutation(api.orgs.updateOrgPlan);

  if (!organization) return null;

  // Retrieve user roles to enforce access control
  const userRole = membership?.role ?? "";
  const isAdmin = userRole.replace(/^org:/, "") === "admin";

  const currentPlan = orgPlan?.plan ?? "free";
  const currentMaxSeats = PLANS.find(p => p.id === currentPlan)?.maxSeats ?? 1;
  const currentMembersCount = organization.membersCount ?? 1;
  const isSeatExceeded = currentMembersCount > currentMaxSeats;

  const handlePlanUpdate = async (planId: "free" | "pro" | "business", maxSeats: number) => {
    if (!isAdmin) return;
    setUpgradingId(planId);
    try {
      await updateOrgPlan({
        orgId: organization.id,
        plan: planId,
        seats: maxSeats,
      });
    } catch (err) {
      console.error("Failed to upgrade subscription:", err);
      alert("Billing simulation failed.");
    } finally {
      setUpgradingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-2xl font-bold tracking-tight">Organization Profile</h1>
            {!isAdmin && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-500 text-[10px] font-bold border border-amber-500/10">
                <Lock className="h-3 w-3" />
                Billing Locked (Admin Required)
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure billing subscriptions, member seats, and roles for {organization.name}.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-muted p-1 rounded-xl text-xs border shrink-0">
          <button 
            onClick={() => setActiveTab("subscription")}
            className={`flex items-center gap-1.5 px-4 py-2 font-semibold rounded-lg transition-colors ${
              activeTab === "subscription" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <CreditCard className="h-4 w-4" />
            Billing & Seats
          </button>
          <button 
            onClick={() => setActiveTab("members")}
            className={`flex items-center gap-1.5 px-4 py-2 font-semibold rounded-lg transition-colors ${
              activeTab === "members" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="h-4 w-4" />
            B2B Members
          </button>
        </div>
      </div>

      {activeTab === "subscription" ? (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Seat Quota Status Alert Card */}
          <Card className={`rounded-3xl border ${
            isSeatExceeded 
              ? "border-rose-500/20 bg-rose-500/[0.02]" 
              : "border-emerald-500/20 bg-emerald-500/[0.02]"
          }`}>
            <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`p-1.5 rounded-lg flex items-center justify-center ${
                    isSeatExceeded ? "bg-rose-500/10 text-rose-600" : "bg-emerald-500/10 text-emerald-600"
                  }`}>
                    {isSeatExceeded ? <AlertTriangle className="h-4.5 w-4.5" /> : <ShieldCheck className="h-4.5 w-4.5" />}
                  </span>
                  <h3 className="font-bold text-sm">
                    {isSeatExceeded ? "Member Seats Quota Exceeded!" : "Seat Quota Allocation is Healthy"}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground max-w-xl">
                  {isSeatExceeded 
                    ? `Your organization currently has ${currentMembersCount} active members, which exceeds your active ${currentPlan} plan allowance of ${currentMaxSeats} seat. Please upgrade your plan below to restore compliance.`
                    : `Active member seats count: ${currentMembersCount} of ${currentMaxSeats} allowed on the ${currentPlan} plan.`
                  }
                </p>
                
                {/* Progress bar */}
                <div className="pt-2">
                  <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${isSeatExceeded ? "bg-rose-500 animate-pulse" : "bg-emerald-500"}`}
                      style={{ width: `${Math.min((currentMembersCount / currentMaxSeats) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-muted-foreground mt-1.5 font-medium">
                    <span>{currentMembersCount} Active Members</span>
                    <span>Max Capacity: {currentMaxSeats} Seats</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing cards */}
          <div className="space-y-4">
            <h3 className="font-bold text-base flex items-center gap-1.5">
              <Crown className="h-5 w-5 text-primary fill-primary/10" />
              Available Accounting Plans
            </h3>
            
            <div className="grid gap-6 md:grid-cols-3">
              {PLANS.map((plan) => {
                const isSelected = currentPlan === plan.id;
                const isUpgrading = upgradingId === plan.id;
                
                return (
                  <Card 
                    key={plan.id} 
                    className={`rounded-2xl border ${plan.border} bg-gradient-to-br ${plan.bg} p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative ${
                      isSelected ? "ring-2 ring-primary ring-offset-2 dark:ring-offset-background" : ""
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-3 right-3 flex items-center gap-1 bg-primary text-white font-bold text-[9px] uppercase px-2 py-0.5 rounded-full shadow-sm">
                        <CheckCircle className="h-2.5 w-2.5" />
                        Active
                      </span>
                    )}

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-extrabold text-sm text-foreground capitalize">{plan.name}</h4>
                        <div className="flex items-baseline mt-1 gap-1">
                          <span className="text-3xl font-extrabold text-foreground">{plan.price}</span>
                          <span className="text-[10px] text-muted-foreground">/ month</span>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-2">Features Included</span>
                        <ul className="space-y-1.5 text-xs text-muted-foreground">
                          {plan.features.map((feat, i) => (
                            <li key={i} className="flex items-center gap-1.5">
                              <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-6">
                      <Button
                        disabled={isSelected || !isAdmin || isUpgrading}
                        onClick={() => handlePlanUpdate(plan.id, plan.maxSeats)}
                        className={`w-full font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all ${
                          isSelected 
                            ? "bg-primary/10 text-primary dark:text-indigo-400 font-bold border cursor-default" 
                            : !isAdmin 
                              ? "bg-neutral-100 text-neutral-400 cursor-not-allowed dark:bg-neutral-800"
                              : "bg-primary hover:brightness-110 text-white shadow-primary/10"
                        }`}
                      >
                        {isUpgrading ? (
                          "Updating plan..."
                        ) : isSelected ? (
                          "Current Plan"
                        ) : !isAdmin ? (
                          <span className="flex items-center gap-1">
                            <Lock className="h-3 w-3" />
                            Admin Locked
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            Select Plan
                            <ArrowRight className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
          
        </div>
      ) : (
        <div className="p-4 border rounded-3xl bg-background/50 backdrop-blur-sm animate-in fade-in duration-300">
          <span className="text-[10px] uppercase font-bold text-primary dark:text-indigo-400 flex items-center gap-1 mb-4 px-2">
            <ShieldCheck className="h-3.5 w-3.5" />
            Clerk B2B Team Directory
          </span>
          <OrganizationProfile 
            routing="hash"
            appearance={{
              elements: {
                rootBox: "w-full mx-auto",
                cardBox: "shadow-none border rounded-2xl w-full mx-auto bg-transparent",
                navbar: "hidden", // Simplify interface inside dashboard
                pageScrollableContent: "w-full p-2 sm:p-6",
                profileSectionTitleText: "font-bold text-sm tracking-tight",
                membersPageHeader: "hidden",
                headerTitle: "font-extrabold text-lg",
                headerSubtitle: "text-xs text-muted-foreground",
                organizationProfile: "w-full max-w-none"
              }
            }}
          />
        </div>
      )}

    </div>
  );
}
