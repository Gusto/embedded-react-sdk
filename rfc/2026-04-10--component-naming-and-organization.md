# Component Naming & Organization Proposal

This RFC is the **source of truth** for how we name and organize SDK components. It covers **public export shape** (including Option 3: journey-based namespaces) and **internal directory layout** so we can scale **shared hooks + multiple journey-specific UIs** without ad-hoc folder sprawl.

---

## Problem Statement

Partners need a clear public API. Internally, we increasingly build **one data/behavior hook** that powers **more than one user journey**, each with its **own UX surface** (layout, copy, events, tabs). The same tension shows up in naming (`EmployeeList` vs `ManagementEmployeeList`) and in **where files live** on disk.

We are **reusing this pattern** across components and expect **more steady-state (management) variants** alongside onboarding-oriented screens. While we adjust **export names and journey barrels**, we should **reorganize component folders** so shared logic, journey entry points, and views stay easy to find and extend.

### Case study: `EmployeeList`

Today, under `src/components/Employee/EmployeeList/`, **one hook** implements list behavior for multiple contexts (e.g. onboarding-oriented flows vs steady-state management with tabs and different actions):

| Role | Files (illustrative) |
|------|----------------------|
| **Shared hook** | `useEmployeeList.tsx` — data, pagination, mutations, derived actions for employees |
| **Onboarding entry + view** | `EmployeeList.tsx` → `EmployeeListView.tsx` |
| **Management entry + view** | `ManagementEmployeeList.tsx` → `ManagementEmployeeListView.tsx` |

Both entry components call **`useEmployeeList`** with different props (e.g. `employeeType` / tab mapping) and render **different views**. Tests colocate with these files.

This **shared hook + N journey UIs** pattern is the **organizing problem** for directory structure: we need a convention that scales when `N` grows or when another team adds a third journey (e.g. a focused embed) without duplicating hook logic or burying shared code.

### Goals

1. **Public API:** Journey-oriented exports (Option 3) and/or stable umbrella exports — documented and tree-shake friendly.  
2. **Repository layout:** Predictable **feature modules** (`shared/` + journey folders) for **shared list/flow logic** vs **journey-specific shells and views**, with **partner-exportable hooks** implemented once under `shared/`.  
3. **Coordinated change:** When we add or adjust **export barrels** (including hook re-exports), **move or reshape directories** in the same effort so names, paths, and public APIs stay aligned.

---

## Option 1: Context Sub-Namespaces

Organize components by operational context using a 2–3 level hierarchy.

### Structure

`Entity.Context.Component`

- **Level 1 (Entity):** Employee, Contractor, Payroll, Company  
- **Level 2 (Context):** Flows, Onboarding, Management, Payments, Execution, Configuration  
- **Level 3 (Component):** Component name (simplified when context is clear)

### Example: Employee namespace

```
Employee
├── Flows
│   ├── Onboarding              // Flow components drop "Flow" suffix
│   ├── SelfOnboarding
│   └── Termination
├── Onboarding
│   ├── EmployeeList
│   ├── Summary
│   └── Landing
├── Management
│   ├── EmployeeList            // Different context variant
│   └── Documents
├── Termination
│   ├── Form
│   └── Summary
├── Profile                     // Top-level: works in all contexts
├── Compensation
├── FederalTaxes
├── StateTaxes
└── ...
```

### Usage

```tsx
import { Employee, Payroll, Contractor } from '@gusto/embedded-react-sdk'

<Employee.Flows.Onboarding companyId={companyId} />
<Employee.Onboarding.EmployeeList companyId={companyId} />
<Employee.Management.EmployeeList companyId={companyId} />
<Employee.Profile employeeId={employeeId} />
```

### Pros

- Self-documenting structure with clear context grouping  
- Scalable — easy to add contexts and variants  
- Shorter leaf names when context carries meaning  
- IDE autocomplete shows logical groupings  
- Top-level components signal cross-context usage  

### Cons

- Large breaking rename surface if adopted as the only public API  
- More complex migration for partners  
- Inconsistent depth (2–3 levels)  
- Requires understanding the context hierarchy  

