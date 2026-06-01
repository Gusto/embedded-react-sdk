---
name: migrate-dashboard-card-to-block
description: >-
  Migrate one Employee Dashboard card into a set of four standalone pieces — a
  `BaseHookReady`-shaped data hook, a self-fetching card component, the
  existing edit/form, and a state-machine-orchestrated block — all living under
  the feature's `management/` folder so each piece can be consumed
  independently. Use when asked to "migrate a dashboard card", "extract a
  dashboard block", "make X usable in isolation", "decompose DashboardFlow", or
  when moving any single card off the monolithic `dashboardStateMachine` onto
  the OnboardingFlow-style "thin workflow + standalone pieces" pattern.
---

# Migrating one Dashboard card into a standalone block

## Why this exists

[`Employee/Dashboard/DashboardFlow.tsx`](../../../src/components/Employee/Dashboard/DashboardFlow.tsx) and [`dashboardStateMachine.ts`](../../../src/components/Employee/Dashboard/dashboardStateMachine.ts) currently own every card↔edit transition for every card across every tab. The cards ([`BasicDetailsView`](../../../src/components/Employee/Dashboard/BasicDetailsView.tsx), [`JobAndPayView`](../../../src/components/Employee/Dashboard/JobAndPayView.tsx), [`TaxesView`](../../../src/components/Employee/Dashboard/TaxesView.tsx), [`DocumentsView`](../../../src/components/Employee/Dashboard/DocumentsView.tsx)) are read-only views that emit events upward; the parent flow routes between edit screens and back. A partner cannot consume one card in isolation today — they get the whole dashboard or nothing.

The target shape mirrors `OnboardingFlow`:

- [`OnboardingFlow.tsx`](../../../src/components/Employee/OnboardingFlow/OnboardingFlow.tsx) is thin orchestration; the work lives in per-feature blocks (`Compensation/onboarding/Compensation.tsx`, `Profile/onboarding/Profile.tsx`, `FederalTaxes/onboarding/FederalTaxes.tsx`, …).
- `DashboardFlow.tsx` should be thin layout; the work belongs in per-feature blocks under each feature's `management/` folder.

The precedent already exists for several features ([`PaymentMethod/management/`](../../../src/components/Employee/PaymentMethod/management/), [`HomeAddress/management/`](../../../src/components/Employee/HomeAddress/management/), [`FederalTaxes/management/`](../../../src/components/Employee/FederalTaxes/management/), [`StateTaxes/management/`](../../../src/components/Employee/StateTaxes/management/), [`Profile/management/`](../../../src/components/Employee/Profile/management/)) — but only `PaymentMethod/management/` is a true card-as-block today. The rest are full-screen edit views the dashboard routes to. This skill is about extending the pattern so each dashboard card has a card-as-block that owns the card view _and_ the edit transitions.

## Standalone composability per piece

The orchestrated block is one of **four** independently consumable surfaces a partner can import per feature. Each piece must stand on its own with an entity-id-shaped API and minimal props. The block is just the convenient pre-wired composition for partners who don't need the pieces individually.

| Surface                  | What it is                                                                                                                       | API shape                                                                    | Reference                                                                                                                                                                                              |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Data hook**            | Non-form hook that returns the card's data + actions in the `BaseHookReady` shape                                                | `use<Feature><Role>({ employeeId }) → HookLoadingResult \| BaseHookReady<…>` | [`useEmployeeList`](../../../src/components/Employee/EmployeeList/shared/useEmployeeList.tsx), [`usePaymentMethodList`](../../../src/components/Employee/PaymentMethod/shared/usePaymentMethodList.ts) |
| **Standalone card**      | The card UI for one section, **doing its own data fetching internally** via the hook above                                       | `<Feature>Card({ employeeId, onEvent })`                                     | [`PaymentMethod/management/ListView.tsx`](../../../src/components/Employee/PaymentMethod/management/ListView.tsx)                                                                                      |
| **Standalone edit/form** | The edit screen for that section, hook-driven per [`migrate-sdk-component-to-hooks`](../migrate-sdk-component-to-hooks/SKILL.md) | `<EditFeature>({ employeeId, onEvent, onCancel })`                           | [`Employee/HomeAddress/management/HomeAddress.tsx`](../../../src/components/Employee/HomeAddress/management/HomeAddress.tsx)                                                                           |
| **Orchestrated block**   | The card + edit screen(s) composed via a local robot3 state machine; what `DashboardFlow` actually imports                       | `<Feature>({ employeeId, onEvent })`                                         | [`Employee/PaymentMethod/management/PaymentMethod.tsx`](../../../src/components/Employee/PaymentMethod/management/PaymentMethod.tsx)                                                                   |

Concrete implications that run through the rest of this skill:

