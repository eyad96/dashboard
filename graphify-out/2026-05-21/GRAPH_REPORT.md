# Graph Report - .  (2026-05-21)

## Corpus Check
- Corpus is ~47,188 words - fits in a single context window. You may not need a graph.

## Summary
- 701 nodes · 700 edges · 50 communities (43 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_App Directory Alias Config|App Directory Alias Config]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Package Dependencies|Package Dependencies]]
- [[_COMMUNITY_Chat & Theme UI|Chat & Theme UI]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Asset Build Metadata|Asset Build Metadata]]
- [[_COMMUNITY_Project TypeScript Configuration|Project TypeScript Configuration]]
- [[_COMMUNITY_Convex Deployment Config|Convex Deployment Config]]
- [[_COMMUNITY_Boilerplate App Metadata|Boilerplate App Metadata]]
- [[_COMMUNITY_GetStarted Landing Page Components|GetStarted Landing Page Components]]
- [[_COMMUNITY_Clerk Webhook Signature Verification|Clerk Webhook Signature Verification]]
- [[_COMMUNITY_Convex Generated Database Types|Convex Generated Database Types]]
- [[_COMMUNITY_Convex tsconfig Settings|Convex tsconfig Settings]]
- [[_COMMUNITY_Convex Context Types|Convex Context Types]]
- [[_COMMUNITY_Agent Workspace Hashes|Agent Workspace Hashes]]
- [[_COMMUNITY_External Deployment Resources|External Deployment Resources]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Convex AI Tools Integration|Convex AI Tools Integration]]
- [[_COMMUNITY_Reusable Convex Component Patterns|Reusable Convex Component Patterns]]
- [[_COMMUNITY_Subcomponent Interfaces|Subcomponent Interfaces]]
- [[_COMMUNITY_Hybrid Component Guidelines|Hybrid Component Guidelines]]
- [[_COMMUNITY_Local Convex Components Setup|Local Convex Components Setup]]
- [[_COMMUNITY_Convex Packaging Guidelines|Convex Packaging Guidelines]]
- [[_COMMUNITY_DB Structural Migrations|DB Structural Migrations]]
- [[_COMMUNITY_Schema Update Operations|Schema Update Operations]]
- [[_COMMUNITY_Database Migration Utilities|Database Migration Utilities]]
- [[_COMMUNITY_Performance Auditing Checklist|Performance Auditing Checklist]]
- [[_COMMUNITY_Data Transaction Guidelines|Data Transaction Guidelines]]
- [[_COMMUNITY_Convex Performance Best Practices|Convex Performance Best Practices]]
- [[_COMMUNITY_Convex Write Conflict Avoidance|Convex Write Conflict Avoidance]]
- [[_COMMUNITY_Convex Query Optimization|Convex Query Optimization]]
- [[_COMMUNITY_Convex Quickstart & Setup|Convex Quickstart & Setup]]
- [[_COMMUNITY_User Identity & Authentication|User Identity & Authentication]]
- [[_COMMUNITY_Auth0 Identity Setup|Auth0 Identity Setup]]
- [[_COMMUNITY_Clerk Identity Setup|Clerk Identity Setup]]
- [[_COMMUNITY_Auth Setup Checklist|Auth Setup Checklist]]
- [[_COMMUNITY_WorkOS Identity Setup|WorkOS Identity Setup]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Convex Function Boilerplate|Convex Function Boilerplate]]
- [[_COMMUNITY_Convex Backend API Router|Convex Backend API Router]]
- [[_COMMUNITY_Community 42|Community 42]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `compilerOptions` - 13 edges
3. `cn()` - 13 edges
4. `Convex Create Component` - 12 edges
5. `Convex Quickstart` - 12 edges
6. `Convex guidelines` - 12 edges
7. `Migrations Component Reference` - 11 edges
8. `Hot Path Rules` - 11 edges
9. `Convex Auth` - 11 edges
10. `Convex Migration Helper` - 10 edges

## Surprising Connections (you probably didn't know these)
- `clsx` --calls--> `cn()`  [INFERRED]
  package.json → lib/utils.ts
- `MenuLink()` --calls--> `cn()`  [EXTRACTED]
  app/product/layout.tsx → lib/utils.ts
- `DropdownMenuShortcut()` --calls--> `cn()`  [EXTRACTED]
  components/ui/dropdown-menu.tsx → lib/utils.ts
- `Message()` --calls--> `cn()`  [EXTRACTED]
  app/product/Chat/Message.tsx → lib/utils.ts
- `ProductPage()` --calls--> `randomName()`  [EXTRACTED]
  app/product/page.tsx → app/product/Chat/randomName.ts

## Communities (50 total, 7 thin omitted)

### Community 14 - "App Directory Alias Config"
Cohesion: 0.11
Nodes (17): $schema, style, rsc, tsx, tailwind, config, css, baseColor (+9 more)

### Community 3 - "Package Dependencies"
Cohesion: 0.05
Nodes (36): name, version, private, scripts, dev, build, start, lint (+28 more)

### Community 0 - "Chat & Theme UI"
Cohesion: 0.06
Nodes (31): clsx, MenuLink(), ProductPage(), Chat(), ChatIntro(), Message(), MessageList(), names (+23 more)

### Community 6 - "Asset Build Metadata"
Cohesion: 0.06
Nodes (32): version, skills, convex, source, sourceType, skillPath, computedHash, convex-create-component (+24 more)

### Community 13 - "Project TypeScript Configuration"
Cohesion: 0.10
Nodes (19): compilerOptions, target, lib, allowJs, skipLibCheck, strict, noEmit, esModuleInterop (+11 more)

### Community 26 - "Convex Deployment Config"
Cohesion: 0.25
Nodes (7): ports, cloud, site, backendVersion, adminKey, instanceSecret, deploymentName

### Community 34 - "Boilerplate App Metadata"
Cohesion: 0.40
Nodes (3): geistSans, geistMono, metadata

### Community 16 - "GetStarted Landing Page Components"
Cohesion: 0.18
Nodes (9): ConvexLogo(), GetStarted(), Code(), Card, CardHeader, CardTitle, CardDescription, CardContent (+1 more)

### Community 15 - "Clerk Webhook Signature Verification"
Cohesion: 0.13
Nodes (11): http, svixId, svixTimestamp, svixSignature, body, wh, list, send (+3 more)

### Community 30 - "Convex Generated Database Types"
Cohesion: 0.33
Nodes (4): TableNames, Doc, Id, DataModel

### Community 18 - "Convex tsconfig Settings"
Cohesion: 0.12
Nodes (15): compilerOptions, allowJs, strict, moduleResolution, jsx, skipLibCheck, allowSyntheticDefaultImports, target (+7 more)

### Community 31 - "Convex Context Types"
Cohesion: 0.33
Nodes (5): QueryCtx, MutationCtx, ActionCtx, DatabaseReader, DatabaseWriter

### Community 35 - "Agent Workspace Hashes"
Cohesion: 0.40
Nodes (4): guidelinesHash, agentsMdSectionHash, claudeMdHash, agentSkillsSha

### Community 25 - "External Deployment Resources"
Cohesion: 0.20
Nodes (9): Welcome to your Convex + Next.js app, Get started, code:block1 (npm install), code:block2 (npm create convex@latest -- -t nextjs-shadcn), Learn more, Join the community, Deploy on Vercel, Deploy on Vercel (+1 more)

### Community 29 - "Convex AI Tools Integration"
Cohesion: 0.33
Nodes (5): Convex, Start Here, code:bash (npx convex ai-files install), Route to the Right Skill, When Not to Use

### Community 9 - "Reusable Convex Component Patterns"
Cohesion: 0.07
Nodes (27): Convex Create Component, When to Use, When Not to Use, Workflow, Choose the Shape, Default Approach, Component Skeleton, code:ts (// convex/components/notifications/convex.config.ts) (+19 more)

### Community 20 - "Subcomponent Interfaces"
Cohesion: 0.15
Nodes (12): Advanced Component Patterns, Function Handles for callbacks, code:ts (// App side: create a handle and pass it to the component), code:ts (// Component side: accept and invoke the handle), Deriving validators from schema, code:ts (import { v } from "convex/values";), Static configuration with a globals table, code:ts (// schema.ts) (+4 more)

### Community 33 - "Hybrid Component Guidelines"
Cohesion: 0.33
Nodes (5): Hybrid Convex Components, What This Means, Default Advice, Risks, Checklist

### Community 28 - "Local Convex Components Setup"
Cohesion: 0.29
Nodes (6): Local Convex Components, When to Choose This, Default Layout, code:text (convex/), Workflow Notes, Checklist

### Community 27 - "Convex Packaging Guidelines"
Cohesion: 0.25
Nodes (7): Packaged Convex Components, When to Choose This, Default Approach, Build Flow, Package Exports, Testing, Checklist

### Community 12 - "DB Structural Migrations"
Cohesion: 0.10
Nodes (20): Convex Migration Helper, When to Use, When Not to Use, Key Concepts, Schema Validation Drives the Workflow, Online Migrations, Prefer New Fields Over Changing Types, Don't Delete Data (+12 more)

### Community 10 - "Schema Update Operations"
Cohesion: 0.09
Nodes (22): Migration Patterns Reference, Adding a Required Field, code:typescript (// Deploy 1: Schema allows both states), Deleting a Field, code:typescript (// Deploy 1: Make optional), Changing a Field Type, code:typescript (// Deploy 1: Add new field, keep old field optional), Splitting Nested Data Into a Separate Table (+14 more)

### Community 7 - "Database Migration Utilities"
Cohesion: 0.06
Nodes (31): Migrations Component Reference, Installation, code:bash (npm install @convex-dev/migrations), Setup, code:typescript (// convex/convex.config.ts), code:typescript (// convex/migrations.ts), Define a Migration, code:typescript (// convex/migrations.ts) (+23 more)

### Community 17 - "Performance Auditing Checklist"
Cohesion: 0.12
Nodes (15): Convex Performance Audit, When to Use, When Not to Use, Guardrails, First Step: Gather Signals, Signal Routing, Escalate Larger Fixes, Workflow (+7 more)

### Community 8 - "Data Transaction Guidelines"
Cohesion: 0.06
Nodes (30): Function Budget, Core Principle, Limits to Know, Symptoms, Common Causes, Unbounded collection, Large document reads on hot paths, Mutation doing too much work (+22 more)

### Community 2 - "Convex Performance Best Practices"
Cohesion: 0.05
Nodes (38): Hot Path Rules, Contents, Core Principle, Consistency Rule, 1. Push Filters To Storage, code:ts (// Bad: scans then filters in JavaScript), code:ts (// Also bad: Convex .filter() does not push to storage eithe), code:ts (// Good: use an index so storage does the filtering) (+30 more)

### Community 11 - "Convex Write Conflict Avoidance"
Cohesion: 0.09
Nodes (21): OCC Conflict Resolution, Core Principle, Symptoms, Common Causes, Hot documents, Broad read sets causing false conflicts, Fan-out from triggers or cascading writes, Write-then-read chains (+13 more)

### Community 5 - "Convex Query Optimization"
Cohesion: 0.06
Nodes (32): Subscription Cost, Core Principle, Symptoms, Common Causes, Reactive queries on low-freshness flows, Overly broad queries, Too many subscriptions per page, Paginated queries keeping all pages live (+24 more)

### Community 1 - "Convex Quickstart & Setup"
Cohesion: 0.05
Nodes (43): Convex Quickstart, When to Use, When Not to Use, Workflow, Path 1: New Project (Recommended), Pick a template, code:bash (npm create convex@latest my-app -- -t owner/repo), Scaffold the project (+35 more)

### Community 19 - "User Identity & Authentication"
Cohesion: 0.15
Nodes (12): Convex Authentication Setup, When to Use, When Not to Use, First Step: Choose the Auth Provider, After Choosing a Provider, Core Pattern: Protecting Backend Functions, code:ts (// Bad: trusting a client-provided userId), code:ts (// Good: verifying identity server-side) (+4 more)

### Community 22 - "Auth0 Identity Setup"
Cohesion: 0.18
Nodes (10): Auth0, Workflow, What To Do, Key Setup Areas, Files and Env Vars To Expect, Concrete Steps, Gotchas, Production (+2 more)

### Community 23 - "Clerk Identity Setup"
Cohesion: 0.18
Nodes (10): Clerk, Workflow, What To Do, Key Setup Areas, Files and Env Vars To Expect, Concrete Steps, Gotchas, Production (+2 more)

### Community 21 - "Auth Setup Checklist"
Cohesion: 0.17
Nodes (11): Convex Auth, Workflow, What This Reference Is For, What To Do, Concrete Steps, Expected Files and Decisions, Gotchas, Production (+3 more)

### Community 24 - "WorkOS Identity Setup"
Cohesion: 0.18
Nodes (10): WorkOS AuthKit, Workflow, What To Do, Key Setup Areas, Files and Env Vars To Expect, Concrete Steps, Gotchas, Production (+2 more)

### Community 32 - "Convex Function Boilerplate"
Cohesion: 0.33
Nodes (5): Welcome to your Convex functions directory!, code:ts (// convex/myFunctions.ts), code:ts (const data = useQuery(api.myFunctions.myQueryFunction, {), code:ts (// convex/myFunctions.ts), code:ts (const mutation = useMutation(api.myFunctions.myMutationFunct)

### Community 4 - "Convex Backend API Router"
Cohesion: 0.06
Nodes (32): Convex guidelines, Function guidelines, Http endpoint syntax, code:typescript (import { httpRouter } from "convex/server";), Validators, code:typescript (import { mutation } from "./_generated/server";), code:typescript (import { defineSchema, defineTable } from "convex/server";), Function registration (+24 more)

## Knowledge Gaps
- **447 isolated node(s):** `extends`, `$schema`, `style`, `rsc`, `tsx` (+442 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Chat & Theme UI` to `GetStarted Landing Page Components`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Package Dependencies` to `Chat & Theme UI`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `clsx` connect `Chat & Theme UI` to `Package Dependencies`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **What connects `extends`, `$schema`, `style` to the rest of the system?**
  _447 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App Directory Alias Config` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._
- **Should `Package Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05405405405405406 - nodes in this community are weakly interconnected._
- **Should `Chat & Theme UI` be split into smaller, more focused modules?**
  _Cohesion score 0.06079664570230608 - nodes in this community are weakly interconnected._