---

## Option 2: Suffix-Based Naming

Keep a flat 2-level structure (`Entity.Component`) with consistent naming conventions.

### Naming rules

- **Flows:** suffix with `Flow` — e.g. `OnboardingFlow`, `PayrollFlow`  
- **Variants:** prefix with context when multiple versions exist — e.g. `OnboardingEmployeeList`, `ManagementEmployeeList`  
- **Shared components:** no special affix — e.g. `Profile`, `Compensation`  

### Usage

```tsx
import { Employee } from '@gusto/embedded-react-sdk'

<Employee.OnboardingFlow companyId={companyId} />
<Employee.OnboardingEmployeeList companyId={companyId} />
<Employee.ManagementEmployeeList companyId={companyId} />
<Employee.Profile employeeId={employeeId} />
```

### Pros

- Predictable flat structure  
- Fewer breaking changes when adding variants  
- Consistent depth  

### Cons

- Longer names when context is baked into the identifier  
- Relies on naming discipline (not enforced by folder structure)  
- Namespace “pollution” as component count grows  

---

## Side-by-Side Comparison (Employee / Payroll / Contractor)

| Aspect | Option 1 | Option 2 |
|--------|----------|----------|
| Flow | `Employee.Flows.Onboarding` | `Employee.OnboardingFlow` |
| Onboarding list | `Employee.Onboarding.EmployeeList` | `Employee.OnboardingEmployeeList` |
| Management list | `Employee.Management.EmployeeList` | `Employee.ManagementEmployeeList` |
| Shared profile | `Employee.Profile` | `Employee.Profile` |
| Payroll overview | `Payroll.Execution.Overview` | `Payroll.PayrollOverview` |

---

## Decision Criteria (export naming)

**Choose Option 1** if planning a major version, expect large growth, and prioritize long-term architectural clarity over short-term migration cost.

**Choose Option 2** if minimizing disruption, shipping additive variants quickly, and preferring flatter APIs until 1.0.0.

**Hybrid (internal Option 1, public Option 2):** organize by context on disk while exporting flat component names for compatibility.

---

## Option 3: Journey-Based Export Namespaces (Decoupled from Directories)

Option 3 is a **variant of the hybrid approach** oriented around **partner use cases** rather than mirroring the full physical tree in the public API.

### Definition

- Introduce **additional export namespaces** grouped by **product journey** (e.g. employee onboarding vs employee management).  
- **Shared components** (e.g. `Profile`) are implemented **once** and **re-exported** from every journey namespace where they apply.  
- **Export structure is decoupled from directory structure** — internal file paths and component identifiers can stay unchanged (including suffix-based names from Option 2).  

### Structure (conceptual)

```text
Internal (unchanged paths)
  src/components/Employee/Profile/Profile.tsx
  src/components/Employee/EmployeeList/EmployeeList.tsx
  ...

Public journey barrels (new)
  src/components/Employee/exports/employeeOnboarding.ts
  src/components/Employee/exports/employeeManagement.ts

Package root
  export * as EmployeeOnboarding from './components/Employee/exports/employeeOnboarding'
  export * as EmployeeManagement from './components/Employee/exports/employeeManagement'
  export * as Employee from './components/Employee'   // legacy / umbrella
```

### Usage

```tsx
import {
  EmployeeOnboarding,
  EmployeeManagement,
} from '@gusto/embedded-react-sdk'

// Onboarding journey — one namespace to scan
<EmployeeOnboarding.OnboardingFlow companyId={companyId} />
<EmployeeOnboarding.EmployeeList companyId={companyId} />
<EmployeeOnboarding.Profile employeeId={employeeId} />

// Management journey — shared components are the same module as in onboarding
<EmployeeManagement.ManagementEmployeeList companyId={companyId} />
<EmployeeManagement.Profile employeeId={employeeId} />
```

### Pros

- Documentation and discovery organized **by use case**  
- **Shallow chains** — typically `JourneyNamespace.Component` (two segments), avoiding `Entity.Context.SubContext.Component`  
- **Tree shaking:** journey barrels should use **explicit named re-exports** from concrete modules; shared components reference the **same file** from multiple barrels (one implementation, multiple export paths)  
- **No required rename** of existing components — additive barrels  

