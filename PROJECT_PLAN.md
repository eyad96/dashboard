# Antigravity Books: Project Implementation Plan & Architecture

This document outlines the master development plan, architectural choices, and strict quality verification guidelines for our **QuickBooks-style B2B Accounting SaaS App**. It serves as the single source of truth for features, tenant isolation rules, and build pipeline requirements.

---

## 1. Architectural Foundations (Graphify References)

Our system layout and code relationships are structured based on the **Graphify AST Analysis**, which maps components into isolated, cohesive domain areas:

- **B2B Tenant Isolation (Community 19 - User Identity & Authentication, Community 23 - Clerk Identity Setup)**:
  - User accounts, invitations, and permissions are managed through **Clerk B2B Organization Management**.
  - Custom Clerk JWT claims (`org_id` and `org_role`) partition data on the Convex database, ensuring zero cross-tenant contamination.
  - Role-Based Access Control (RBAC) separates members into:
    - **Admin**: Full access including simulation panels and member switcher.
    - **Accountant**: Full write/edit access on ledger transactions and client invoices.
    - **Viewer**: Read-only access. Write operations are disabled on the client (visual locking) and blocked on the server.
- **Server Database Logic (Community 4 - Convex Backend API Router)**:
  - High-performance, real-time reactive transactional and document ledgers.
  - Multi-tenant data structures partitioned dynamically by `orgId` across `transactions`, `invoices`, `receipts`, and `organizations`.
- **Validation & Safe Datatypes (Community 53 - Input Validation)**:
  - Strict typecasting and data validation using **Zod schema boundaries** (`invoiceSchema` & `InvoiceInput` in `schema.ts`) to validate customer names, valid email syntaxes, positive transaction amounts, and explicit status states.
  - Strong TS mappings using `@/convex/_generated/dataModel` to prevent any implicit `any` bypasses.
- **Quality Configurations (Community 13 & 52 - Project TypeScript Configuration & devDependencies)**:
  - Integrated customized configurations (`tsconfig.json`, `eslint.config.mjs`) to maintain clean, production-grade JavaScript/TypeScript structures and prevent heavy caching files from triggering memory faults.

---

## 2. Robust Quality Gates (Mandatory Verification)

To guarantee that new features, refactors, and updates never introduce regressions or compile failures, we enforce the following local and CI/CD quality checks. 

> [!IMPORTANT]
> **Strict Quality Rule**: All future edits and modifications to this repository MUST strictly satisfy **0 lint warnings** and **0 typecheck errors**. Zero exceptions are permitted.

### A. Static Code Linting (`pnpm lint`)
- **Tooling**: ESLint 9+ with Next.js web vitals rules.
- **Enforcement Rules**:
  - **Zero Implicit `any`**: All variables, callbacks, and mutation structures must be explicitly typed using TypeScript interfaces or generated database types.
  - **Component Idempotency (React 19 Purity)**: No impure operations (like inline `Date.now()` or random values) can be evaluated directly within component body renders. All time metrics must be computed inside memoized hooks (`React.useMemo`), fetched outside component scopes, or passed via point-in-time ticks.
  - **No Legacy Navigation**: All internal paths must use Next.js Client-Side `<Link>` components instead of legacy HTML `<a>` tags.
  - **No Cascading Render Loops**: Side-effects must not trigger synchronous state updates directly (`useEffect` synchronous `setState` rendering warnings). Wrap mounting signals or state transitions in asynchronous macro-task schedules (`setTimeout(..., 0)`).

### B. TypeScript Compiler Checks (`pnpm typecheck`)
- **Tooling**: TypeScript compiler (`tsc --noEmit`) and Convex type checking (`convex typecheck`).
- **Low-Resource Environments & OOM Prevention**:
  - Direct execution of `tsc` through `node --max-old-space-size=2048` limits peak memory footprint.
  - Exclusions of Next.js static builds, agent artifacts, and editor caches inside `tsconfig.json` prevent infinite type scanning.

---

## 3. Implementation Checklist & Progress

### Phase 1: B2B Multi-Tenant Ledger Backend [Completed]
- [x] Create transaction, invoice, and organization schemas in `convex/schema.ts`.
- [x] Configure Clerk JWT provider templates in `convex/auth.config.ts`.
- [x] Write B2B isolated queries and mutations for transactions ledger (`convex/transactions.ts`).
- [x] Write B2B isolated queries and mutations for client invoicing ledger (`convex/invoices.ts`).
- [x] Develop secure document uploader and OCR processor (`convex/receipts.ts`).

