"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { 
  LayoutDashboard, 
  Receipt, 
  FileSpreadsheet, 
  ScanLine, 
  Settings2, 
  MessageSquareCode, 
  Menu,
  X,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/product/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/product/dashboard/transactions", label: "Transactions", icon: FileSpreadsheet },
  { href: "/product/dashboard/invoices", label: "Invoices", icon: Receipt },
  { href: "/product/dashboard/receipts", label: "AI Receipt Scanner", icon: ScanLine },
  { href: "/product/dashboard/settings", label: "Org & Billing Settings", icon: Settings2 },
  { href: "/product", label: "Developer Chat Feed", icon: MessageSquareCode },
];

export function DashboardNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      {/* Mobile Header Bar */}
      <header className="flex h-14 items-center justify-between border-b bg-background/80 backdrop-blur-md px-4 md:hidden sticky top-0 z-40 w-full">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary font-bold" />
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">ECompany Books</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </header>

      {/* Sidebar Overlay on Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 border-r bg-background/70 backdrop-blur-xl transition-transform duration-300 md:translate-x-0 flex flex-col justify-between p-4",
        isOpen ? "translate-x-0" : "-translate-x-full md:block",
        "h-screen"
      )}>
        <div className="flex flex-col gap-6">
          {/* QuickBooks-like Brand Header */}
          <div className="flex items-center gap-2.5 px-2 py-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-indigo-500 text-white shadow-md shadow-primary/20">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-none tracking-tight">ECompany Books</h1>
              <p className="text-[10px] text-muted-foreground mt-0.5">B2B Accounting Hub</p>
            </div>
          </div>

          {/* B2B Tenant Organization Switcher */}
          <div className="border-y py-3.5 px-1 bg-muted/40 rounded-lg">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground block mb-2 px-1">Active Organization</span>
            <OrganizationSwitcher 
              appearance={{
                elements: {
                  rootBox: "w-full",
                  organizationSwitcherTrigger: "w-full flex justify-between items-center bg-background border px-3 py-1.5 rounded-md shadow-sm text-sm hover:bg-accent/50 transition-colors",
                  organizationSwitcherTriggerTitle: "font-medium text-left truncate text-sm max-w-[130px]",
                  organizationPreview: "w-full gap-2",
                  organizationPreviewTextContainer: "text-left"
                }
              }}
              createOrganizationUrl="/product/dashboard/settings"
            />
          </div>

          {/* Sidebar Navigation items */}
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                    isActive 
                      ? "bg-primary/10 text-primary font-semibold shadow-sm shadow-primary/5" 
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <Icon className={cn("h-4.5 w-4.5 transition-transform group-hover:scale-105", isActive ? "text-primary" : "text-muted-foreground")} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer User Button */}
        <div className="border-t pt-4 flex items-center justify-between bg-background/50 rounded-lg p-2.5 shadow-sm border">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <UserButton 
              appearance={{
                elements: {
                  userButtonBox: "h-8 w-8 hover:scale-105 transition-transform"
                }
              }}
            />
            <div className="flex flex-col overflow-hidden text-left">
              <span className="text-xs font-semibold text-foreground truncate">My Profile</span>
              <span className="text-[10px] text-muted-foreground truncate">Manage Profile</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