### Cons

- **Duplication in docs** — the same symbol (e.g. `Profile`) appears in multiple namespace tables; docs must state they are identical exports  
- **More exports to maintain** — each new component may need placement in one or more journey barrels  
- **Risk of drift** if journey barrels are not updated alongside `Employee` umbrella exports  
- Partners must learn **which journey namespace** to import for their feature (mitigated by docs + optional lint rules)  

### Tree-shaking notes

- Prefer `export { Profile } from '../Profile'` over `export * from '../somewhere'` in journey barrels.  
- Keep implementation modules side-effect-free where possible; align `package.json` `sideEffects` with reality.  
- Re-exporting the same component from `EmployeeOnboarding` and `EmployeeManagement` does **not** duplicate bundle weight versus importing it once from `Employee` if both resolve to the same module graph.  

---

## Feature module layout (standard)

Option 3 addresses **how partners import** components. **Directory structure** addresses **how we maintain** shared hooks and multiple UX surfaces as steady-state variants multiply. The **EmployeeList** case study above is the template: **one hook**, **multiple entry components and views**.

We standardize on a **feature module**: one **feature root** folder per cohesive capability, with **`shared/`** for cross-journey logic and **one subfolder per journey** for shells and views. That keeps **everything belonging to “employee list”** in one place—easy to navigate, review, and extend when a third journey appears.

### Design forces

| Force | What we want |
|--------|----------------|
| **Shared behavior** | One module for data loading, pagination, mutations, and derived “what actions exist” logic — no copy-paste or divergent hooks. |
| **Journey-specific UI** | Clear homes for onboarding vs management (or future) **shells and views** — different layouts, i18n namespaces, events, and props. |
| **Growth** | Adding a journey adds a **sibling folder** under the same feature root, not a new scattered top-level island. |
| **Tests & stories** | Colocated with the entry or view they cover. |
| **Imports** | Short relatives (`../shared/...`); avoid deep `../../../` chains. |
| **Partner hooks** | Headless APIs live next to the same feature in `shared/` and are exported through a clear **public hook strategy** (below). |

### Directory shape

Use **kebab-case** for the feature folder name to distinguish **feature modules** from **PascalCase component files** (e.g. `employee-list/`). Adjust if the repo standardizes on PascalCase folders—consistency matters more than the exact casing.

```text
Employee/employee-list/
  shared/
    useEmployeeList.tsx
    # types, constants, small pure helpers used only by this feature (not generic app hooks)
  onboarding/
    EmployeeList.tsx
    EmployeeListView.tsx
    EmployeeList.test.tsx
  management/
    ManagementEmployeeList.tsx
    ManagementEmployeeListView.tsx
    ManagementEmployeeList.test.tsx
```

- **`onboarding/EmployeeList.tsx`** imports `../shared/useEmployeeList` and renders `EmployeeListView`.  
- **`management/ManagementEmployeeList.tsx`** imports the **same** hook and renders `ManagementEmployeeListView`.  
- **Optional:** `shared/index.ts` re-exports the hook and public types for barrels—keeps import lines in journey barrels short.

### What belongs in `shared/` vs a journey folder

| Location | Contents |
|----------|----------|
| **`shared/`** | Hooks, feature-local types, and helpers that **more than one journey** (or partner headless use) needs. Anything **reusable across features** and not list-specific belongs in `src/hooks/` or shared packages—not here. |
| **`onboarding/` / `management/`** | Route-level entry components, journey-specific views, journey-specific tests, and props wiring (i18n namespace, `onEvent`, layout). |

### Aligning directories with Option 3 exports

| Layer | Responsibility |
|--------|----------------|
| **Journey barrel** (`exports/employeeOnboarding.ts`, `exports/employeeManagement.ts`) | Re-exports **public components** for that use case; **may also re-export shared hooks** (see below). |
| **Feature folder** (`employee-list/onboarding/`, `employee-list/management/`) | **Implementation** of journey entry + view only. |
| **`shared/`** | **Single implementation** of `useEmployeeList` and related types—**the** module partner hook exports resolve to. |