### Phase 2: Frontend Layouts & Financial Metrics Visualizations [Completed]
- [x] Build multi-tenant responsive Sidebar Shell and top Header including Clerk `<OrganizationSwitcher />` (`app/product/dashboard/layout.tsx`).
- [x] Implement Home dashboard showing Net Profit, Expenses, and Receivables (`app/product/dashboard/page.tsx`).
- [x] Design glassmorphic, interactive area/bar graphs for Cash Flow (`components/CashFlowChart.tsx`).
- [x] Design interactive donut charts for Invoice Clearing statuses (`components/InvoiceStatusChart.tsx`).
- [x] Build standard Ledger management feed (`app/product/dashboard/transactions/page.tsx`).
- [x] Build standard Invoice billing creator sheet (`app/product/dashboard/invoices/page.tsx`).

### Phase 3: Quality Gates Solidification & Code Hardening [Completed]
- [x] Standardize `"typecheck"` script using a low-memory Node allocator: `"node --max-old-space-size=2048 node_modules/typescript/lib/tsc.js --noEmit && convex typecheck"`.
- [x] Fix Next.js anchor component warnings in `layout.tsx` by introducing `<Link>` routing.
- [x] Fix React 19 rules of purity in `invoices/page.tsx` and `receipts/page.tsx` by replacing dynamic `Date.now()` with memoized or referenced stable timestamps.
- [x] Replace implicit `any` typings inside `invoices/page.tsx`, `receipts/page.tsx`, and `transactions/page.tsx` with specific TypeScript types and `@/convex/_generated/dataModel` references.
- [x] Resolve cascading state update effects (`set-state-in-effect`) in Recharts components (`CashFlowChart.tsx` and `InvoiceStatusChart.tsx`) using asynchronous timeouts (`setTimeout(..., 0)`).
- [x] Strongly type database access `ctx` parameters inside backend `convex/transactions.ts`.
- [x] Verify code compiles with **0 errors and warnings** via `pnpm lint` and `pnpm typecheck`.

---

## 4. Specific Compiler & Linter Optimizations

To run validations fast and avoid heap crashes on memory-constrained dev containers:

### 1. ESLint Ignores
Added a unified ignores template in [eslint.config.mjs](file:///c:/Users/eyadh/Desktop/ReactAiAgent/dashboard/eslint.config.mjs) to skip bulky, temporary, and generated directories:
```javascript
globalIgnores([
  "convex/_generated/**",
  ".next/**",
  "node_modules/**",
  ".agents/**",
  ".convex/**",
  ".cursor/**",
  ".claude/**"
])
```

### 2. TypeScript Exclusions
Excluded recursive crawling directories in [tsconfig.json](file:///c:/Users/eyadh/Desktop/ReactAiAgent/dashboard/tsconfig.json) to eliminate heap index exhaustion:
```json
"exclude": [
  "node_modules",
  ".next",
  ".agents",
  ".convex",
  ".cursor",
  ".claude"
]
```

### 3. Execution Pipeline Scripts
Mapped production-grade validations inside [package.json](file:///c:/Users/eyadh/Desktop/ReactAiAgent/dashboard/package.json):
* **`pnpm lint`**: Triggers direct ESLint scan with 0 issues.
* **`pnpm typecheck`**: Runs `node --max-old-space-size=2048 node_modules/typescript/lib/tsc.js --noEmit && convex typecheck` to execute full typing checks across backend and frontend under strict memory boundaries.

---

## 5. Verification Plan

Every new pull request or local commit is automatically verified through our **GitHub Actions CI Suite** (`.github/workflows/ci.yml`), which executes:
1. **Checkout & Install**: Fetches the branch and installs modules using `pnpm install --frozen-lockfile`.
2. **Convex Codegen**: Generates active backend APIs (`npx convex codegen`).
3. **Purity & Quality Verification**: Triggers `pnpm lint`.
4. **Static Type Compilation**: Triggers `pnpm typecheck`.
5. **Production Build Handshake**: Builds the Next.js application using mocked fallback secrets (`pnpm build`).
6. **Unit Tests**: Runs our testing suites (`pnpm test`).