- **The card does its own fetching.** It is not a pure presentational view that receives data as props — it takes `employeeId`, calls its own hook, renders loading/empty/ready states. A partner can drop `<CompensationCard employeeId={…} onEvent={…} />` into any page.
- **The hook is a first-class partner export.** Partners building a fully custom UI consume the hook, not the card. The hook must follow the same `{ isLoading, data, status, actions, errorHandling }` shape every other non-form SDK hook returns ([`BaseHookReady`](../../../src/partner-hook-utils/types.ts)).
- **One card → one dedicated hook.** Today's [`Dashboard/hooks/`](../../../src/components/Employee/Dashboard/hooks/) files bundle several cards' data into one return (e.g. [`useEmployeeBasicDetails`](../../../src/components/Employee/Dashboard/hooks/useEmployeeBasicDetails.tsx) returns employee + home address + work address — three cards' worth of data). These tangles get split per-card during migration so each card gets a narrow, dedicated hook.
- **The block is the convenience surface, not the canonical one.** All four exports — hook, card, edit, block — are first-class. Partners pick the level of composition they want.

### The dashboard composes pieces, not the block

The orchestrated block is **not** what `DashboardFlow` imports after migration. The dashboard and the block are two different ways of composing the same pieces — and they intentionally diverge in UX:

- **The block** (`<Profile employeeId={…} />`) is an in-place card↔edit surface — clicking Edit swaps the card view for the edit form inside the same box, and Cancel/Save returns to the card view in the same box. It is designed for partners who want a single self-contained surface on their own page.
- **The dashboard** is navigation-style — clicking Edit on a card replaces the entire dashboard chrome with the edit screen, and Cancel/Save returns to the dashboard. That UX is the partner-visible behavior of `DashboardFlow` today and must be preserved.

Because of that UX mismatch, **the dashboard imports the individual pieces** — `<FeatureCard />` for the card surface (rendered inline inside the relevant tab view) and `<EditFeature />` for the edit surface (rendered as the contextual adapter for the dashboard's edit state). The dashboard's existing `dashboardStateMachine` continues to handle the card↔edit routing, just with the new scoped event names (see "Dedicated event surface per block" below). The block is never instantiated inside `DashboardFlow`.

This is the canonical mental model for every card migration: the pieces are the primary product; the block is one convenience composition, the dashboard is another convenience composition, and partners can write their own.

## Read these first

Before writing any code, read these files in full. The patterns and code shapes the skill teaches all derive from them:

- **The canonical template** —
  [`Employee/PaymentMethod/management/PaymentMethod.tsx`](../../../src/components/Employee/PaymentMethod/management/PaymentMethod.tsx),
  [`paymentMethodStateMachine.ts`](../../../src/components/Employee/PaymentMethod/management/paymentMethodStateMachine.ts),
  [`PaymentMethodComponents.tsx`](../../../src/components/Employee/PaymentMethod/management/PaymentMethodComponents.tsx),
  [`ListView.tsx`](../../../src/components/Employee/PaymentMethod/management/ListView.tsx) (self-fetching standalone card),
  [`shared/usePaymentMethodList.ts`](../../../src/components/Employee/PaymentMethod/shared/usePaymentMethodList.ts) (the `BaseHookReady`-shaped hook the card and partners both consume),
  [`management/index.ts`](../../../src/components/Employee/PaymentMethod/management/index.ts). This is the only fully-realised card-as-block in the repo today; every new block should look like it.
- **The `BaseHookReady` data-hook contract** —
  [`partner-hook-utils/types.ts`](../../../src/partner-hook-utils/types.ts) (`BaseHookReady`, `HookLoadingResult`, `HookSubmitResult`, `HookErrorHandling`) and a second reference implementation in [`EmployeeList/shared/useEmployeeList.tsx`](../../../src/components/Employee/EmployeeList/shared/useEmployeeList.tsx). Every per-card data hook this skill produces returns the same discriminated union.
- **The workflow-imports-pieces precedent** —
  [`Employee/OnboardingFlow/OnboardingFlow.tsx`](../../../src/components/Employee/OnboardingFlow/OnboardingFlow.tsx),
  [`OnboardingFlowComponents.tsx`](../../../src/components/Employee/OnboardingFlow/OnboardingFlowComponents.tsx),
  [`onboardingStateMachine.ts`](../../../src/components/Employee/OnboardingFlow/onboardingStateMachine.ts). Shows how a thin flow composes per-feature blocks.
- **The pieces-as-named-exports pattern** —
  [`Employee/PaymentMethod/management/index.ts`](../../../src/components/Employee/PaymentMethod/management/index.ts) (`export { ListView }; export { PaymentMethod }; export type { PaymentMethodProps }`). The standalone card and the block are sibling named exports from the same barrel.
- **The hook-driven editing surface this skill builds on top of** —
  [`migrate-sdk-component-to-hooks/SKILL.md`](../migrate-sdk-component-to-hooks/SKILL.md). Edit screens already use form hooks; the block is the orchestrator above them. If a card's edit screen has not been hook-migrated yet, do that first via the other skill, then do the block migration.
- **What you're decomposing** —
  [`Employee/Dashboard/DashboardFlow.tsx`](../../../src/components/Employee/Dashboard/DashboardFlow.tsx),
  [`dashboardStateMachine.ts`](../../../src/components/Employee/Dashboard/dashboardStateMachine.ts),
  [`DashboardComponents.tsx`](../../../src/components/Employee/Dashboard/DashboardComponents.tsx),
  and the relevant tab view file for the card you're migrating ([`BasicDetailsView.tsx`](../../../src/components/Employee/Dashboard/BasicDetailsView.tsx) / [`JobAndPayView.tsx`](../../../src/components/Employee/Dashboard/JobAndPayView.tsx) / [`TaxesView.tsx`](../../../src/components/Employee/Dashboard/TaxesView.tsx) / [`DocumentsView.tsx`](../../../src/components/Employee/Dashboard/DocumentsView.tsx)).

Do not skip these reads. The rest of the skill assumes you've seen the canonical shapes.

## Hard rule: one card per PR

This is the most important constraint in the skill. **A migration PR touches exactly one card.** Bundling multiple cards is forbidden — it makes review hard, regression hunting harder, and it's not necessary because each card is fully independent under the target architecture.

Concrete consequences:

- **The dashboard keeps working between migrations.** After your PR merges, the dashboard renders the new block in that card's slot; every other card still uses the old `DashboardComponents.tsx` adapter + `dashboardStateMachine` path. The two patterns are designed to coexist.
- **Delete only what this PR replaces.** Each PR removes only the dashboard transitions, contextual adapter, prop, and (if applicable) hook file tied to the card it just migrated. It does not touch unrelated cards.
- **`DashboardFlow.tsx` is the only cross-cutting file that shrinks incrementally.** Expect a small, mechanical diff in [`dashboardStateMachine.ts`](../../../src/components/Employee/Dashboard/dashboardStateMachine.ts), [`DashboardComponents.tsx`](../../../src/components/Employee/Dashboard/DashboardComponents.tsx), and the relevant tab view (`BasicDetailsView` / `JobAndPayView` / `TaxesView` / `DocumentsView`) every PR. That is the only fan-out.
- **No "shared cleanup" PRs.** Resist the urge to land a separate refactor that, for example, deletes [`Employee/Dashboard/hooks/`](../../../src/components/Employee/Dashboard/hooks/) once all hooks have moved. That happens naturally inside the PR that migrates the _last_ card whose hook is being relocated.
- **No drive-by renames.** Naming conflicts (e.g. `Employee.HomeAddress` already meaning the edit screen) get handled inside the card's own PR using the rules below — do not pre-emptively rename exports.

The migration checklist at the bottom of this skill has "this PR migrates exactly one card" as its first checkbox.

## Target directory structure (per feature)

Every block produces files in two folders. New standalone-consumable pieces live in their own subdirectory and re-export through an `index.ts`; internal helpers and the block orchestrator stay flat alongside.

```
src/components/Employee/<Feature>/
├── shared/
│   ├── use<Feature><Role>/                 # standalone-consumable hook (new piece)
│   │   ├── use<Feature><Role>.tsx
│   │   ├── use<Feature><Role>.test.tsx
│   │   └── index.ts                        # re-exports the hook + its types
│   └── index.ts                            # feature-level shared barrel
└── management/
    ├── <Feature>.tsx                       # orchestrated block (entry point — stays flat)
    ├── <Feature>.test.tsx                  # block integration test (card + transitions)
    ├── <Feature>Components.tsx             # contextual adapters (internal, not a partner export)
    ├── <feature>StateMachine.ts            # local robot3 machine (internal, not a partner export)
    ├── <Feature>Card/                      # standalone-consumable card (new piece)
    │   ├── <Feature>Card.tsx
    │   ├── <Feature>Card.test.tsx
    │   └── index.ts                        # re-exports the card + its props type
    └── index.ts                            # public re-exports of the standalone pieces
```

### Subfolder-per-piece rule

**Every new standalone-consumable piece this skill creates gets its own subfolder.** The card and the data hook always do. New edit/form screens — when this skill creates one from scratch — also do. The subfolder re-exports the piece through an `index.ts` so importing the piece by its public name resolves transparently:

```ts
// In management/index.ts and in <Feature>Components.tsx — both keep working unchanged.
import { CompensationCard } from './CompensationCard'
```

What stays flat at the root of `management/`:

- **The block orchestrator** (`<Feature>.tsx` + `<Feature>.test.tsx`) — it's the entry-point identity of the folder, same as [`PaymentMethod.tsx`](../../../src/components/Employee/PaymentMethod/management/PaymentMethod.tsx), [`OnboardingFlow.tsx`](../../../src/components/Employee/OnboardingFlow/OnboardingFlow.tsx), and `Compensation.tsx` (onboarding) all do today.
- **Internal helpers** that are not partner-consumable: `<Feature>Components.tsx` (the contextual adapters are wiring between the state machine and the pieces), `<feature>StateMachine.ts`.

What lives in its own subfolder:

- **`<Feature>Card/`** in `management/` — the standalone card and any files that grow with it (`.module.scss`, helpers, presentation/composition split, etc.).
- **`use<Feature><Role>/`** in `shared/` — the standalone hook and any files that grow with it (schemas, fields, helpers).
- **New edit/form screens created by this skill**, if any. Most edit screens already exist as flat files under `management/` from earlier migrations ([`HomeAddress.tsx`](../../../src/components/Employee/HomeAddress/management/HomeAddress.tsx), [`FederalTaxes.tsx`](../../../src/components/Employee/FederalTaxes/management/FederalTaxes.tsx), etc.). **Do not reformat them** — see "Don't reformat existing structures" below.

Subfolder naming preserves the public name exactly: `CompensationCard/CompensationCard.tsx`, not `CompensationCard/Card.tsx`. The folder name and the primary file name match; the `index.ts` re-export keeps consumer imports identical.

### Don't reformat existing structures

This skill creates new pieces in subfolders. It does **not** restructure existing files in features whose pieces are currently flat. Leave [`PaymentMethod/shared/usePaymentMethodList.ts`](../../../src/components/Employee/PaymentMethod/shared/usePaymentMethodList.ts), [`PaymentMethod/management/ListView.tsx`](../../../src/components/Employee/PaymentMethod/management/ListView.tsx), [`HomeAddress/management/HomeAddress.tsx`](../../../src/components/Employee/HomeAddress/management/HomeAddress.tsx), and similar where they are. A "reformat the existing pieces" pass, if desired, is a separate follow-up — not bundled into a card migration PR.

The corollary is that the canonical references this skill cites for the _code shape_ (`PaymentMethod/management/ListView.tsx` as the self-fetching standalone card, `PaymentMethod/shared/usePaymentMethodList.ts` as the `BaseHookReady`-shaped hook) are flat by historical accident. The pattern they demonstrate is correct; the file layout for any _new_ piece this skill produces uses a subfolder.

### Why each piece is separate

- **`<Feature>Card`** is one of the standalone partner-consumable surfaces. A partner who only wants the card pulls it independently of the block: `import { CompensationCard } from '@gusto/embedded-react-sdk'`. Inlining the card inside `<Feature>.tsx` would force partners to bring the state machine along to get the card, defeating the point.
- **`use<Feature><Role>` lives in `shared/`**, not `management/`, because it is itself a standalone partner export — partners building a fully custom UI consume the hook directly. `shared/` is where every other partner hook (`useEmployeeList`, `usePaymentMethodList`, `useDeductionsList`, …) lives.
- **`<Feature>.tsx` (the block)** does no fetching of its own; it just builds the robot3 machine and renders `<Flow />`. The card it composes still does its own fetching via the hook.
- **Edit screens that already exist** under `management/` ([`HomeAddress.tsx`](../../../src/components/Employee/HomeAddress/management/HomeAddress.tsx), [`FederalTaxes.tsx`](../../../src/components/Employee/FederalTaxes/management/FederalTaxes.tsx)) stay where they are. The contextual adapter in `<Feature>Components.tsx` renders them in the appropriate `edit*` state.
- **Features without a `management/` folder** (e.g. `Deductions`, `Paystubs`) get one. Do not invent a different layout.

## Naming conventions

| Thing                           | Name                                                                                                                                             |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Block component                 | Feature name (`Compensation`, `Deductions`, `Documents`, …)                                                                                      |
| State machine context interface | `<Feature>ContextInterface`                                                                                                                      |
| State machine                   | `<feature>StateMachine`                                                                                                                          |
| Contextual adapters             | `<Action>Contextual` (e.g. `CardContextual`, `CompensationEditFormContextual`, `CompensationAddJobFormContextual`)                               |
| Standalone card                 | `<Feature>Card` (self-fetching via the data hook)                                                                                                |
| Standalone edit form            | `<Feature>EditForm` for the single-form case; `<Feature><Action>Form` (`CompensationAddJobForm`, `CompensationEditJobForm`) for multi-action     |
| Data hook                       | `use<Feature><Role>` — e.g. `useCompensationManagement`, `usePaymentMethodList` (matches the existing naming for non-form list/management hooks) |
| State machine states            | `card` (initial), one `<action>` per edit CTA (`editJob`, `addJob`, `editFederal`, `viewForm`, …)                                                |

`card` (not `index`, not `list`) is the canonical initial state name for a card-as-block. Use `index` only when an existing block already does (e.g. `dashboardStateMachine`) — new blocks should standardise on `card`. `PaymentMethod/management` uses `list` for historical reasons; that's an exception, not a model.

**Component names follow the domain folder, not the dashboard's display copy.** The card the dashboard surfaces as "Basic details" is exported as `ProfileCard` because it lives under `Employee/Profile/`. The i18n keys for the surface label (`Employee.Dashboard:basicDetails.*`) stay where they are — they're the partner-visible copy contract. See "Cards in scope" for the full surface-label-to-component-name mapping.

**Subordinate pieces of a block start with the block name, not the action.** Use `ProfileEditForm`, not `EditProfile`; `HomeAddressEditForm`, not `EditHomeAddress`; `CompensationAddJobForm`, not `AddJobForCompensation`. The SDK dev app's sidebar lists every component in a category alphabetically, so feature-prefixed names group all of a block's pieces together (`Profile`, `ProfileCard`, `ProfileEditForm`) instead of scattering them under the action verb (`EditProfile` under "E", `Profile`/`ProfileCard` under "P"). This applies to the public export name, the file name, the component function, and the contextual adapter (`ProfileEditFormContextual`). State machine state names stay verb-ish (`editProfile`, `addJob`) — they describe what the user is doing, are internal, and never reach the sidebar.

## The card component contract

`<Feature>Card.tsx` is a **standalone, self-fetching component** — not a presentational view. It must:

- Take only the entity id and `onEvent` as required props: `{ employeeId, onEvent }`. Same shape every other standalone SDK component takes. No `data`, no `isLoading`, no `on<Action>` callbacks — those are internal concerns.
- Call its dedicated data hook (`use<Feature><Role>`) internally and branch on the discriminated `HookLoadingResult | BaseHookReady<…>` return.
- Use [`BaseLayout`](../../../src/components/Base/Base.tsx) for the loading/error envelope (`<BaseLayout isLoading error={errorHandling.errors} />` while the hook is loading; `<BaseLayout error={errorHandling.errors}>…</BaseLayout>` once ready), matching every other standalone SDK component.
- Use `Components.Box` + `Components.BoxHeader` with an `action` button for the card chrome (matches every existing card in the dashboard today).
- Fire `componentEvents.<EVENT>` via `onEvent` for every CTA. **Never import the state machine** — the card has no idea whether it's sitting inside the orchestrated block or in a partner's own page.
- Render its own success alert if applicable (driven by transient state owned by the card or by a controlled prop on the orchestrated block — see "Success alerts" below).

The canonical reference is [`PaymentMethod/management/ListView.tsx`](../../../src/components/Employee/PaymentMethod/management/ListView.tsx). It takes `{ employeeId, onEvent }`, calls `usePaymentMethodList({ employeeId })` internally, gates on `paymentMethodList.isLoading`, fires `componentEvents.EMPLOYEE_BANK_ACCOUNT_CREATE` / `EMPLOYEE_SPLIT_PAYCHECK` / `EMPLOYEE_BANK_ACCOUNT_DELETED` via `onEvent`. That is exactly the shape every new `<Feature>Card.tsx` should match.

Sketch:

```tsx
import { useCompensationManagement } from '../shared/useCompensationManagement'
import { BaseLayout } from '@/components/Base/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { componentEvents, type EventType } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'

export interface CompensationCardProps {
  employeeId: string
  onEvent: OnEventType<EventType, unknown>
}

export function CompensationCard({ employeeId, onEvent }: CompensationCardProps) {
  const compensation = useCompensationManagement({ employeeId })

  if (compensation.isLoading) {
    return <BaseLayout isLoading error={compensation.errorHandling.errors} />
  }

  const Components = useComponentContext()
  const { jobs, pendingChanges } = compensation.data
  // …render Box + BoxHeader + sections, fire componentEvents via onEvent…
}
```

When you build `<Feature>Card.tsx`, lift the JSX for that card section out of the current tab view file ([`BasicDetailsView`](../../../src/components/Employee/Dashboard/BasicDetailsView.tsx) is the template for multi-section cards, [`DocumentsView`](../../../src/components/Employee/Dashboard/DocumentsView.tsx) for single-table cards), then swap the prop-driven data inputs for the dedicated hook call and the prop-driven action callbacks for direct `onEvent` calls.

## State machine pattern

The minimum shape is three states: `card` (initial) + one `edit*` state per CTA + a transition back to `card`. Reuse the `returnToIndex` reducer helper exactly as [`dashboardStateMachine.ts`](../../../src/components/Employee/Dashboard/dashboardStateMachine.ts) defines it today (lines 31–50), renamed to `returnToCard` for the new state name:

```ts
import { transition, reduce, state } from 'robot3'
import {
  CardContextual,
  CompensationEditFormContextual,
  CompensationAddJobFormContextual,
  type CompensationContextInterface,
} from './CompensationComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineTransition } from '@/types/Helpers'

const returnToCard = reduce(
  (ctx: CompensationContextInterface): CompensationContextInterface => ({
    ...ctx,
    component: CardContextual,
    successAlert: null,
    currentJob: null,
  }),
)

const returnToCardWithAlert = (alert: CompensationContextInterface['successAlert']) =>
  reduce(
    (ctx: CompensationContextInterface): CompensationContextInterface => ({
      ...ctx,
      component: CardContextual,
      successAlert: alert,
      currentJob: null,
    }),
  )

export const compensationStateMachine = {
  card: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_COMPENSATION_CREATE,
      'editCompensation',
      reduce(
        (ctx: CompensationContextInterface, ev): CompensationContextInterface => ({
          ...ctx,
          component: CompensationEditFormContextual,
          currentJob: ev.payload.job,
          successAlert: null,
        }),
      ),
    ),
    // …one transition per CTA on the card…
  ),
  editCompensation: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_COMPENSATION_DONE,
      'card',
      returnToCardWithAlert('jobUpdated'),
    ),
    transition(componentEvents.CANCEL, 'card', returnToCard),
  ),
  addJob: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_COMPENSATION_UPDATED,
      'card',
      returnToCardWithAlert('jobAdded'),
    ),
    transition(componentEvents.CANCEL, 'card', returnToCard),
  ),
}
```

Block file:

```tsx
import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { compensationStateMachine } from './compensationStateMachine'
import { CardContextual, type CompensationContextInterface } from './CompensationComponents'
import { Flow } from '@/components/Flow/Flow'
import { BaseBoundaries, type BaseComponentInterface } from '@/components/Base'

export interface CompensationProps extends BaseComponentInterface {
  employeeId: string
}

export function Compensation({ employeeId, onEvent, FallbackComponent }: CompensationProps) {
  const machine = useMemo(
    () =>
      createMachine('card', compensationStateMachine, (ctx: CompensationContextInterface) => ({
        ...ctx,
        component: CardContextual,
        employeeId,
      })),
    [employeeId],
  )

  return (
    <BaseBoundaries
      componentName="Employee.Compensation.Management"
      FallbackComponent={FallbackComponent}
    >
      <Flow machine={machine} onEvent={onEvent} />
    </BaseBoundaries>
  )
}
```

## Contextual adapters

`<Feature>Components.tsx` is the bridge between the state machine and the leaf components. Same shape as [`PaymentMethodComponents.tsx`](../../../src/components/Employee/PaymentMethod/management/PaymentMethodComponents.tsx) and [`DashboardComponents.tsx`](../../../src/components/Employee/Dashboard/DashboardComponents.tsx):

```tsx
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import { ensureRequired } from '@/helpers/ensureRequired'
import { componentEvents } from '@/shared/constants'
import { CompensationCard } from './CompensationCard'
import { CompensationEditForm } from './CompensationEditForm'

export interface CompensationContextInterface extends FlowContextInterface {
  employeeId: string
  currentJob?: Job | null
  successAlert?: 'jobAdded' | 'jobUpdated' | null
}

export function CardContextual() {
  const { employeeId, onEvent } = useFlow<CompensationContextInterface>()
  return <CompensationCard employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
}

export function CompensationEditFormContextual() {
  const { employeeId, currentJob, onEvent } = useFlow<CompensationContextInterface>()
  return (
    <CompensationEditForm
      employeeId={ensureRequired(employeeId)}
      jobId={ensureRequired(currentJob?.uuid)}
      onEvent={onEvent}
      onCancel={() => onEvent(componentEvents.CANCEL, null)}
    />
  )
}
```

Note how thin `CardContextual` is: the card owns its own data fetching and fires its own `componentEvents` via `onEvent`, so the adapter just forwards `employeeId` + `onEvent` from flow context. `CompensationEditFormContextual` is the only adapter that has to do real work — pulling per-transition context off the flow (e.g. `currentJob`) to seed the edit screen, and translating its `onCancel` into a `CANCEL` event. The state machine handles `CANCEL` and the edit screen's `onEvent` (e.g. `EMPLOYEE_COMPENSATION_DONE`) by transitioning back to `card`; the card's own events (e.g. `EMPLOYEE_COMPENSATION_CREATE`) transition forward to `editCompensation`.

## Dedicated event surface per block

Every new management block defines and fires its **own** `componentEvent` constants. It does not reuse onboarding events, sibling-block events, or the dashboard's current event names. A block is a partner-consumable surface; its event names belong to it. If a partner is wiring `<CompensationCard />` directly into their own page, the events they listen for should be unambiguously the card's — not bleed in from the onboarding flow's event vocabulary, not depend on what the dashboard happens to forward today.

### Naming convention

Add the block's events to [`src/shared/constants.ts`](../../../src/shared/constants.ts) under the existing `componentEvents` object. Use a `_MANAGEMENT_` segment in the constant key and a `/management/` segment in the slash-delimited string value so management events are unambiguously distinct from onboarding/dashboard equivalents:

```ts
// src/shared/constants.ts
export const componentEvents = {
  // …existing events…

  // Compensation management block — owned by Employee/Compensation/management/
  EMPLOYEE_COMPENSATION_MANAGEMENT_EDIT_REQUESTED: 'employee/compensation/management/editRequested',
  EMPLOYEE_COMPENSATION_MANAGEMENT_ADD_JOB_REQUESTED:
    'employee/compensation/management/addJobRequested',
  EMPLOYEE_COMPENSATION_MANAGEMENT_JOB_UPDATED: 'employee/compensation/management/jobUpdated',
  EMPLOYEE_COMPENSATION_MANAGEMENT_JOB_ADDED: 'employee/compensation/management/jobAdded',
  EMPLOYEE_COMPENSATION_MANAGEMENT_JOB_DELETED: 'employee/compensation/management/jobDeleted',
  // …
} as const
```

The card, the edit screen, and the block all fire only these scoped events via `onEvent`. The state machine's transitions match on them.

### No compatibility shim during pre-release

The SDK is pre-release — there are no external partners consuming `DashboardFlow` today, so renaming a dashboard event from `EMPLOYEE_COMPENSATION_CREATED` to `EMPLOYEE_COMPENSATION_MANAGEMENT_JOB_ADDED` is not a breaking change. `DashboardFlow` simply forwards whatever its inner card blocks emit:

```tsx
// src/components/Employee/Dashboard/DashboardFlow.tsx
export const DashboardFlow = ({ employeeId, onEvent }: DashboardFlowProps) => {
  const dashboardMachine = useMemo(/* …unchanged… */, [employeeId])
  return <Flow machine={dashboardMachine} onEvent={onEvent} />
}
```

Concrete consequences for a card migration:

- The `dashboardStateMachine` transitions retarget from any legacy event name to the new scoped event in the same PR. No translation layer.
- Any `Dashboard.test.tsx` cases that asserted the legacy event name (e.g. `expect(onEvent).toHaveBeenCalledWith(componentEvents.EMPLOYEE_UPDATE, …)`) get updated to assert the scoped name (e.g. `EMPLOYEE_PROFILE_MANAGEMENT_EDIT_REQUESTED`). Those tests are pinning internal behavior, not a partner contract — the rename _is_ the change under test.
- No need to enumerate the dashboard's pre-migration event surface or capture a translation table in the PR description. The new scoped events _are_ the surface.

If the SDK ever ships a stable release and a later card migration would rename a partner-visible event, that's when a translation shim at the `DashboardFlow` boundary becomes worth introducing. Until then, skip it — it's dead weight, an extra layer for reviewers to follow, and a test that pins behavior nobody depends on.

### Events that don't need any work

If the dashboard never emitted an event for this card surface (e.g. Paystubs has no existing event surface beyond the download side effect), the migration just adds the block's scoped events. No legacy keys to retire.

## Success alerts: orchestrator-owned, two-mode

Alerts are rendered by the **orchestrator**, not the card. The card stays a pure standalone surface with only `{ employeeId, onEvent }` — it has no `successAlert` / `onDismissAlert` props. Each orchestrator owns its own alert placement at the location idiomatic for its chrome:

- **Standalone block** (`<Profile employeeId={…} onEvent={…} />`) — the block's `CardContextual` reads `successAlert` from flow context and renders `<Components.Alert>` directly **above** the card.
- **Dashboard** (`<DashboardFlow />`) — [`DashboardViewContextual`](../../../src/components/Employee/Dashboard/DashboardComponents.tsx) renders alerts at the **top** of the dashboard chrome using its existing `DashboardSuccessAlert` union + `returnToIndexWithAlert(...)` pattern. The dashboard chrome stays; it's the right scope for dashboard-mode alerts.
- **Direct card** (`<ProfileCard employeeId={…} onEvent={…} />` mounted by a partner without a Flow) — no built-in alert. The partner owns their own notification UI.

Same event drives both orchestrators. When the edit screen fires `EMPLOYEE_<FEATURE>_MANAGEMENT_UPDATED`, whichever state machine is in scope catches it; both end up with `successAlert: '<code>'` in their respective contexts, and the two contextual layers each render at the right spot.

### When does this card need alert wiring?

Check whether the card had a pre-existing entry in [`DashboardSuccessAlert`](../../../src/components/Employee/Dashboard/DashboardComponents.tsx) and a corresponding `returnToIndexWithAlert(...)` call in [`dashboardStateMachine.ts`](../../../src/components/Employee/Dashboard/dashboardStateMachine.ts) **before** your migration touches the file.

- **Pre-existing alert (port it forward):** Compensation/`jobAdded`, PaymentMethod/`bankAccountAdded` / `bankAccountDeleted` / `splitUpdated`, Deductions/`deductionAdded` / `deductionUpdated` / `deductionDeleted`. Port the existing dashboard behavior plus add the same alert to the new block. Both modes show the alert.
- **No pre-existing alert (don't introduce one):** Profile, Home/Work Address, Federal/State Taxes, Documents. The structural migration is **not** the place to add a new banner — that's separate feature work. Ship the card without alert wiring; if product later decides to add an alert, do it as a scoped PR that touches both orchestrators together.

The Profile card extraction got this wrong in its first iteration (added a `'profileUpdated'` alert that didn't exist pre-refactor, on the card itself, only in standalone mode) — the corrective work is what set the orchestrator-owned pattern documented here.

### Wiring for cards that genuinely need an alert

1. **Add the alert code to both orchestrators:**
   - Block: `<Feature>ContextInterface.successAlert?: <FeatureSuccessAlertCode> | null` (alongside the block's own state-machine context).
   - Dashboard: add the code to the [`DashboardSuccessAlert`](../../../src/components/Employee/Dashboard/DashboardComponents.tsx) union and a `<code>: t('alerts.<code>')` entry to the `alertLabels` map in `DashboardViewContextual`.
2. **Wire the success transition in both state machines:**
   - Block (`<feature>StateMachine.ts`): `transition(EMPLOYEE_<FEATURE>_MANAGEMENT_UPDATED, 'card', returnToCardWithAlert('<code>'))`.
   - Dashboard ([`dashboardStateMachine.ts`](../../../src/components/Employee/Dashboard/dashboardStateMachine.ts)): in the corresponding sub-state, add `transition(EMPLOYEE_<FEATURE>_MANAGEMENT_UPDATED, 'index', returnToIndexWithAlert('<code>'))` alongside the existing `CANCEL` transition.
3. **Block's `CardContextual` renders the alert above the card** (the card itself stays alert-free):
   ```tsx
   export function CardContextual() {
     const { employeeId, onEvent, successAlert } = useFlow<FeatureContextInterface>()
     const { t } = useTranslation('Employee.<Feature>.Management')
     const Components = useComponentContext()
     return (
       <Flex flexDirection="column" gap={16}>
         {successAlert ? (
           <Components.Alert
             status="success"
             label={t(`alerts.${successAlert}`)}
             onDismiss={() => onEvent(componentEvents.EMPLOYEE_DISMISS, null)}
           />
         ) : null}
         <FeatureCard employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
       </Flex>
     )
   }
   ```
4. **i18n: duplicate the label across both namespaces.** Blocks don't read across namespaces, and the dashboard chrome reads from `Employee.Dashboard`. Add `alerts.<code>` to both `Employee.<Feature>.Management.json` and `Employee.Dashboard.json`. Re-run `npm run i18n:generate`.
5. **Test in both layers.**
   - Block: a block-integration test in `management/<Feature>.test.tsx` rendering `<Feature>` and asserting the alert text appears after Edit → Save.
   - Dashboard: a chrome-alert test in `Dashboard/Dashboard.test.tsx` rendering `<DashboardFlow />` (not bare `<Dashboard />` — the chrome only lives inside the flow context) and asserting the same.

The card test stays focused on the card's two concerns: rendering its data and firing the edit-requested event. No alert assertions belong there.

## Data hooks

Each card gets a dedicated, narrowly-scoped data hook that the card calls internally _and_ that ships as a standalone partner export. The hook is the first of the four standalone surfaces (see "Standalone composability per piece" at the top); the card is a thin shell over it.

### Hook shape

The hook returns the standard `HookLoadingResult | BaseHookReady<TData, TStatus>` discriminated union from [`partner-hook-utils/types.ts`](../../../src/partner-hook-utils/types.ts). Same shape as [`useEmployeeList`](../../../src/components/Employee/EmployeeList/shared/useEmployeeList.tsx) and [`usePaymentMethodList`](../../../src/components/Employee/PaymentMethod/shared/usePaymentMethodList.ts):

```ts
import type { BaseHookReady, HookLoadingResult, HookSubmitResult } from '@/partner-hook-utils/types'

export interface UseCompensationManagementParams {
  employeeId: string
}

export interface UseCompensationManagementReady extends BaseHookReady<
  { jobs: Job[]; pendingChanges: PendingChange[] },
  { isFetching: boolean; isPending: boolean }
> {
  actions: {
    onDeleteJob: (jobUuid: string) => Promise<HookSubmitResult<void> | undefined>
  }
}

export type UseCompensationManagementResult = HookLoadingResult | UseCompensationManagementReady

export function useCompensationManagement({
  employeeId,
}: UseCompensationManagementParams): UseCompensationManagementResult {
  // …`@gusto/embedded-api` queries, composeErrorHandler, useBaseSubmit, return loading/ready…
}
```

Required ingredients (all visible in the two reference hooks above):

- Query data from `@gusto/embedded-api/react-query/...` hooks; mutations from `@gusto/embedded-api/react-query/...Mutation`.
- [`composeErrorHandler([…queries], { submitError, setSubmitError })`](../../../src/partner-hook-utils/composeErrorHandler.ts) for `errorHandling`. Pass every query the hook depends on.
- [`useBaseSubmit('<HookName>')`](../../../src/components/Base/useBaseSubmit.ts) for `baseSubmitHandler`, `submitError`, `setSubmitError`.
- Loading branch returns `{ isLoading: true, errorHandling }`; ready branch returns the full `BaseHookReady` shape with `data`, `status`, `actions`, `errorHandling`.

The card consumes the discriminated union and branches on `isLoading`. Mutations go through `actions` so partners building custom UIs get the same action surface as the SDK's card.

### Disentangling the existing dashboard hooks

The hooks under [`Employee/Dashboard/hooks/`](../../../src/components/Employee/Dashboard/hooks/) ([`useEmployeeBasicDetails`](../../../src/components/Employee/Dashboard/hooks/useEmployeeBasicDetails.tsx), [`useEmployeeCompensation`](../../../src/components/Employee/Dashboard/hooks/useEmployeeCompensation.tsx), [`useEmployeeTaxes`](../../../src/components/Employee/Dashboard/hooks/useEmployeeTaxes.tsx), [`useEmployeeForms`](../../../src/components/Employee/Dashboard/hooks/useEmployeeForms.tsx)) are tab-scoped — each one currently bundles data for multiple cards on the same tab into a single return value. That has to be split per-card so each card gets a hook that only knows about its own data, returns the `BaseHookReady` shape, and is independently consumable.

Rules:

- **One PR moves (and if needed, splits) one card's hook.** If a hook serves multiple cards (e.g. `useEmployeeBasicDetails` covers basic details + home address + work address — three cards), the split happens inside the PR for the _first_ card whose migration needs it. That PR creates the narrow per-card hook(s) and either deletes the tab-scoped hook (if the migration consumes the last card it served) or leaves it temporarily for the remaining cards' tab view to read from.
- **Reshape to `BaseHookReady` while moving.** Today's tab hooks return ad-hoc shapes (e.g. `{ employee, currentHomeAddress, isEmployeeLoading, isHomeAddressLoading }`). After migration each hook returns the discriminated union shown above. Do not lift the old shape — rewrite to match `useEmployeeList` / `usePaymentMethodList`.
- **Rename to drop the `Employee` prefix when colocated.** Under `Employee/<Feature>/shared/` the prefix is redundant and creates confusion with form hooks (`useEmployeeCompensation` next to `useCompensationForm`). Target names per the table below:

| Today                                                        | After migration                                                                                                                                                                                                                                           |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useEmployeeCompensation` (data fetch for compensation card) | `useCompensationManagement` under `Compensation/shared/`                                                                                                                                                                                                  |
| `useEmployeeBasicDetails` (employee + home + work)           | Split into `useEmployeeProfileSummary` (`Profile/shared/`), `useHomeAddressManagement` (`HomeAddress/shared/`) wrapping `useEmployeeAddressesGet`, and `useWorkAddressManagement` (`WorkAddress/shared/`) wrapping `useEmployeeAddressesGetWorkAddresses` |
| `useEmployeeTaxes` (federal + state)                         | Split into `useFederalTaxesSummary` (`FederalTaxes/shared/`) and `useStateTaxesSummary` (`StateTaxes/shared/`)                                                                                                                                            |
| `useEmployeeForms`                                           | `useEmployeeFormsList` under `Documents/shared/`                                                                                                                                                                                                          |

Wrap the raw `@gusto/embedded-api` query in a thin hook even when one address query maps directly to one card — that's how partners get the `BaseHookReady` ergonomics, error composition, and a stable name they can import.

- **`shared/` folders that already exist** ([`Compensation/shared/`](../../../src/components/Employee/Compensation/shared/), [`Deductions/shared/`](../../../src/components/Employee/Deductions/shared/), [`PaymentMethod/shared/`](../../../src/components/Employee/PaymentMethod/shared/)) take the new hook as a sibling. Update the feature's `shared/index.ts` barrel to export the hook + its types.
- **Update [`Dashboard/hooks/index.ts`](../../../src/components/Employee/Dashboard/hooks/index.ts)** to drop the moved hook. When the file becomes empty, delete `Dashboard/hooks/` in the same PR.

## Translations (dedicated i18n namespace per block)

Every new management block ships its own translation namespace. The block, the card, the edit screen, and the hook all read from this namespace and **only** this namespace. A partner consuming a block in isolation must not have to load `Employee.Dashboard` (or any other unrelated namespace) to get the strings the block renders.

### Naming convention

| Thing                | Convention                                                                                                                                                             |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Namespace name       | `Employee.<Feature>.Management`                                                                                                                                        |
| Translation file     | `src/i18n/en/Employee.<Feature>.Management.json` (and locale equivalents)                                                                                              |
| Registration in code | `useI18n('Employee.<Feature>.Management')` (block, card, edit screen)                                                                                                  |
| Partner override     | `useComponentDictionary('Employee.<Feature>.Management', dictionary)` per [`HomeAddress.tsx`](../../../src/components/Employee/HomeAddress/management/HomeAddress.tsx) |

The convention already exists for two features ([`Employee.HomeAddress.Management.json`](../../../src/i18n/en/Employee.HomeAddress.Management.json), [`Employee.WorkAddress.Management.json`](../../../src/i18n/en/Employee.WorkAddress.Management.json)) — match those for every new block. Run `npm run i18n:generate` after creating/changing the file so the typed key contract is regenerated.

### What goes in the file

Every string the block, the card, the edit screen, or the hook displays:

- Card chrome: section titles, descriptions, action button labels, empty states.
- Edit screen labels and copy that isn't already in a sibling namespace.
- Success alert labels (`alerts.jobAdded`, `alerts.jobUpdated`, etc.) — these move out of `Employee.Dashboard:alerts.*` into the block's namespace because the alert now renders inside the card, not above the tabs.
- Error/empty/loading states the card displays.

The block does **not** read from `Employee.Dashboard`. Whatever the card surfaces today via `Employee.Dashboard:<feature>.*` (or `Employee.Dashboard:basicDetails.*` for Profile) **moves** into the block's namespace during migration. Don't dual-register or alias the keys — relocate them, delete the dashboard counterparts.

### When the feature already has multiple namespaces

Some features have `Employee.<Feature>.json` (the onboarding/form namespace) plus `Employee.<Feature>.Management.json` (the management namespace). Pattern from [`HomeAddress.tsx`](../../../src/components/Employee/HomeAddress/management/HomeAddress.tsx):

```tsx
useI18n(['Employee.HomeAddress.Management', 'Employee.HomeAddress'])
```

The management block can load both: its own `Management` namespace for management-specific strings, plus the feature's base namespace for strings shared with the edit/form path. The block's _new_ strings always go into `.Management.json`; reuse from the base namespace only for strings that genuinely live in both contexts (e.g. validation messages on a form field shared with onboarding). When in doubt, copy the string into `.Management.json` — duplication is cheaper than coupling the block to onboarding's namespace.

### Strings to move out of `Employee.Dashboard` during migration

The current [`Employee.Dashboard.json`](../../../src/i18n/en/Employee.Dashboard.json) bundles every card's copy under tab-scoped keys (`basicDetails.*`, `homeAddress.*`, `workAddress.*`, `jobAndPay.compensation.*`, `jobAndPay.payment.*`, `jobAndPay.deductions.*`, `jobAndPay.paystubs.*`, `taxes.federal.*`, `taxes.state.*`, `documents.*`, `alerts.*`). Each card's migration relocates its slice:

| Source keys in `Employee.Dashboard:`                                    | Target file                                                                                                 |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `basicDetails.*` + relevant `alerts.*`                                  | `Employee.Profile.Management.json` (card-specific subtree)                                                  |
| `homeAddress.*` + relevant `alerts.*`                                   | Merge into existing `Employee.HomeAddress.Management.json`                                                  |
| `workAddress.*` + relevant `alerts.*`                                   | Merge into existing `Employee.WorkAddress.Management.json`                                                  |
| `jobAndPay.compensation.*` + `alerts.jobAdded` etc.                     | `Employee.Compensation.Management.json` (new file)                                                          |
| `jobAndPay.payment.*` + `alerts.bankAccountAdded` / `splitUpdated` etc. | `Employee.PaymentMethod.Management.json` (new file)                                                         |
| `jobAndPay.deductions.*` + `alerts.deductionAdded` etc.                 | `Employee.Deductions.Management.json` (new file)                                                            |
| `jobAndPay.paystubs.*`                                                  | `Employee.Paystubs.Management.json` (new file)                                                              |
| `taxes.federal.*`                                                       | Merge into existing `Employee.FederalTaxes.json` (or split into `.Management.json` if the file grows large) |
| `taxes.state.*`                                                         | Merge into existing `Employee.StateTaxes.json` (same caveat)                                                |
| `documents.*`                                                           | `Employee.Documents.Management.json` (new file)                                                             |

Each card's PR deletes the moved keys from `Employee.Dashboard.json` and the corresponding `useTranslation('Employee.Dashboard')` calls inside the relocated component. The dashboard tab views (`BasicDetailsView`, `JobAndPayView`, etc.) shrink as the cards leave; whatever `Employee.Dashboard` keys remain are tab-chrome strings only (tab labels, page header), not card content. When the last card migrates, `Employee.Dashboard.json` should contain only tab/page chrome — and if even that's gone, the file gets deleted in the last card's PR.

## Exports

All four standalone surfaces are public partner exports. They sit alongside each other as plain named exports across two barrels — match [`PaymentMethod/management/index.ts`](../../../src/components/Employee/PaymentMethod/management/index.ts) and [`PaymentMethod/shared/index.ts`](../../../src/components/Employee/PaymentMethod/shared/index.ts):

`Employee/<Feature>/management/index.ts`:

```ts
export { CompensationCard } from './CompensationCard'
export type { CompensationCardProps } from './CompensationCard'
export { Compensation } from './Compensation'
export type { CompensationProps } from './Compensation'
export { CompensationEditForm } from './CompensationEditForm'
export type { CompensationEditFormProps } from './CompensationEditForm'
```

If a previous version of this feature already shipped under a legacy export name (e.g. `ManagementEditCompensation` re-exported from `Employee/exports/employeeManagement.ts`), keep the legacy name as a deprecated alias for one release window before deleting it, rather than renaming it in-place. Drop it from the barrel in the cleanup PR after partners have had a release to migrate.

`Employee/<Feature>/shared/index.ts`:

```ts
export { useCompensationManagement } from './useCompensationManagement'
export type {
  UseCompensationManagementParams,
  UseCompensationManagementResult,
  UseCompensationManagementReady,
} from './useCompensationManagement'
```

Do **not** attach pieces as `Block.Card = …` / `Block.EditScreen = …` namespace properties. That dot-notation is a one-off in [`Compensation/onboarding/Compensation.tsx`](../../../src/components/Employee/Compensation/onboarding/Compensation.tsx) and is not the SDK convention — none of the existing management blocks use it.

- Add the block to [`Employee/exports/employeeManagement.ts`](../../../src/components/Employee/exports/employeeManagement.ts) if it isn't already exposed there.
- **Naming conflict resolution.** When a feature's current `management/<Feature>.tsx` is an edit screen with the same name as the new block (e.g. `Employee.HomeAddress` today _is_ the edit screen), rename the existing edit screen to `<Feature>EditForm` (matching the subordinate-piece convention — see "Naming conventions" above), then take the original name for the new block. Update the export in `employeeManagement.ts` _in the same PR_ to keep the public surface intact:

  ```ts
  // Before
  export { HomeAddress } from '../HomeAddress/management/HomeAddress'
  // After
  export { HomeAddress } from '../HomeAddress/management/HomeAddress' // now the block
  export { HomeAddressEditForm } from '../HomeAddress/management/HomeAddressEditForm' // renamed edit screen
  ```

  Do this inside the card's own migration PR. No drive-by renames.

## Integrating into DashboardFlow (one card at a time)

The dashboard composes pieces (card + edit screen), not the block. The cleanup in `DashboardFlow` is small and mechanical. Touch only the card you migrated:

1. **`dashboardStateMachine.ts`** — update the transition triggers from the legacy event names to the new scoped events (e.g. `EMPLOYEE_COMPENSATION_CREATE` → `EMPLOYEE_COMPENSATION_MANAGEMENT_EDIT_REQUESTED`). The `index` and sub-state structure stays — the dashboard still needs to nav between the card surface and the edit surface. Update the `returnToIndexWithAlert(...)` triggers similarly for any `EMPLOYEE_<FEATURE>_<ACTION>_DONE`-style events the edit screen now fires under scoped names. Move the card's `successAlert` codes out of `DashboardContextInterface.successAlert` if and only if the dashboard no longer needs to render that alert at the tabs level (most cards: drop the alert from the dashboard and let the card render it itself once the card is the partner-visible surface; some cards may keep a dashboard-level alert at the page level — call this out per-card).
2. **`DashboardComponents.tsx`** — update the contextual adapter for the card's edit state(s) to render the renamed `<EditFeature />` piece (the renamed standalone edit screen) instead of the previous import. The contextual adapter remains a thin pull-from-flow-context shell. Do **not** delete it — the dashboard still routes here when its state machine enters the edit sub-state.
3. **Tab view (`BasicDetailsView.tsx` / `JobAndPayView.tsx` / `TaxesView.tsx` / `DocumentsView.tsx`)** — delete the inline card markup for this card and replace it with the standalone card piece: `<FeatureCard employeeId={employeeId} onEvent={onEvent} />`. The tab view stops being responsible for the card's data fetch (the card owns it) and stops needing per-card edit callbacks (the card fires events directly).
4. **`Dashboard.tsx`** — drop the `handle<X>` callbacks that fed the inline card. The card now fires its scoped events through the `onEvent` flowing in from `useFlow`.

`DashboardFlow.tsx` itself isn't touched per-card during pre-release — it's just `<Flow machine={dashboardMachine} onEvent={onEvent} />`. See "No compatibility shim during pre-release" above for why.

Every untouched card still goes through the old monolithic path — its inline markup, its `handle<X>` callback, its legacy state-machine transition. The two patterns coexist intentionally.

### What the final-card PR cleans up

`dashboardStateMachine.ts`, `DashboardComponents.tsx`, and `DashboardFlow.tsx` **stay** after the last card migrates — the dashboard still routes between card and edit surfaces. What the final PR can delete:

- `Employee/Dashboard/hooks/` once `hooks/index.ts` is empty (every per-card hook has moved to its feature's `shared/`).
- Per-card view files (`BasicDetailsView.tsx`, `JobAndPayView.tsx`, etc.) if they have collapsed to thin "render these N cards in a flex column" wrappers — these can be inlined into `Dashboard.tsx` if the savings are real, or kept as-is for grouping clarity. Not required.
- The dashboard-level `successAlert` chrome in `DashboardViewContextual` if every card has taken ownership of its own alert.

`DashboardFlow.tsx` and `dashboardStateMachine.ts` keep their structure; only the event names and the imports change.

## Surface the new pieces in the SDK dev app

The dev app (`sdk-app/`) drives its sidebar from a generated registry that statically analyzes every named export of every namespace listed in [`sdk-app/scripts/analyze-component-props.ts`](../../../sdk-app/scripts/analyze-component-props.ts). The `EmployeeManagement` and `EmployeeOnboarding` namespaces — built from [`Employee/exports/employeeManagement.ts`](../../../src/components/Employee/exports/employeeManagement.ts) and [`Employee/exports/employeeOnboarding.ts`](../../../src/components/Employee/exports/employeeOnboarding.ts) — are already registered as their own sidebar categories. Anything new you add to those barrels needs the registry regenerated to show up.

### What to do per card migration

1. **Confirm the barrel is updated.** The card and the block both need to be named exports of [`Employee/exports/employeeManagement.ts`](../../../src/components/Employee/exports/employeeManagement.ts) (see the "Exports" section above). The dev app cannot surface a piece that isn't exported.
2. **Regenerate the registry data:**

   ```bash
   npx tsx sdk-app/scripts/analyze-component-props.ts
   ```

   This rewrites [`sdk-app/src/generated-registry-data.ts`](../../../sdk-app/src/generated-registry-data.ts) with new `EmployeeManagement.<Feature>` and `EmployeeManagement.<Feature>Card` entries, each mapped to the entity IDs (`employeeId`, `companyId`, …) the component declares as required props. The script also honors `export { Foo as Bar }` aliases, so the registry key matches the public name partners see.

3. **Commit the regenerated file** alongside the block's other changes. Reviewers expect the registry diff to match the new barrel exports — drift is a red flag.

4. **Spot-check in the dev app** (`npm run sdk-app`):
   - The new entries appear under the **Employee Management** sidebar section, grouped alphabetically — feature-prefixed naming (e.g. `Profile`, `ProfileCard`, `ProfileEditForm`) keeps the block and its pieces adjacent in the list. If you see an edit-form piece floating off under "E" (`EditProfile`, `EditHomeAddress`), the name is wrong — see "Naming conventions" above.
   - Clicking each piece resolves its entity IDs from the entity picker and renders against live demo data.
   - The events log shows the scoped `EMPLOYEE_<FEATURE>_MANAGEMENT_*` events when interacting with the card and the edit screen.

The deprecated unified `Employee.*` namespace was removed from the dev app's sidebar. Only `EmployeeManagement` and `EmployeeOnboarding` surface there now, so any new piece must be a named export of one of those barrels (typically [`employeeManagement.ts`](../../../src/components/Employee/exports/employeeManagement.ts) for management cards). The legacy `Employee/index.ts` barrel still exists for partner backward compatibility but no longer drives the dev app.

### When the dev app doesn't show your piece

- **The exported name isn't in `generated-registry-data.ts`.** Either the barrel wasn't updated or the script wasn't re-run. Re-run the script; if still missing, check that [`employeeManagement.ts`](../../../src/components/Employee/exports/employeeManagement.ts) actually re-exports the symbol.
- **The piece appears but renders an "unknown entity" warning.** The script defaulted the required entity to `['companyId']` because it couldn't detect the prop. Verify the card's props interface declares `employeeId: string` (no optional `?`, no union with `undefined`) — the analyzer keys off required-and-named-`*Id` props.
- **Clicking the entry crashes.** The dev app wraps every component in an error boundary that surfaces the message — typically a runtime auth or data issue, not a registry one. Check the events log and the network tab.

## Document the new block in `employee-management.md`

Every card migration adds an entry for its **block** (`EmployeeManagement.<Feature>`) to [`docs/workflows-overview/employee-management/employee-management.md`](../../../docs/workflows-overview/employee-management/employee-management.md). That file is the partner-facing umbrella doc for the namespace — same role [`employee-onboarding.md`](../../../docs/workflows-overview/employee-onboarding/employee-onboarding.md) plays for `EmployeeOnboarding.*`.

### What to document — the block first, the pieces nested under it

The doc convention mirrors `employee-onboarding.md`: each subcomponent entry documents **one drop-in component** — the orchestrated block — not the four-surface architecture underneath it. `Employee.Profile`, `Employee.Compensation`, `Employee.PaymentMethod` in the onboarding doc are the same kind of thing: a single component partners can drop in that handles the whole card-and-form experience for that feature. The block is the recommended consumption path and stays the **headline** entry for the feature — its own `###` section in the umbrella doc.

The standalone card and edit screen are also documented — they're real partner-consumable exports (see "Standalone composability per piece" above), and partners who want to render the card on a custom dashboard, swap the edit form into a modal, or otherwise own the orchestration need to know they exist and what they emit. They get a **`####` subsection nested inside the block's `###` section**, not a peer `###` section. Putting them at peer level in the TOC ("Profile, ProfileCard, ProfileEditForm") implies they're alternatives partners pick between; nesting them under Profile structurally matches the conceptual hierarchy ("here's the block, and here are the pieces it's built from") and keeps the top-level TOC scannable as more blocks land. The data hook stays out of `employee-management.md` — it's a power-user surface with its own audience (custom UI builders) and would bloat the umbrella doc.

For each card migration:

- **Required:** a `### EmployeeManagement.<Feature>` section documenting the block (description, JSX sample, `####` Props table, `####` Events table). This is the canonical partner-facing surface for the feature.
- **Required:** a `#### Composing from EmployeeManagement.<Feature>Card and EmployeeManagement.Edit<Feature> directly` subsection placed inside the block's section, after the block's Props and Events tables. One short composition example showing the swap pattern with local state, then **one `##### EmployeeManagement.<Feature>Card` sub-subsection and one `##### EmployeeManagement.Edit<Feature>` sub-subsection**, each containing its own Props and Events tables under bolded labels. Open the subsection by naming the block as the recommended default and the use cases that justify reaching for the pieces directly (modal/drawer edit surface, read-only card with no edit affordance, router-driven swap). Keep it minimal — the subsection exists to make the pieces discoverable and pin their event surface, not to enumerate every composition pattern. Do **not** collapse the per-piece tables into one combined table with an "Applies to" / "Emitted by" column — the card and the form are distinct components with asymmetric APIs (the edit form is typically a superset of the card's props, and each piece emits a disjoint set of events), and forcing them into one table makes a partner looking at just one piece mentally filter every row on every read. The combined-table-with-discriminator-column pattern used by `EmployeeOnboarding.FederalTaxes / EmployeeManagement.FederalTaxes` in [`employee-onboarding.md`](../../../docs/workflows-overview/employee-onboarding/employee-onboarding.md) works there because those two are functionally identical variants of the same form; the card and the form aren't variants, they're a card and a form.
- **Required:** update to the `EmployeeManagement.DashboardFlow` event table when the migration renames any events the dashboard forwards (e.g. swapping `EMPLOYEE_UPDATE` → `EMPLOYEE_PROFILE_MANAGEMENT_EDIT_REQUESTED` after the Profile extraction). The dashboard forwards the card's events to the partner, so the dashboard doc must reflect the post-migration event surface.
- **Optional:** a hook entry. The data hook (`use<Feature><Role>`) is a partner export but it has a different audience (partners building custom UI from scratch) and a different doc shape (`BaseHookReady` contract, not props/events). Default is to skip in `employee-management.md`; cover hooks in [`docs/hooks/hooks.md`](../../../docs/hooks/hooks.md) instead when they need a partner-facing entry.

### Mechanics

Match the shape of every other entry in `employee-management.md` (and of [`employee-onboarding.md`](../../../docs/workflows-overview/employee-onboarding/employee-onboarding.md)):

1. Add the block to the **Available Subcomponents** list at the top as a top-level item, then add the pieces subsection as an **indented sub-item** under it. The resulting TOC looks like:
   ```markdown
   - [EmployeeManagement.<Feature>](#employeemanagement<feature>)
     - [Composing from <Feature>Card and Edit<Feature> directly](#composing-from-employeemanagement<feature>card-and-employeemanagementedit<feature>-directly)
   ```
   This keeps the headline TOC entries one per block while still surfacing the pieces' anchor for partners scanning for finer-grained composition.
2. Add a `### EmployeeManagement.<Feature>` section with:
   - A 1–3 sentence description of what the block does end-to-end — read the card, click Edit, submit the form, return to the card with a success alert. Write it as one user-facing flow, not as a decomposition of pieces.
   - A short JSX implementation sample importing from `@gusto/embedded-react-sdk` (never `@/...` aliases — docs use only the published surface, per the `docs/` rule in [`CLAUDE.md`](../../../CLAUDE.md)).
   - A `#### Props` table — typically `employeeId`, `onEvent`, `dictionary`, `FallbackComponent`.
   - A `#### Events` table covering the full partner-visible event surface: the card's edit-requested event, the edit form's updated/cancel events, and any alert-dismissal event the block forwards (scoped per the rule above — e.g. `EMPLOYEE_PROFILE_MANAGEMENT_ALERT_DISMISSED`, not generic `EMPLOYEE_DISMISS`).
3. Inside the same `### EmployeeManagement.<Feature>` section, after the block's Events table, add a `#### Composing from EmployeeManagement.<Feature>Card and EmployeeManagement.Edit<Feature> directly` subsection with:
   - An opening paragraph naming the block as the recommended default and the use cases where reaching for the pieces is appropriate (modal/drawer edit surface, read-only card, router-driven swap). Don't speculate about the integrator's app — describe the SDK contract.
   - One short JSX composition sample showing the card-↔-form swap with local state. The example must show explicit event-type branching — see "Composition example shape" below for the required form and the failure mode to avoid.
   - A brief sentence above the example noting that each piece's `onEvent` receives `(eventType, data)` and pointing to the per-piece events tables below for what each emits.
   - A `##### EmployeeManagement.<Feature>Card` sub-subsection with bolded **Props** and **Events** labels and their tables. Card props are typically just `employeeId` + `onEvent`; card events are typically just the edit-requested event.
   - A `##### EmployeeManagement.Edit<Feature>` sub-subsection with bolded **Props** and **Events** labels and their tables. Edit-form props typically extend the card's with `className`, `dictionary`, and `FallbackComponent` from `CommonComponentInterface` + `BaseComponentInterface`; edit-form events are typically the updated event (with the updated entity as data) and the cancel event.
   - Do **not** collapse the two pieces into one combined table with an "Applies to" or "Emitted by" column. The card and the form are asymmetric — different prop shapes, disjoint event surfaces — and the combined-table pattern (which works for `EmployeeOnboarding.FederalTaxes / EmployeeManagement.FederalTaxes` in [`employee-onboarding.md`](../../../docs/workflows-overview/employee-onboarding/employee-onboarding.md)) is appropriate only for functionally identical variants of the same component, not for a card-and-form pair.
4. Source every event list from the **block's** state machine (`<feature>StateMachine.ts`) and the events its standalone pieces fire in source — `<Feature>Card.tsx`, `Edit<Feature>.tsx`, the block's `<Feature>Components.tsx` (for alert dismiss). Do not paste from the pre-refactor dashboard event names.
5. If the migration also touches [`employee-dashboard.md`](../../../docs/workflows-overview/employee-dashboard.md) (the deeper reference on dashboard internals), update it for consistency in the same PR.

### Composition example shape

The JSX composition example inside the pieces subsection must show **explicit event-type branching** using `componentEvents` imported from the published surface. Use this template, substituting the feature-specific event names:

```jsx
import { useState } from 'react'
import { componentEvents, EmployeeManagement } from '@gusto/embedded-react-sdk'

function MyPanel({ employeeId }) {
  const [isEditing, setIsEditing] = useState(false)

  if (isEditing) {
    return (
      <EmployeeManagement.Edit<Feature>
        employeeId={employeeId}
        onEvent={eventType => {
          if (
            eventType === componentEvents.EMPLOYEE_<FEATURE>_MANAGEMENT_UPDATED ||
            eventType === componentEvents.EMPLOYEE_<FEATURE>_MANAGEMENT_EDIT_CANCELLED
          ) {
            setIsEditing(false)
          }
        }}
      />
    )
  }

  return (
    <EmployeeManagement.<Feature>Card
      employeeId={employeeId}
      onEvent={eventType => {
        if (eventType === componentEvents.EMPLOYEE_<FEATURE>_MANAGEMENT_EDIT_REQUESTED) {
          setIsEditing(true)
        }
      }}
    />
  )
}
```

**The failure mode to avoid:** an engineer following this skill will write the minimal swap, notice that both edit-form events drive the same transition in the example (`setIsEditing(false)`), and collapse the handler to a no-arg form like `onEvent={() => setIsEditing(false)}`. That looks cleaner but is wrong for this section because:

- **Pieces examples ≠ block examples.** Block-level examples elsewhere in the umbrella doc use `onEvent={() => {}}` because there the partner is a passive observer of an internally-orchestrated component — they're shown the event surface in the events table and can branch in their own handler if they want, but the block itself drives behavior. Pieces examples are the opposite: the partner _is_ the orchestration, and the example is the canonical demonstration of how to do that orchestration. Skipping the branching hides the entire point of the section.
- **Forward incompatibility.** If the edit form grows a third event later (e.g. `EMPLOYEE_<FEATURE>_MANAGEMENT_SAVE_ERROR`), a no-arg handler silently routes it to the same transition as save/cancel. Explicit branching is robust to event-surface growth.
- **`componentEvents` is the partner-idiomatic identifier.** Don't paste raw string literals like `'employee/profile/management/updated'` either — they bypass the typed export, break on rename, and read as magic strings.

Also branch in the card's handler even though it currently emits a single event (as in the template above) — keeps the pattern consistent across both pieces, demonstrates the same shape the edit form uses, and stays forward-compatible if the card grows a second event later.

### Voice and content rules ([`CLAUDE.md`](../../../CLAUDE.md) `docs/` section)

- The reader **is** the partner. Don't refer to "partners" in third person; write neutrally or in second person.
- Don't speculate about the integrator's app or workflow ("captured on a previous step", "in your onboarding wizard"). Describe what the API does and how to use it.
- Code samples must compile against the published SDK surface only. No `@/` import aliases, no internal helpers.

### Why this matters

The dev app surfacing makes the pieces discoverable to internal developers. The doc entries make the block and its pieces discoverable to partners and pin their supported contracts: prop shape, event names, payload types. The block is the surface most partners will integrate, so it leads — but the standalone card and edit screen are part of the public surface the moment they're exported under `EmployeeManagement.*`, and an undocumented public export is effectively unusable. Documenting the pieces alongside the block (one combined subsection, block-first framing) keeps the headline focused on the recommended consumption path while pinning the lower-level contract for partners who need finer-grained composition.

## Reconciling parallel work on `main`

Dashboard work continues in parallel with this migration. When you rebase a card-extraction branch onto `main`, any visual or behavioral improvement that landed in the **old** card markup must be **ported into the new standalone card**, not just merged back into the dying view file. The dying view file is about to be deleted; improvements that only land there evaporate at the final-card PR.

### When you hit a conflict in `<TabView>.tsx` (e.g. `BasicDetailsView.tsx`)

1. **Resolve the conflict by taking your branch's side** — the inline card markup is gone in your version and replaced by `<FeatureCard employeeId={employeeId} onEvent={onEvent} />`. `main`'s edits inside that block are dead code from your branch's perspective.
2. **Inspect what `main` actually changed**, against the merge base, scoped to the file:
   ```bash
   git diff $(git merge-base HEAD origin/main)..origin/main -- src/components/Employee/Dashboard/<TabView>.tsx
   ```
3. **Port the substantive improvement into the new card's source** (`management/<Feature>Card/<Feature>Card.tsx`). Worked examples:
   - Switch from hand-rolled `<Flex>`/`<Text>` stacks to `Components.DescriptionList` with an `emptyPlaceholder` — port the items array + the `DescriptionList` render call into the card body, replacing the equivalent stack the card had.
   - A new field added to the row, a copy fix, a label tweak — apply it to the card.
4. **If the improvement relied on a key from `Employee.Dashboard`** (e.g. `listEmptyPlaceholder`), copy the key into the block's own `Employee.<Feature>.Management.json`. Blocks never read across namespaces. Re-run `npm run i18n:generate` so `i18next.d.ts` picks up the new key.
5. **Resolve `Dashboard.tsx` conflicts by combining both sides** — structural changes from `main` (e.g. a wrapping `<Flex gap={…}>`) and prop-shape changes from your branch (e.g. swapping `onEdit<X>` for `onEvent`) are usually orthogonal. Restore any incidentally-dropped attributes (`variant`, `weight`, `aria-*`).
6. **Re-run the card test and the dashboard test** — the card test pins the new render path; the dashboard test pins that the dashboard still composes correctly.

### When `main` has changes to a tab view your branch doesn't touch yet

These don't appear as conflicts during your rebase (only the touched card's view conflicts), but they're queued up for the next migration. Before opening the next card's extraction PR:

1. Run `git log --oneline $(git merge-base HEAD origin/main)..origin/main -- src/components/Employee/Dashboard/<NextTabView>.tsx` to list the improvements waiting.
2. Treat each commit as a port-forward target. When you write the new `<Feature>Card.tsx`, transcribe the **post-improvement** version of the markup, not whatever was in the view at the time you started.
3. The "Card component contract" and "Translations" rules apply: the card owns its own DescriptionList, its own translation keys, its own events. Don't reference `Employee.Dashboard` from inside the card just because the source view did.

### Why this matters

The migration is "Strangler Fig" by design (see "Hard rule: one card per PR"). The old view is alive only until the card replaces it. Any commit on `main` that improves the old view is an investment that needs to be re-routed to the surface that survives, otherwise the next card PR is silently a regression on the work that just landed. Treating rebase as a port-forward exercise — not just a conflict-resolution exercise — keeps every improvement intact through the migration.

## Testing

Each standalone piece gets a colocated test. The test layering matches the standalone-composability principle — every surface a partner can consume independently has its own pinning test. The block integration test then proves they compose correctly. [`Dashboard.test.tsx`](../../../src/components/Employee/Dashboard/Dashboard.test.tsx) stays in place as the cross-cutting regression net.

### Layer 1 — Hook test (`shared/use<Feature><Role>/use<Feature><Role>.test.tsx`)

Pins the `BaseHookReady` contract independently of any UI. Model on [`useEmployeeList.test.tsx`](../../../src/components/Employee/EmployeeList/shared/useEmployeeList.test.tsx) and [`usePaymentMethodList.test.tsx`](../../../src/components/Employee/PaymentMethod/shared/usePaymentMethodList.test.tsx).

- **Loading branch** — returns `{ isLoading: true, errorHandling }` while underlying queries are pending.
- **Ready branch** — returns the documented `BaseHookReady` shape with the right `data` / `status` / `actions` keys.
- **Each action** — invoking an action issues the expected `@gusto/embedded-api` mutation and resolves with the documented `HookSubmitResult` shape.
- **Error composition** — `errorHandling.errors` aggregates query + mutation errors via `composeErrorHandler`.

### Layer 2 — Card-in-isolation test (`management/<Feature>Card/<Feature>Card.test.tsx`)

Pins the standalone-card contract. The card is rendered directly (no block, no state machine) with `{ employeeId, onEvent: vi.fn() }`, MSW-mocked APIs, and asserted against the partner-visible surface.

- **Loading branch** — renders `<BaseLayout isLoading />` while the hook is loading; no card chrome visible.
- **Ready branch** — renders `Components.Box` + `Components.BoxHeader` + the section contents from the mocked data.
- **Empty branch** — renders `<EmptyData />` (or the section-specific empty state) when the hook returns ready-but-empty.
- **Event emission** — clicking each CTA calls the `onEvent` spy with the documented `componentEvent` name and payload shape. This is the test that proves a partner dropping just `<CompensationCard …/>` into their page gets the same event surface as the orchestrated block.
- **Controlled alert** — passing `successAlert="jobAdded"` renders the alert; clicking dismiss invokes `onDismissAlert`.

### Layer 3 — Block integration test (`management/<Feature>.test.tsx`)

Pins the card↔edit orchestration. Model on [`PaymentMethod.test.tsx`](../../../src/components/Employee/PaymentMethod/management/PaymentMethod.test.tsx).

- **Card→edit transition** — clicking the card's action button transitions to the edit state and renders the edit screen.
- **Edit→card on submit success** — submitting the edit screen returns to the card and renders the appropriate success alert.
- **Edit→card on cancel** — cancelling the edit screen returns to the card with no alert.
- **End-to-end scoped event coverage** — assert that each scoped `componentEvent` the block emits (card-edit-requested, edit-saved/cancelled, etc.) fires with the correct payload shape, including any events the edit screen emits. Pre-release we don't need to prove parity with the legacy dashboard names — those are gone — but the block's own scoped event surface needs pinning here.

Use `vi.fn<HttpResponseResolver>` per the conventions in [`AGENTS.md`](../../../AGENTS.md) when the assertion is on HTTP traffic specifically (verb/path/body/order).

### Layer 4 — Dashboard regression net (`Dashboard.test.tsx`)

Stays in place. The block migration must not delete coverage from this file mid-program — the dashboard is still composed and shipped, and these tests prove it stays correct as cards move out one by one.

What to keep:

- A smoke test per tab confirming the block renders inside the tab and forwards events upward.
- Cross-card integration tests if any exist (e.g. switching tabs preserves state).

What to delete (only after a card has been migrated):

- Detailed coverage of that card's internals — that coverage now lives in the card-in-isolation test and the block integration test.

## Cards in scope

Ten cards render across the four dashboard tabs. Each one becomes one card-as-block under an `Employee/<Domain>/` folder. Eight of them slot into an existing domain cleanly; the three with friction are called out below.

| #   | Tab           | Card surface label | Source tab view                                                                       | Target domain   | Target block path                                                                                  | Status                                                                                                                 |
| --- | ------------- | ------------------ | ------------------------------------------------------------------------------------- | --------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| 1   | Basic details | Basic details      | [`BasicDetailsView`](../../../src/components/Employee/Dashboard/BasicDetailsView.tsx) | `Profile`       | `Employee/Profile/management/`                                                                     | Edit screen exists ([`Profile.tsx`](../../../src/components/Employee/Profile/management/Profile.tsx)). Add `index.ts`. |
| 2   | Basic details | Home address       | [`BasicDetailsView`](../../../src/components/Employee/Dashboard/BasicDetailsView.tsx) | `HomeAddress`   | `Employee/HomeAddress/management/`                                                                 | Edit screen exists. Clean fit.                                                                                         |
| 3   | Basic details | Work address       | [`BasicDetailsView`](../../../src/components/Employee/Dashboard/BasicDetailsView.tsx) | `WorkAddress`   | `Employee/WorkAddress/management/`                                                                 | Edit screen exists. Clean fit.                                                                                         |
| 4   | Job and pay   | Compensation       | [`JobAndPayView`](../../../src/components/Employee/Dashboard/JobAndPayView.tsx)       | `Compensation`  | `Employee/Compensation/management/`                                                                | Three edit sub-flows already in `management/`. Most complex block.                                                     |
| 5   | Job and pay   | Payment            | [`JobAndPayView`](../../../src/components/Employee/Dashboard/JobAndPayView.tsx)       | `PaymentMethod` | [`Employee/PaymentMethod/management/`](../../../src/components/Employee/PaymentMethod/management/) | **Already done — canonical reference.** No migration needed; cite as the template.                                     |
| 6   | Job and pay   | Deductions         | [`JobAndPayView`](../../../src/components/Employee/Dashboard/JobAndPayView.tsx)       | `Deductions`    | `Employee/Deductions/management/`                                                                  | **Requires a precursor PR** — see "Friction points" below.                                                             |
| 7   | Job and pay   | Paystubs           | [`JobAndPayView`](../../../src/components/Employee/Dashboard/JobAndPayView.tsx)       | `Paystubs`      | `Employee/Paystubs/management/`                                                                    | **No domain folder yet** — created inside the Paystubs card's own migration PR. Card-only block (no edit transitions). |
| 8   | Taxes         | Federal taxes      | [`TaxesView`](../../../src/components/Employee/Dashboard/TaxesView.tsx)               | `FederalTaxes`  | `Employee/FederalTaxes/management/`                                                                | Edit screen exists. Clean fit.                                                                                         |
| 9   | Taxes         | State taxes        | [`TaxesView`](../../../src/components/Employee/Dashboard/TaxesView.tsx)               | `StateTaxes`    | `Employee/StateTaxes/management/`                                                                  | Edit screen exists. Clean fit.                                                                                         |
| 10  | Documents     | Documents / forms  | [`DocumentsView`](../../../src/components/Employee/Dashboard/DocumentsView.tsx)       | `Documents`     | `Employee/Documents/management/`                                                                   | [`DocumentManager`](../../../src/components/Employee/Documents/management/DocumentManager.tsx) exists. Clean fit.      |

### Component name follows the domain folder, not the dashboard's display copy

Card surface labels (the strings the user sees: "Basic details", "Payment", "Paystubs", etc.) live in i18n; the exported component name follows the domain folder. So the card for the Basic-details surface is `ProfileCard` (exported from `Employee/Profile/management/ProfileCard/`), even though it renders under the "Basic details" label. The i18n keys themselves **move** during migration from `Employee.Dashboard:*` into the block's dedicated namespace (`Employee.Profile.Management.json` for this case) — see "Translations" below. The display copy is preserved verbatim; only its namespace changes. Same principle applies to any future card whose surface label diverges from its domain.

### Friction points (three non-clean fits)

These don't change the architecture in the skill, but they affect what each PR contains.

1. **Paystubs creates its own domain folder.** The Paystubs card's migration PR is the one that introduces `src/components/Employee/Paystubs/` (with `management/` and `shared/` subfolders). No precursor PR required — folder creation is part of the migration. The data is currently bundled into [`useEmployeeCompensation`](../../../src/components/Employee/Dashboard/hooks/useEmployeeCompensation.tsx); the disentanglement table in "Data hooks" already covers splitting it out. The download mechanism is a side effect against `payrollsGetPayStub` on the Payroll API, not the Employee API — keep it inside the card.
2. **Deductions requires a precursor PR.** The `Deductions/` folder has no `management/` subdirectory; instead [`Deductions.tsx`](../../../src/components/Employee/Deductions/Deductions.tsx) at the root is already a full `BaseComponentInterface` flow with its own [`stateMachine.ts`](../../../src/components/Employee/Deductions/stateMachine.ts) and [`deductionsContextualComponents.tsx`](../../../src/components/Employee/Deductions/deductionsContextualComponents.tsx). That's a pre-existing flow this skill's architecture does not contemplate. Before the Deductions card migration, ship a precursor PR that relocates the existing top-level Deductions flow into `Deductions/management/` (or otherwise resolves it) so the card-as-block migration has a clean `management/` folder to land in. The precursor PR is bookkeeping only — no card decomposition, no event-surface changes. The Deductions card migration then follows the same pattern as every other card.
3. **Profile naming is fine — code name decouples from display copy** (see the rule above). No structural friction; just call it out in the Profile card's PR description so reviewers aren't surprised that `ProfileCard` is what shows up under the dashboard's "Basic details" header.

## Recommended migration order (one PR per arrow)

`Documents` → `Paystubs` → `Deductions precursor (resolve existing flow)` → `Deductions` → `Compensation` → `Profile` → `HomeAddress` → `WorkAddress` → `FederalTaxes` → `StateTaxes`.

Why this order:

- **Documents** is the simplest — no edit flow in the card sense, just a `viewForm` transition that renders the existing [`DocumentManager`](../../../src/components/Employee/Documents/management/DocumentManager.tsx). Good first migration to settle the patterns.
- **Paystubs** has no edit state at all (paystub download is a side effect from the card itself). Card-only block — proves the pattern degenerates cleanly. Creates its own `Employee/Paystubs/` folder in this PR.
- **Deductions precursor** is a non-card PR that lands the [`Deductions/management/`](../../../src/components/Employee/Deductions/) folder by relocating or otherwise resolving the existing top-level [`Deductions.tsx`](../../../src/components/Employee/Deductions/Deductions.tsx) flow. No event-surface changes, no dashboard touches. Sets up the next PR to follow the standard card-as-block path.
- **Deductions** card migration. Now follows the standard path — the `management/` folder exists, and the existing [`shared/`](../../../src/components/Employee/Deductions/shared/) (`useDeductionsList`, `useDeleteDeduction`, `DeleteDeductionDialog`, `DeductionsForm`) is largely wiring.
- **Compensation** is the most complex (pending-changes alerts, multi-job table, add-another-job footer, secondary-job delete confirmation, three edit sub-flows already in `management/`, and the largest scoped-event surface to design). Do it once the simpler ones have shaken out the patterns.
- **Profile / HomeAddress / WorkAddress** make up the Basic details tab and share the multi-section card pattern from [`BasicDetailsView`](../../../src/components/Employee/Dashboard/BasicDetailsView.tsx). Each is its own PR. Profile's PR adds the missing `index.ts` to `Profile/management/` and exports `ProfileCard` (see the naming rule above).
- **FederalTaxes / StateTaxes** wrap up the Taxes tab. State taxes is fiddlier because of the dynamic per-state questions; do federal first.

`PaymentMethod` is already a block — cite it as the reference on every PR, no work needed.

Each arrow is independently shippable. The dashboard works at every boundary.

## Migration checklist (per card)

- [ ] This PR migrates exactly one card. No bundled migrations.
- [ ] Read the canonical template ([`PaymentMethod/management/`](../../../src/components/Employee/PaymentMethod/management/)) and the OnboardingFlow precedent before writing code.
- [ ] If the card's edit screen has not been hook-migrated yet, do that first via [`migrate-sdk-component-to-hooks`](../migrate-sdk-component-to-hooks/SKILL.md) — separate PR.
- [ ] Dedicated `EMPLOYEE_<FEATURE>_MANAGEMENT_*` event constants added to [`src/shared/constants.ts`](../../../src/shared/constants.ts). The block, card, edit screen, and state machine fire only these scoped events — no reuse of onboarding or sibling-block events.
- [ ] `dashboardStateMachine.ts` transitions and `DashboardComponents.tsx` contextual adapters for this card retargeted to the scoped event names; the card's inline markup in its tab view replaced with `<FeatureCard employeeId={…} onEvent={onEvent} />`. `Dashboard.tsx` no longer holds the card's `handle<X>` callbacks. Pre-release: `DashboardFlow.tsx` itself stays untouched — no compatibility shim layer (see "No compatibility shim during pre-release").
- [ ] SDK dev app updated: `npx tsx sdk-app/scripts/analyze-component-props.ts` re-run so the regenerated [`sdk-app/src/generated-registry-data.ts`](../../../sdk-app/src/generated-registry-data.ts) gains `EmployeeManagement.<Feature>` + `EmployeeManagement.<Feature>Card` (and any other newly-exported pieces) with the correct entity-id requirements. Verified locally that the new entries appear under the "Employee Management" sidebar section and render against demo data.
- [ ] [`docs/workflows-overview/employee-management/employee-management.md`](../../../docs/workflows-overview/employee-management/employee-management.md) updated with a `### EmployeeManagement.<Feature>` section for the new **block** — description, JSX sample, `#### Props` table, and `#### Events` table covering the full partner-visible event surface (edit-requested, updated, cancel, dismiss — all scoped per the rule above). If any of the card's events renamed, the `EmployeeManagement.DashboardFlow` event table in the same file reflects the post-refactor surface. [`employee-dashboard.md`](../../../docs/workflows-overview/employee-dashboard.md) updated for consistency where it touches the same card.
- [ ] Same block section also contains a `#### Composing from EmployeeManagement.<Feature>Card and EmployeeManagement.Edit<Feature> directly` subsection (placed inside the block's `###`, after its Events table) with the opening framing (block recommended, pieces for advanced composition), one short JSX swap-with-local-state sample, then a `##### EmployeeManagement.<Feature>Card` sub-subsection and a `##### EmployeeManagement.Edit<Feature>` sub-subsection, each with their own bolded **Props** and **Events** labels and tables. **Per-piece, not combined** — the card and the form are asymmetric components, not variants of the same thing. Subcomponent anchor list at the top of the doc lists the block as a top-level item with the pieces subsection as an indented sub-item under it. See "Document the new block in employee-management.md" for the full spec.
- [ ] The composition example inside that subsection shows **explicit event-type branching** on both pieces' `onEvent` handlers, comparing `eventType` against `componentEvents.EMPLOYEE_<FEATURE>_MANAGEMENT_*` imported from `@gusto/embedded-react-sdk`. **Not** a no-arg handler like `onEvent={() => setIsEditing(false)}` — even when both edit-form events happen to drive the same transition in the minimal example. See "Composition example shape" for the required template and the reasoning.
- [ ] Per-card data hook landed at `Employee/<Feature>/shared/use<Feature><Role>/` in its own subfolder (`use<Feature><Role>.tsx` + `use<Feature><Role>.test.tsx` + `index.ts`). The feature's `shared/index.ts` barrel re-exports through that folder. Hook returns the `HookLoadingResult | BaseHookReady<…>` discriminated union, uses `composeErrorHandler` + `useBaseSubmit`, and matches the shape of [`usePaymentMethodList`](../../../src/components/Employee/PaymentMethod/shared/usePaymentMethodList.ts) / [`useEmployeeList`](../../../src/components/Employee/EmployeeList/shared/useEmployeeList.tsx). Renamed to drop the `Employee` prefix per the data-hooks table. If the source hook bundled multiple cards, the split happens here. If `Dashboard/hooks/index.ts` is now empty, delete `Dashboard/hooks/`.
- [ ] Hook test inside the subfolder covers loading branch, ready branch (`BaseHookReady` shape), each action's mutation + `HookSubmitResult`, and `composeErrorHandler` aggregation. Model on [`useEmployeeList.test.tsx`](../../../src/components/Employee/EmployeeList/shared/useEmployeeList.test.tsx).
- [ ] Create `Employee/<Feature>/management/` with the block orchestrator and internal helpers flat (`<Feature>.tsx`, `<Feature>.test.tsx`, `<Feature>Components.tsx`, `<feature>StateMachine.ts`, `index.ts`) plus the standalone card in its own subfolder (`<Feature>Card/<Feature>Card.tsx` + `<Feature>Card/<Feature>Card.test.tsx` + `<Feature>Card/index.ts`). Subfolder names match the public name exactly (no `Card/Card.tsx`).
- [ ] State machine uses `card` as the initial state name (not `index`) and the `returnToCard` / `returnToCardWithAlert` reducer pattern.
- [ ] Dedicated translations file at `src/i18n/en/Employee.<Feature>.Management.json` (and locale equivalents). The block, card, edit screen, and hook all call `useI18n('Employee.<Feature>.Management')` — no reads from `Employee.Dashboard`. Strings that previously lived under `Employee.Dashboard:<feature>.*` (including the card's success-alert labels) moved into this file; the dashboard-side keys are deleted, not aliased. Partner override supported via `useComponentDictionary('Employee.<Feature>.Management', dictionary)`. Run `npm run i18n:generate` after the file change.
- [ ] `<Feature>Card.tsx` is **self-fetching and standalone**: required props are `{ employeeId, onEvent }`, it calls `use<Feature><Role>` internally, branches on `isLoading`, wraps in `<BaseLayout>`, and fires `componentEvents` directly via `onEvent`. The only optional props are `successAlert` + `onDismissAlert` for the orchestrated block to drive the alert. No state-machine import, no `useFlow`.
- [ ] Success alert state moved into `<Feature>ContextInterface`, surfaced to the card through the `successAlert` / `onDismissAlert` controlled props, dismissed via `componentEvents.EMPLOYEE_DISMISS` in `CardContextual`.
- [ ] `Employee/<Feature>/management/index.ts` exports the block, the card, and any partner-facing edit screens as sibling named exports; `Employee/<Feature>/shared/index.ts` exports the hook + its types. No `Block.Card = …` dot-notation.
- [ ] [`Employee/exports/employeeManagement.ts`](../../../src/components/Employee/exports/employeeManagement.ts) points at the new block. If a naming conflict required renaming the existing edit screen, the rename + re-export happens in this same PR.
- [ ] **Only** this card's transitions/contextual adapter/prop are touched in `dashboardStateMachine.ts` / `DashboardComponents.tsx` / the relevant tab view. Other cards untouched.
- [ ] Card-in-isolation test (`<Feature>Card/<Feature>Card.test.tsx`) renders the card directly with `{ employeeId, onEvent: vi.fn() }`, MSW-mocks the data hook's queries, and asserts loading/ready/empty branches plus that each CTA fires the correct scoped `componentEvent` with the correct payload.
- [ ] Block integration test (`<Feature>.test.tsx`) covers card→edit transition, edit→card on save (with success alert), edit→card on cancel, and that the block's scoped events fire with the right payload shape.
- [ ] `Dashboard.test.tsx` updated: tab-level smoke tests retained; card-internal coverage moved out (it now lives in the card-in-isolation test); any assertions on the card's legacy un-scoped events retargeted to the new scoped event names. All existing dashboard tests still pass.
- [ ] `npm run test -- --run` passes locally.
- [ ] `npm run lint:check` passes.
- [ ] PR description lists the scoped events the block emits, with payload shapes.

If you're on the _last_ card, the same PR can delete `Employee/Dashboard/hooks/` once empty and tidy whichever per-card view files have collapsed to flex-column wrappers. `dashboardStateMachine.ts`, `DashboardComponents.tsx`, and `DashboardFlow.tsx` stay — the dashboard still routes between card and edit surfaces. Otherwise, leave the dashboard infrastructure in place.