When a new steady-state surface shares the same hook, **add a sibling journey folder** under `employee-list/` (e.g. `partner-embed/`) rather than creating a separate top-level feature without a shared home for logic.

### Exporting hooks for partners (`useEmployeeList` and similar)

Partners building **fully custom UI** need the same headless behavior our packaged components use. The hook **must** remain **one module** in `shared/`; public exports are **re-exports** of that module, not duplicate implementations.

**Principles**

1. **Journey-agnostic API** — `useEmployeeList` is the same function whether the partner is building an onboarding or management experience; journey differences are **props** (e.g. `employeeType`) and **which packaged component** they might otherwise use—not separate hook types.  
2. **One physical module** — All public paths resolve to `employee-list/shared/useEmployeeList.tsx` (or its `shared/index` barrel).  
3. **Types ship with the hook** — Export `UseEmployeeListProps`, result types, and action types from the same public surfaces as the hook.

**Where partners import hooks (complementary patterns)**

| Pattern | When to use |
|---------|-------------|
| **Re-export from journey namespaces** | `EmployeeOnboarding.useEmployeeList` and `EmployeeManagement.useEmployeeList` both re-export the **same** binding. Partners pick **one import** based on the feature they are building; discoverability matches components. Tree shaking still dedupes to one module. |
| **Umbrella `Employee` export** | `export { useEmployeeList } from '...'` from `Employee/index.ts` for partners who prefer a single namespace for all employee building blocks. |
| **Dedicated package entry (optional)** | Add a **hooks-focused** subpath (e.g. `@gusto/embedded-react-sdk/hooks` or a named export group) when we want hooks discoverable **without** pulling journey namespaces—requires `package.json` `exports` and a small barrel file. Use for “headless-only” documentation and for partners who do not use journey barrels. |

**Recommendation:** Support **at least two** of: journey re-exports (both `EmployeeOnboarding` and `EmployeeManagement`), umbrella `Employee`, and/or a dedicated hooks entry—exact matrix is a build/docs decision, but **all paths must point at the same `shared/` module**.

**Documentation** — In journey guides, state explicitly: *“The hook is shared; use it for custom UI in either journey.”* Avoid implying a separate onboarding-only hook unless the API truly diverges (then split modules with a shared internal primitive—rare).

---

## Impact on Existing Components

The tables below map **current** public exports (as of this RFC) to **suggested** Option 3 journey namespaces.

**Exports:** Add **journey barrel files** and **`src/components/index.ts`** entries (additive where possible).

**Directories:** Moving `EmployeeList` (and similar) into the **feature module** layout (`employee-list/shared` + journey folders) should happen **in the same initiative** as export work so paths, docs, barrels, and **hook re-exports** stay consistent — exact sequencing (barrels first vs moves first) is an implementation detail, but **avoid** leaving public paths pointing at obsolete files long-term.

Legend:

- **Onboarding** — primary journey namespace for this domain (name varies per domain; see section headers)  
- **Management / Configuration / Payments / …** — secondary (or tertiary) journey namespace  
- **Shared** — appears in **more than one** journey namespace (re-exported)  
- **Umbrella** — remains available via existing `Employee`, `Company`, etc., for backward compatibility  

### Employee → `EmployeeOnboarding` / `EmployeeManagement`

