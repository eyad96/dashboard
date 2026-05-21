# Graph Report - dashboard  (2026-05-21)

## Corpus Check
- 115 files · ~57,518 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 794 nodes · 970 edges · 52 communities (45 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c70a5bba`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Chat & Theme UI|Chat & Theme UI]]
- [[_COMMUNITY_Convex Quickstart & Setup|Convex Quickstart & Setup]]
- [[_COMMUNITY_Convex Performance Best Practices|Convex Performance Best Practices]]
- [[_COMMUNITY_Package Dependencies|Package Dependencies]]
- [[_COMMUNITY_Convex Backend API Router|Convex Backend API Router]]
- [[_COMMUNITY_Convex Query Optimization|Convex Query Optimization]]
- [[_COMMUNITY_Asset Build Metadata|Asset Build Metadata]]
- [[_COMMUNITY_Database Migration Utilities|Database Migration Utilities]]
- [[_COMMUNITY_Data Transaction Guidelines|Data Transaction Guidelines]]
- [[_COMMUNITY_Reusable Convex Component Patterns|Reusable Convex Component Patterns]]
- [[_COMMUNITY_Schema Update Operations|Schema Update Operations]]
- [[_COMMUNITY_Convex Write Conflict Avoidance|Convex Write Conflict Avoidance]]
- [[_COMMUNITY_DB Structural Migrations|DB Structural Migrations]]
- [[_COMMUNITY_Project TypeScript Configuration|Project TypeScript Configuration]]
- [[_COMMUNITY_App Directory Alias Config|App Directory Alias Config]]
- [[_COMMUNITY_Clerk Webhook Signature Verification|Clerk Webhook Signature Verification]]
- [[_COMMUNITY_GetStarted Landing Page Components|GetStarted Landing Page Components]]
- [[_COMMUNITY_Performance Auditing Checklist|Performance Auditing Checklist]]
- [[_COMMUNITY_Convex tsconfig Settings|Convex tsconfig Settings]]
- [[_COMMUNITY_User Identity & Authentication|User Identity & Authentication]]
- [[_COMMUNITY_Subcomponent Interfaces|Subcomponent Interfaces]]
- [[_COMMUNITY_Auth Setup Checklist|Auth Setup Checklist]]
- [[_COMMUNITY_Auth0 Identity Setup|Auth0 Identity Setup]]
- [[_COMMUNITY_Clerk Identity Setup|Clerk Identity Setup]]
- [[_COMMUNITY_WorkOS Identity Setup|WorkOS Identity Setup]]
- [[_COMMUNITY_External Deployment Resources|External Deployment Resources]]
- [[_COMMUNITY_Convex Deployment Config|Convex Deployment Config]]
- [[_COMMUNITY_Convex Packaging Guidelines|Convex Packaging Guidelines]]
- [[_COMMUNITY_Local Convex Components Setup|Local Convex Components Setup]]
- [[_COMMUNITY_Convex AI Tools Integration|Convex AI Tools Integration]]
- [[_COMMUNITY_Convex Generated Database Types|Convex Generated Database Types]]
- [[_COMMUNITY_Convex Context Types|Convex Context Types]]
- [[_COMMUNITY_Convex Function Boilerplate|Convex Function Boilerplate]]
- [[_COMMUNITY_Hybrid Component Guidelines|Hybrid Component Guidelines]]
- [[_COMMUNITY_Boilerplate App Metadata|Boilerplate App Metadata]]
- [[_COMMUNITY_Agent Workspace Hashes|Agent Workspace Hashes]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 49|Community 49]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 22 edges
2. `compilerOptions` - 16 edges
3. `GetStarted()` - 13 edges
4. `Button` - 13 edges
5. `compilerOptions` - 13 edges
6. `Convex Guidelines` - 13 edges
7. `Convex Create Component` - 12 edges
8. `Convex Quickstart` - 12 edges
9. `Convex guidelines` - 12 edges
10. `Migrations Component Reference` - 11 edges

## Surprising Connections (you probably didn't know these)
- `cn()` --calls--> `clsx`  [INFERRED]
  lib/utils.ts → package.json
- `MenuLink()` --calls--> `cn()`  [EXTRACTED]
  app/product/layout.tsx → lib/utils.ts
- `DialogHeader()` --calls--> `cn()`  [EXTRACTED]
  components/ui/dialog.tsx → lib/utils.ts
- `DialogFooter()` --calls--> `cn()`  [EXTRACTED]
  components/ui/dialog.tsx → lib/utils.ts
- `DropdownMenuShortcut()` --calls--> `cn()`  [EXTRACTED]
  components/ui/dropdown-menu.tsx → lib/utils.ts

## Communities (52 total, 7 thin omitted)

### Community 0 - "Chat & Theme UI"
Cohesion: 0.08
Nodes (26): ChatIntro(), Message(), names, randomName(), convex, DashboardNav(), navItems, ThemeToggle() (+18 more)

### Community 1 - "Convex Quickstart & Setup"
Cohesion: 0.05
Nodes (39): Advanced Patterns, Authentication and environment access, Checklist, Choose the Shape, Client-facing API, code:ts (// convex/components/notifications/convex.config.ts), code:ts (// Bad: parent app table IDs are not valid component validat), code:ts (// Good: treat parent-owned IDs as strings at the boundary) (+31 more)

### Community 2 - "Convex Performance Best Practices"
Cohesion: 0.05
Nodes (38): 1. Push Filters To Storage, 2. Minimize Data Sources, 3. Minimize Row Size, 4. Isolate Frequently-Updated Fields, 5. Match Consistency To Read Patterns, Aggregates, Backfills, Check for redundant indexes (+30 more)

### Community 3 - "Package Dependencies"
Cohesion: 0.07
Nodes (29): code:typescript (import { mutation } from "./_generated/server";), code:typescript (import { defineSchema, defineTable } from "convex/server";), Validators, code:ts (import { defineSchema, defineTable } from "convex/server";), code:ts (import { query, mutation } from "./_generated/server";), code:tsx (import { useQuery, useMutation } from "convex/react";), Writing Your First Function, Adding a Required Field (+21 more)

### Community 4 - "Convex Backend API Router"
Cohesion: 0.04
Nodes (44): dependencies, class-variance-authority, @clerk/nextjs, clsx, convex, lucide-react, next, next-themes (+36 more)

### Community 5 - "Convex Query Optimization"
Cohesion: 0.06
Nodes (37): Agent Mode, Checklist, code:bash (npm create convex@latest my-app -- -t owner/repo), code:bash (npx convex dev --once), code:tsx (// Bad: re-creates the client on every render), code:tsx (// src/main.tsx), code:tsx (// app/ConvexClientProvider.tsx), code:tsx (// app/layout.tsx) (+29 more)

### Community 6 - "Asset Build Metadata"
Cohesion: 0.06
Nodes (32): 1. Use point-in-time reads when live updates are not valuable, 2. Batch related data into fewer queries, 3. Use skip to avoid unnecessary subscriptions, 4. Isolate frequently-updated fields into separate documents, 5. Use the aggregate component for counts and sums, 6. Narrow query read sets, 7. Remove `Date.now()` from queries, 8. Consider pagination strategy (+24 more)

### Community 7 - "Database Migration Utilities"
Cohesion: 0.06
Nodes (30): 1. Bound your reads, 2. Read smaller shapes, 3. Break large mutations into batches, 4. Move heavy work to actions, 5. Trim return values, 6. Replace `ctx.runQuery` and `ctx.runMutation` with helper functions, 7. Avoid unnecessary `runAction` calls, code:ts (// Bad: unbounded read, breaks as the table grows) (+22 more)

### Community 8 - "Data Transaction Guidelines"
Cohesion: 0.06
Nodes (33): code:bash (npm install convex), Install, Cancel a Running Migration, Check Migration Status, code:bash (npm install @convex-dev/migrations), code:bash (npx convex run migrations:runIt '{"dryRun": true}'), code:bash (npx convex run --component migrations lib:getStatus --watch), code:bash (npx convex run --component migrations lib:cancel '{"name": ") (+25 more)

### Community 9 - "Reusable Convex Component Patterns"
Cohesion: 0.08
Nodes (26): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+18 more)

### Community 10 - "Schema Update Operations"
Cohesion: 0.07
Nodes (36): Action guidelines, Authentication guidelines, code:typescript (import { httpRouter } from "convex/server";), code:ts (import { cronJobs } from "convex/server";), code:typescript (/// <reference types="vite/client" />), code:block12 (import { query } from "./_generated/server";), code:block4 (export const f = query({), code:ts (import { v } from "convex/values";) (+28 more)

### Community 11 - "Convex Write Conflict Avoidance"
Cohesion: 0.09
Nodes (21): 1. Reduce read set size, 2. Split hot documents, 3. Move non-critical work to scheduled functions, 4. Combine competing writes, Broad read sets causing false conflicts, code:ts (// Bad: broad scan creates a wide conflict surface), code:ts (// Good: indexed query touches only relevant documents), code:ts (// Bad: every vote increments the same counter document) (+13 more)

### Community 12 - "DB Structural Migrations"
Cohesion: 0.10
Nodes (20): Adding Index, Adding New Table, Adding Optional Field, Breaking Changes: The Deployment Workflow, code:typescript (// Before), code:typescript (posts: defineTable({), code:typescript (users: defineTable({), Common Migration Patterns (+12 more)

### Community 13 - "Project TypeScript Configuration"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 14 - "App Directory Alias Config"
Cohesion: 0.08
Nodes (24): body, http, svixId, svixSignature, svixTimestamp, wh, createInvoice, listInvoices (+16 more)

### Community 15 - "Clerk Webhook Signature Verification"
Cohesion: 0.12
Nodes (15): 1. Scope the problem, 2. Trace the full read and write set, 3. Apply fixes from the relevant reference, 4. Fix sibling functions together, 5. Verify before finishing, Checklist, Convex Performance Audit, Escalate Larger Fixes (+7 more)

### Community 16 - "GetStarted Landing Page Components"
Cohesion: 0.12
Nodes (15): compilerOptions, allowJs, allowSyntheticDefaultImports, forceConsistentCasingInFileNames, isolatedModules, jsx, lib, module (+7 more)

### Community 17 - "Performance Auditing Checklist"
Cohesion: 0.09
Nodes (37): computedHash, computedHash, skillPath, source, sourceType, computedHash, skillPath, source (+29 more)

### Community 18 - "Convex tsconfig Settings"
Cohesion: 0.07
Nodes (39): Chat(), MessageList(), CashFlowChart(), CashFlowChartProps, Code(), InvoiceStatusChart(), InvoiceStatusChartProps, components (+31 more)

### Community 19 - "User Identity & Authentication"
Cohesion: 0.15
Nodes (12): After Choosing a Provider, Checklist, code:ts (// Bad: trusting a client-provided userId), code:ts (// Good: verifying identity server-side), Convex Authentication Setup, Core Pattern: Protecting Backend Functions, First Step: Choose the Auth Provider, Provider References (+4 more)

### Community 20 - "Subcomponent Interfaces"
Cohesion: 0.18
Nodes (10): Auth0, Checklist, Concrete Steps, Files and Env Vars To Expect, Gotchas, Key Setup Areas, Production, Validation (+2 more)

### Community 21 - "Auth Setup Checklist"
Cohesion: 0.18
Nodes (10): Checklist, Clerk, Concrete Steps, Files and Env Vars To Expect, Gotchas, Key Setup Areas, Production, Validation (+2 more)

### Community 22 - "Auth0 Identity Setup"
Cohesion: 0.17
Nodes (11): Checklist, Concrete Steps, Convex Auth, Expected Files and Decisions, Gotchas, Human Handoff, Production, Validation (+3 more)

### Community 23 - "Clerk Identity Setup"
Cohesion: 0.18
Nodes (10): Checklist, Concrete Steps, Files and Env Vars To Expect, Gotchas, Key Setup Areas, Production, Validation, What To Do (+2 more)

### Community 24 - "WorkOS Identity Setup"
Cohesion: 0.20
Nodes (9): Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details., code:block1 (npm install), code:block2 (npm create convex@latest -- -t nextjs-shadcn), Deploy on Vercel, Deploy on Vercel, Get started, Join the community, Learn more (+1 more)

### Community 25 - "External Deployment Resources"
Cohesion: 0.25
Nodes (7): Build Flow, Checklist, Default Approach, Package Exports, Packaged Convex Components, Testing, When to Choose This

### Community 26 - "Convex Deployment Config"
Cohesion: 0.29
Nodes (6): Checklist, code:text (convex/), Default Layout, Local Convex Components, When to Choose This, Workflow Notes

### Community 27 - "Convex Packaging Guidelines"
Cohesion: 0.33
Nodes (5): ActionCtx, DatabaseReader, DatabaseWriter, MutationCtx, QueryCtx

### Community 28 - "Local Convex Components Setup"
Cohesion: 0.33
Nodes (5): code:bash (npx convex ai-files install), Convex, Route to the Right Skill, Start Here, When Not to Use

### Community 29 - "Convex AI Tools Integration"
Cohesion: 0.33
Nodes (5): Checklist, Default Advice, Hybrid Convex Components, Risks, What This Means

### Community 30 - "Convex Generated Database Types"
Cohesion: 0.40
Nodes (3): geistMono, geistSans, metadata

### Community 31 - "Convex Context Types"
Cohesion: 0.40
Nodes (4): agentSkillsSha, agentsMdSectionHash, claudeMdHash, guidelinesHash

### Community 32 - "Convex Function Boilerplate"
Cohesion: 0.33
Nodes (5): code:ts (// convex/myFunctions.ts), code:ts (const data = useQuery(api.myFunctions.myQueryFunction, {), code:ts (// convex/myFunctions.ts), code:ts (const mutation = useMutation(api.myFunctions.myMutationFunct), Welcome to your Convex functions directory!

### Community 33 - "Hybrid Component Guidelines"
Cohesion: 0.33
Nodes (4): DataModel, Doc, Id, TableNames

### Community 34 - "Boilerplate App Metadata"
Cohesion: 0.50
Nodes (3): Answer, Q: Why does cn() connect Chat & Theme UI to GetStarted Landing Page Components?, Source Nodes

### Community 35 - "Agent Workspace Hashes"
Cohesion: 0.67
Nodes (3): Convex Backend, Convex AI Guidelines, Convex + Next.js App

### Community 36 - "Community 36"
Cohesion: 0.50
Nodes (3): AI Agent Rules, Project Status, قوانين المطور المساعد (AI Agent Rules)

## Knowledge Gaps
- **462 isolated node(s):** `extends`, `$schema`, `style`, `rsc`, `tsx` (+457 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Convex Quickstart` connect `Convex Query Optimization` to `Package Dependencies`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Why does `cn()` connect `Chat & Theme UI` to `Convex tsconfig Settings`, `Convex Backend API Router`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **What connects `extends`, `$schema`, `style` to the rest of the system?**
  _462 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Chat & Theme UI` be split into smaller, more focused modules?**
  _Cohesion score 0.07610993657505286 - nodes in this community are weakly interconnected._
- **Should `Convex Quickstart & Setup` be split into smaller, more focused modules?**
  _Cohesion score 0.04878048780487805 - nodes in this community are weakly interconnected._
- **Should `Convex Performance Best Practices` be split into smaller, more focused modules?**
  _Cohesion score 0.05128205128205128 - nodes in this community are weakly interconnected._
- **Should `Package Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._