| Current export (`Employee.*`) | Suggested journey namespace | Notes |
|------------------------------|-----------------------------|--------|
| `OnboardingFlow` | `EmployeeOnboarding` | |
| `SelfOnboardingFlow` | `EmployeeOnboarding` | |
| `EmployeeList` | `EmployeeOnboarding` | onboarding list variant |
| `OnboardingSummary` | `EmployeeOnboarding` | |
| `Landing` | `EmployeeOnboarding` | |
| `DocumentSigner` | `EmployeeOnboarding` | |
| `EmploymentEligibility` | `EmployeeOnboarding` | |
| `ManagementEmployeeList` | `EmployeeManagement` | |
| `EmployeeDocuments` | `EmployeeManagement` | |
| `DashboardFlow` | `EmployeeManagement` | steady-state dashboard |
| `TerminateEmployee` | `EmployeeManagement` | |
| `TerminationSummary` | `EmployeeManagement` | |
| `TerminationFlow` | `EmployeeManagement` | |
| `Profile` | **Shared** | `EmployeeOnboarding` + `EmployeeManagement` |
| `Compensation` | **Shared** | both |
| `FederalTaxes` | **Shared** | both |
| `StateTaxes` | **Shared** | both |
| `Deductions` | **Shared** | both |
| `PaymentMethod` | **Shared** | both |
| `Taxes` | **Shared** (deprecated) | both, until removed |

**Hook:** `useEmployeeList` (and its public types) — **not** journey-specific; re-export from **`EmployeeOnboarding`**, **`EmployeeManagement`**, and umbrella **`Employee`** so partners can co-locate imports with the journey they are building. Single implementation: `employee-list/shared/useEmployeeList.tsx`.

### Company → `CompanyOnboarding` / `CompanyConfiguration`

| Current export (`Company.*`) | Suggested journey namespace | Notes |
|-----------------------------|-----------------------------|--------|
| `OnboardingFlow` | `CompanyOnboarding` | |
| `OnboardingOverview` | `CompanyOnboarding` | |
| `DocumentSigner` | `CompanyOnboarding` | |
| `Industry` | `CompanyConfiguration` | |
| `BankAccount` | `CompanyConfiguration` | |
| `Locations` | `CompanyConfiguration` | |
| `PaySchedule` | `CompanyConfiguration` | |
| `FederalTaxes` | `CompanyConfiguration` | |
| `StateTaxes` | `CompanyConfiguration` | |
| `StateTaxesList` | `CompanyConfiguration` | |
| `StateTaxesForm` | `CompanyConfiguration` | |
| `AssignSignatory` | `CompanyConfiguration` | |
| `CreateSignatory` | `CompanyConfiguration` | |
| `InviteSignatory` | `CompanyConfiguration` | |
| `DocumentList` | **Shared** | onboarding signer flow + configuration docs |
| `SignatureForm` | **Shared** | same |

### Contractor → `ContractorOnboarding` / `ContractorPayments`

| Current export (`Contractor.*`) | Suggested journey namespace | Notes |
|--------------------------------|-----------------------------|--------|
| `OnboardingFlow` | `ContractorOnboarding` | |
| `ContractorList` | `ContractorOnboarding` | |
| `NewHireReport` | `ContractorOnboarding` | |
| `ContractorSubmit` | `ContractorOnboarding` | |
| `PaymentFlow` | `ContractorPayments` | |
| `CreatePayment` | `ContractorPayments` | |
| `PaymentsList` | `ContractorPayments` | |
| `PaymentHistory` | `ContractorPayments` | |
| `PaymentSummary` | `ContractorPayments` | |
| `PaymentStatement` | `ContractorPayments` | |
| `ContractorProfile` | **Shared** | both |
| `PaymentMethod` | **Shared** | both |
| `Address` | **Shared** | both |

### Payroll → `PayrollFlows` / `PayrollExecution` / `PayrollManagement`

| Current export (`Payroll.*`) | Suggested journey namespace | Notes |
|-----------------------------|-----------------------------|--------|
| `PayrollFlow` | `PayrollFlows` | |
| `PayrollExecutionFlow` | `PayrollFlows` | |
| `OffCycleFlow` | `PayrollFlows` | |
| `DismissalFlow` | `PayrollFlows` | |
| `TransitionFlow` | `PayrollFlows` | |
| `PayrollOverview` | `PayrollExecution` | |
| `PayrollEditEmployee` | `PayrollExecution` | |
| `ConfirmWireDetails` | `PayrollExecution` | |
| `PayrollBlockerList` | `PayrollExecution` | |
| `RecoveryCases` | `PayrollExecution` | |
| `OffCycleReasonSelection` | `PayrollExecution` | |
| `OffCycleDeductionsSetting` | `PayrollExecution` | |
| `OffCycleCreation` | `PayrollExecution` | |
| `TransitionCreation` | `PayrollExecution` | |
| `PayrollLanding` | `PayrollManagement` | |
| `PayrollList` | `PayrollManagement` | |
| `PayrollHistory` | `PayrollManagement` | |
| `PayrollReceipts` | `PayrollManagement` | |
| `PayrollConfiguration` | `PayrollManagement` | |

### InformationRequests → `InformationRequestsFlow` / `InformationRequestsManagement`

| Current export (`InformationRequests.*`) | Suggested journey namespace |
|-----------------------------------------|-----------------------------|
| `InformationRequestsFlow` | `InformationRequestsFlow` |
| `InformationRequestList` | `InformationRequestsManagement` |
| `InformationRequestForm` | `InformationRequestsManagement` |

---

## Example: New Journey Barrel Files (Employee)

Journey barrels are **additive** files. They only **re-export** implementation modules from feature folders and `shared/` — they do not contain UI logic.

**Employee list** imports below use the **feature module** paths (`employee-list/...`). Other exports still use today’s paths until those features move.

### `src/components/Employee/exports/employeeOnboarding.ts`

```ts
export { OnboardingFlow } from '../OnboardingFlow/OnboardingFlow'
export { SelfOnboardingFlow } from '../SelfOnboardingFlow/SelfOnboardingFlow'
export { EmployeeList } from '../employee-list/onboarding/EmployeeList'
export {
  useEmployeeList,
  type UseEmployeeListProps,
  type UseEmployeeListResult,
} from '../employee-list/shared/useEmployeeList'
export { OnboardingSummary } from '../OnboardingSummary'
export { Landing } from '../Landing'
export { DocumentSigner } from '../DocumentSigner'
export { EmploymentEligibility } from '../DocumentSigner/EmploymentEligibility'
export type { EmploymentEligibilityProps } from '../DocumentSigner/EmploymentEligibility'

export { Profile } from '../Profile'
export { Compensation } from '../Compensation'
export { FederalTaxes } from '../FederalTaxes'
export { StateTaxes } from '../StateTaxes'
export { Deductions } from '../Deductions'
export { PaymentMethod } from '../PaymentMethod'

export { Taxes } from '../Taxes'
```

### `src/components/Employee/exports/employeeManagement.ts`

```ts
export { ManagementEmployeeList } from '../employee-list/management/ManagementEmployeeList'
export {
  useEmployeeList,
  type UseEmployeeListProps,
  type UseEmployeeListResult,
} from '../employee-list/shared/useEmployeeList'
export { EmployeeDocuments } from '../EmployeeDocuments'
export { DashboardFlow } from '../Dashboard'
export type { DashboardFlowProps } from '../Dashboard'

export { TerminateEmployee } from '../Terminations/TerminateEmployee/TerminateEmployee'
export type { TerminateEmployeeProps } from '../Terminations/TerminateEmployee/TerminateEmployee'
export { TerminationSummary } from '../Terminations/TerminationSummary/TerminationSummary'
export type { TerminationSummaryProps } from '../Terminations/TerminationSummary/TerminationSummary'
export { TerminationFlow } from '../Terminations/TerminationFlow/TerminationFlow'
export type { TerminationFlowProps } from '../Terminations/TerminationFlow/TerminationFlowComponents'
export type { PayrollOption } from '../Terminations/types'

export { Profile } from '../Profile'
export { Compensation } from '../Compensation'
export { FederalTaxes } from '../FederalTaxes'
export { StateTaxes } from '../StateTaxes'
export { Deductions } from '../Deductions'
export { PaymentMethod } from '../PaymentMethod'

export { Taxes } from '../Taxes'
```

### `src/components/index.ts` (snippet — new exports)

```ts
export * as Company from './Company'
export * as Contractor from './Contractor'
export * as Employee from './Employee'
export * as InformationRequests from './InformationRequests'
export * as Payroll from './Payroll'

// Option 3 — journey namespaces (additive)
export * as EmployeeOnboarding from './Employee/exports/employeeOnboarding'
export * as EmployeeManagement from './Employee/exports/employeeManagement'
export * as CompanyOnboarding from './Company/exports/companyOnboarding'
export * as CompanyConfiguration from './Company/exports/companyConfiguration'
export * as ContractorOnboarding from './Contractor/exports/contractorOnboarding'
export * as ContractorPayments from './Contractor/exports/contractorPayments'
export * as PayrollFlows from './Payroll/exports/payrollFlows'
export * as PayrollExecution from './Payroll/exports/payrollExecution'
export * as PayrollManagement from './Payroll/exports/payrollManagement'
export * as InformationRequestsFlow from './InformationRequests/exports/informationRequestsFlow'
export * as InformationRequestsManagement from './InformationRequests/exports/informationRequestsManagement'
```

Other domain barrels (`companyOnboarding.ts`, `payrollFlows.ts`, etc.) follow the same explicit re-export pattern as the Employee examples; paths mirror the **Impact on Existing Components** tables above. Those files are **not** added in this RFC — only the Employee examples are fully listed — but the root `index.ts` block shows the intended **target** once each barrel exists.

**Naming overlap:** Some journey namespaces may mirror an inner export name (e.g. `InformationRequestsFlow.InformationRequestsFlow`). That is acceptable but awkward; alternatives include choosing a different namespace identifier (e.g. `InformationRequestsOrchestration`) or renaming the inner export in a future major version. Document the recommended import pattern for partners.

---

## Recommendation

- **Public API:** Treat **Option 3 journey namespaces** as the primary story for new integrations; keep umbrella `Employee`, `Company`, `Payroll`, etc. exports as **compatibility / full inventory** until a planned major version. Journey barrels can ship **additively** first if needed.  
- **Partner hooks:** Expose each shared hook from **`shared/`** via **journey barrels** (same hook on both journeys when applicable), plus **umbrella** and/or a **dedicated hooks entry** in `package.json` exports—see **Exporting hooks for partners** above.  
- **Internal layout:** Use the **feature module** pattern (`feature-name/shared` + per-journey folders) for any capability that follows the **EmployeeList** model (shared hook, multiple UIs).  
- **Timing:** Combine **export barrel work**, **hook re-exports**, and **directory moves** for the same feature in one program of work so imports, docs, and paths stay aligned.  
- **Long term:** Revisit Option 1 vs 2 for **runtime** naming if we ever expose deep `Entity.Context.Component` APIs; Option 3 plus feature modules may avoid that need for a long time.  

---

## Component Inventory Summary

| Domain | Public surface | Option 3 action |
|--------|----------------|-----------------|
| Employee | See `Employee/index.ts` | Add `EmployeeOnboarding`, `EmployeeManagement` barrels |
| Company | See `Company/index.tsx` | Add `CompanyOnboarding`, `CompanyConfiguration` barrels |
| Contractor | See `Contractor/index.ts` | Add `ContractorOnboarding`, `ContractorPayments` barrels |
| Payroll | See `Payroll/index.ts` | Add `PayrollFlows`, `PayrollExecution`, `PayrollManagement` barrels |
| InformationRequests | See `InformationRequests/index.ts` | Add `InformationRequestsFlow`, `InformationRequestsManagement` barrels |

**Directory + hooks:** Apply the **feature module** layout (`employee-list/shared`, journey folders) and **public hook re-exports** together; **EmployeeList** is the first candidate under `Employee/`.

---

## Migration Notes

1. **Phase 1:** Add journey barrel files + root exports (additive).  
2. **Phase 1b (parallel):** Move high-value features (starting with **EmployeeList**) into the **feature module** directory layout; update internal imports, tests, **`Employee/index.ts`** (components + hooks), and **journey barrels** so `useEmployeeList` resolves to `employee-list/shared/useEmployeeList`.  
3. **Phase 2:** Update public docs to lead with journey namespaces; optionally add ESLint `no-restricted-imports` presets per app area.  
4. **Phase 3 (optional):** Deprecate umbrella-only workflows in docs, or add dev warnings for legacy import paths — only if product agrees on migration pressure.  

---
