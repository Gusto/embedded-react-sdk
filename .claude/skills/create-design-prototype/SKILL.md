---
name: create-design-prototype
description: Scaffold a new design prototype in sdk-app's design mode. Use whenever the user says "create a new design", "scaffold a prototype", "add a design", "start a new design prototype", "I want to mock up X", "let's start a new flow for Y", or similar — even when they don't name the directory or domain. The skill infers domain, name, AND UI intent from the prompt, then generates a real starting-point UI (a presentation component + container + mocked states) wired to the right entity hooks. The designer iterates on the result conversationally.
---

# Create design prototype

Scaffold a new entry under [sdk-app/src/design/prototypes/](sdk-app/src/design/prototypes/). Each prototype has two surfaces that share the same presentation component:

- **Prototype** — container fetches live data from `@gusto/embedded-api-v-2025-11-15` and renders it through the presentation component
- **Component states** — `states.tsx` provides mocked fixtures in the same shape and renders them through the same presentation component, with multiple variations (populated, empty, mixed, etc.) viewable in [ComponentStatesPage.tsx](sdk-app/src/design/prototypes/ComponentStatesPage.tsx)

The skill produces a **real starting UI** — a table, detail view, form, etc. — not a generic placeholder. The designer iterates on it by prompting further.

## Conversation flow

### 1. Infer everything you can from the prompt

Before asking anything, extract:

- **Domain** — Companies / Contractors / Employees / Payroll (see [registry.ts](sdk-app/src/design/registry.ts))
- **Name** — the design's display name
- **Intent verb** — what the designer wants the UI to do: _manage, list, browse, review, audit, add, configure_

Examples:

| Prompt                                               | Domain      | Name                         | Intent             |
| ---------------------------------------------------- | ----------- | ---------------------------- | ------------------ |
| "Create a design for managing employee compensation" | Employees   | Manage Employee Compensation | manage             |
| "List all payrolls"                                  | Payroll     | Payroll List                 | list               |
| "I want to review contractor payments"               | Contractors | Contractor Payments Review   | review             |
| "Add a company onboarding flow"                      | Companies   | Company Onboarding           | add                |
| "Create a new design"                                | —           | —                            | — (ask everything) |

When unambiguous, **skip questions and confirm in one line**: "Scaffolding `<Display Name>` as a <UI pattern> under <Domain>. Writing now." Then proceed. The user can interrupt.

Only ask follow-ups for genuinely missing or ambiguous pieces, and only the missing piece.

### 2. Map intent → UI pattern + SDK primitive

Pick the UI pattern that best fits the intent. **Every pattern uses an SDK primitive from [src/components/Common/](src/components/Common/) — never raw HTML.** Read the reference before writing so the scaffold follows actual conventions, not assumptions.

| Intent verbs                 | UI pattern                                                                          | SDK primitive                                                                            | Reference to read                                                                                                                                                                      |
| ---------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| manage, edit, configure      | **Table** with per-row "Edit" via `itemMenu`                                        | `DataView` + `useDataView` from `@/components/Common`                                    | [src/components/Contractor/ContractorList/index.tsx](src/components/Contractor/ContractorList/index.tsx) — canonical DataView usage with columns, itemMenu (HamburgerMenu), emptyState |
| list, browse, view all       | **Sortable table**, no per-row actions                                              | `DataView` + `useDataView`                                                               | Same as above (omit `itemMenu`)                                                                                                                                                        |
| review, show, see, audit     | **Detail view** — heading + key-value sections, plus chronological list if temporal | `Components.Heading` / `Components.Text` / `Components.Box` from `useComponentContext()` | [employee-management/CompensationHistory/](sdk-app/src/design/prototypes/employee-management/CompensationHistory/)                                                                     |
| history, timeline            | **Chronological list** with dates and effective ranges                              | `DataView` (sorted) or list of `Components.Box`                                          | [employee-management/CompensationHistory/](sdk-app/src/design/prototypes/employee-management/CompensationHistory/)                                                                     |
| add, create, set up, onboard | **Form** with key fields, submit/cancel                                             | Field components from `@/components/Common/Fields/` inside `FormProvider`                | [contractor-management/AddContractor/](sdk-app/src/design/prototypes/contractor-management/AddContractor/)                                                                             |

If the intent is ambiguous between two patterns (e.g. "manage X" could be a table or a form), prefer the table — it's a better starting point for iteration.

### 2a. Hard rule: no raw HTML in scaffolded views

The scaffold is SDK code. **Never emit raw `<table>`, `<button>`, `<input>`, `<ul>`, `<form>`, `<div>` for layout, `<h1>`–`<h6>`, or `<a>`.** Use:

- Tables → `DataView` + `useDataView`
- Buttons → `Components.Button` (from `useComponentContext()`)
- Headings → `Components.Heading`
- Text / labels → `Components.Text`
- Alerts → `Components.Alert`
- Cards / containers → `Components.Box`
- Layout → `Flex` from `@/components/Common`
- Empty state → `EmptyData` from `@/components/Common`
- Per-row menus → `HamburgerMenu` from `@/components/Common/HamburgerMenu/HamburgerMenu`
- Form inputs → `TextInputField`, `SelectField`, etc. from `@/components/Common/Fields/` (require `FormProvider`)

Form inputs outside react-hook-form use `Components.TextInput`, `Components.Select`, etc. from the context. See [CLAUDE.md](CLAUDE.md) "ComponentsContext Pattern" and "Field Components for react-hook-form".

**Canonical DataView pattern** (read [src/components/Contractor/ContractorList/index.tsx](src/components/Contractor/ContractorList/index.tsx) for the full version):

```tsx
import { DataView, EmptyData, Flex, useDataView } from '@/components/Common'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu/HamburgerMenu'

const dataViewProps = useDataView<Row>({
  data: rows,
  columns: [
    { title: 'Name', key: 'name' },
    { title: 'Rate', render: row => `$${row.rate} / ${row.unit}` },
  ],
  itemMenu: onEdit
    ? row => (
        <HamburgerMenu
          items={[{ label: 'Edit', onClick: () => onEdit(row) }]}
          triggerLabel="Edit"
        />
      )
    : undefined,
  emptyState: () => <EmptyData title="No rows yet" description="…" />,
})

return <DataView label="Accessible label" {...dataViewProps} />
```

If you find yourself reaching for raw HTML, stop and look for the SDK primitive. The library is large — search `src/components/Common/` and `src/components/Common/index.ts` for what's exported. If a primitive genuinely doesn't exist for what you need, fall back to `Flex` for layout and `useComponentContext()` for atomic UI, and leave a TODO.

### 3. Identify the data sources

The starting UI needs **all the entities the designer is going to want to see**, not just the primary one. Read the prompt and ask "what's actually on this screen?"

Starting points by domain:

| Domain      | Primary entity | Likely related entities                          |
| ----------- | -------------- | ------------------------------------------------ |
| Companies   | `Company`      | `Industry`, `BankAccount`, `Location`            |
| Contractors | `Contractor`   | `ContractorPayment`, `ContractorPaymentGroup`    |
| Employees   | `Employee`     | `Compensation`, `Job`, `EmployeeBankAccount`     |
| Payroll     | `Payroll`      | `PayrollEmployeeCompensation`, off-cycle reasons |

For "manage employee compensation", the design needs Employee **plus** their current Compensation and Job — not just Employee. The skill should:

1. Look in `node_modules/@gusto/embedded-api-v-2025-11-15/src/models/components/` for the relevant model files and confirm field names exist (e.g. `firstName`, `rate`, `paymentUnit`).
2. Look in `node_modules/@gusto/embedded-api-v-2025-11-15/src/react-query/` for available Suspense hooks.
3. Look in `src/components/<Domain>/` for an existing SDK component that already does something similar — its data flow is the best reference for what hooks to combine.

If multiple hooks are needed (e.g. employees + per-employee compensation), prefer a **single combined hook** if one exists. If not, fall back to fetching just the primary entity and use **derived/mocked secondary fields** in the row shape, with a TODO comment explaining how to wire the secondary fetch later. **Don't generate N+1 hooks per row** — it's a bad pattern for the designer to copy.

### 4. Pick the right category (if applicable), then derive directories

**Companies, Contractors, and Employees** organize their designs by category — what _kind_ of UI it is. **Payroll** (and any future domain that doesn't subdivide) does not.

Category options (for company/contractor/employee):

| Category          | When to use                                                                  | Example existing folders                                                                                                 |
| ----------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `management`      | Admin-facing — list, edit, manage entities                                   | `contractor-management/`, `employee-management/`, `components/contractor/management/`, `components/employee/management/` |
| `onboarding`      | Admin onboarding the entity (e.g. admin adds a contractor)                   | `contractor-management/AddContractor/` lives here in spirit; not yet a separate dir                                      |
| `self-onboarding` | The entity onboards themselves (contractor receives invite, signs documents) | `contractor-self-onboarding/`, `components/contractor/self-onboarding/`                                                  |
| `shared`          | Components reused across multiple categories within a domain                 | `components/contractor/shared/`                                                                                          |

Infer the category from the intent: manage/list/review/audit/edit → **management**. Onboard/sign-up/invite/welcome → **onboarding** or **self-onboarding** (use **self-onboarding** when the entity is the user; **onboarding** when an admin is doing it).

Then derive paths based on whether the domain uses categories:

**With category (company/contractor/employee):**

- Prototype folder: `sdk-app/src/design/prototypes/<entity>-<category>/<PascalDesign>/`
  e.g. `prototypes/employee-management/ManageCompensation/`
- Presentation folder: `sdk-app/src/design/components/<entity>/<category>/<PascalComponent>/`
  e.g. `components/employee/management/EmployeeCompensationList/`

**Without category (payroll, and any future single-bucket domain):**

- Prototype folder: `sdk-app/src/design/prototypes/<kebab-design>/`
  e.g. `prototypes/payroll-list/`
- Presentation folder: `sdk-app/src/design/components/<entity>/<PascalComponent>/`
  e.g. `components/payroll/PayrollList/`

In both cases:

- **URL slug:** reads naturally (e.g. `/design/manage-employee-compensation`, `/design/payroll-list`)
- `<entity>` is the lowercased singular of the domain — `contractor`, `employee`, `company`, `payroll`
- `<PascalDesign>` is a short PascalCase name for the design — drop the entity prefix when it's already implied by the folder (e.g. `ManageCompensation` inside `employee-management/`, not `ManageEmployeeCompensation`). For uncategorized domains, the prototype dir name and design name typically match (e.g. `PayrollList` inside `payroll-list/`).
- `<PascalComponent>` is the presentation component's name. Read sibling components in the same folder to match style — sometimes the entity is part of the name (`EmployeeCompensationList`, `ContractorList`), sometimes not (`CompensationHistory`, `AddressForm`).

### 5. Confirm in one line, then write

State the inferred plan in one sentence — "Scaffolding `<Display Name>` as a table under Employees (management). Prototype → `prototypes/employee-management/ManageCompensation/`, presentation → `components/employee/management/EmployeeCompensationList/`. Writing now." — and proceed. Don't list files.

### 6. Generate the scaffold

Create **four files** following the proven employee-management pattern (see [employee-management/CompensationHistory/](sdk-app/src/design/prototypes/employee-management/CompensationHistory/)):

In `sdk-app/src/design/prototypes/<entity>-<category>/<PascalDesign>/`:

- `index.tsx` — exports `<PascalDesign>Prototype` (handles entity-ID check from outlet context, renders the container) and `<PascalDesign>States` (wraps `<ComponentStatesPage>`).
- `<PascalDesign>.tsx` — **container**. Calls the Suspense hook(s), adapts API data to the presentation component's prop shape via `toRows` (imported from `./states`), renders the presentation component wrapped in `<BaseComponent>` + `<Suspense>`.
- `states.tsx` — exports `toRows(entities) → rows[]` (shared adapter, used by both surfaces), mock fixtures (typically row-shaped for readability — no need to construct full nested entity trees), and `components: PrototypeComponent[]` with multiple meaningful configurations.

In `sdk-app/src/design/components/<entity>/<category>/<PascalComponent>/`:

- `<PascalComponent>.tsx` — **presentation**. Pure UI using SDK primitives (`DataView`, `Components.*`, `Flex`, `EmptyData`, `HamburgerMenu` for per-row actions). Takes a shaped prop (typically `rows: <ComponentName>Row[]` for tables — define and export the row type from this file). No hooks, no fetching.

Plus edits to:

- `sdk-app/src/design/registry.ts` — append the new design under the chosen domain.
- `sdk-app/src/main.tsx` — add the import (using the new path) and route block.

See the **Template scaffolds** section below for the shape of each file.

### 7. Tell the user what to do next

> Done. `<Display Name>` is scaffolded under `<Domain>`.
>
> **Next steps:**
>
> 1. Run `npm run sdk-app` and visit http://localhost:5200/design.
> 2. Click the card. The Prototype loads live data; Component states shows the same view with mocked variations.
> 3. Iterate by prompting — e.g. "add a filter for hourly vs salary", "make the rows expandable", "add a search input".

## Template scaffolds

Substitute throughout:

- `<entity>` — lowercased singular domain: `contractor`, `employee`, `company`, `payroll`
- `<category>` — `management`, `onboarding`, `self-onboarding`, or `shared` (omit for uncategorized domains)
- `<PascalDesign>` — prototype folder name (entity prefix dropped when category implies it; e.g. `ManageCompensation` inside `employee-management/`)
- `<PascalComponent>` — presentation component name (e.g. `EmployeeCompensationList`)
- `<kebab-route>` — URL slug for the design (e.g. `manage-employee-compensation`)
- `<Display Name>` — registry/UI label (e.g. `Manage Employee Compensation`)
- `<Domain>` — registry bucket: `Contractors`, `Employees`, `Companies`, or `Payroll`
- `<prototype-dir>` — full prototype directory under `prototypes/`: `<entity>-<category>/<PascalDesign>` for categorized domains, or `<kebab-route>` for uncategorized
- `<presentation-dir>` — full presentation directory under `components/`: `<entity>/<category>/<PascalComponent>` for categorized, `<entity>/<PascalComponent>` for uncategorized

For "Manage Employee Compensation" (Employees, management) those become: `employee`, `management`, `ManageCompensation`, `EmployeeCompensationList`, `manage-employee-compensation`, `Manage Employee Compensation`, `Employees`, `employee-management/ManageCompensation`, `employee/management/EmployeeCompensationList`.

The templates below show the **table pattern** (most common for `manage`/`list` intents) for a **categorized** domain. For uncategorized domains (payroll), drop the `<category>` segment from the import paths. For other UI patterns (detail, form, timeline), keep the same four-file split but shape the presentation component to fit — read the reference linked in step 2 first.

### 1. Presentation — `components/<presentation-dir>/<PascalComponent>.tsx`

```tsx
import { DataView, EmptyData, Flex, useDataView } from '@/components/Common'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu/HamburgerMenu'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export interface <PascalComponent>Row {
  id: string
  // ... fields the design needs, e.g.:
  // name: string
  // rate: string
  // paymentUnit: string
  // effectiveDate: string
}

interface <PascalComponent>Props {
  rows: <PascalComponent>Row[]
  onEdit?: (row: <PascalComponent>Row) => void
}

function EmptyState() {
  return (
    <EmptyData
      title="No data yet"
      description="Set the relevant entity IDs in Settings (top right) to load real data, or add fixtures in states.tsx."
    />
  )
}

export function <PascalComponent>({ rows, onEdit }: <PascalComponent>Props) {
  const Components = useComponentContext()

  const dataViewProps = useDataView<<PascalComponent>Row>({
    data: rows,
    columns: [
      // Replace with the real columns for this design.
      { title: 'ID', key: 'id' },
    ],
    itemMenu: onEdit
      ? row => (
          <HamburgerMenu
            items={[{ label: 'Edit', onClick: () => onEdit(row) }]}
            triggerLabel="Edit"
          />
        )
      : undefined,
    emptyState: () => <EmptyState />,
  })

  return (
    <Flex flexDirection="column" gap={16} alignItems="stretch">
      <Components.Heading as="h2"><Display Name></Components.Heading>
      <DataView label="<Display Name>" {...dataViewProps} />
    </Flex>
  )
}
```

Fill the `<PascalComponent>Row` shape and columns with the actual fields the design needs. Use the `render` form of a column when the cell needs computation. The presentation is the file the designer iterates on most — keep it readable. **No hooks, no fetching, no API entity types here** — keep it dependency-free.

### 2. Container — `prototypes/<prototype-dir>/<PascalDesign>.tsx`

```tsx
import { Suspense } from 'react'
import { /* useXListSuspense */ } from '@gusto/embedded-api-v-2025-11-15/react-query/<hook-file>'
import { toRows } from './states'
import { <PascalComponent> } from '../../../components/<presentation-dir>/<PascalComponent>'
import { BaseComponent } from '@/components/Base'
import { Flex } from '@/components/Common'

export interface <PascalDesign>Props {
  companyId: string
}

function Root({ companyId }: <PascalDesign>Props) {
  // const { data } = useXListSuspense({ companyId /* or companyUuid */ })
  // const rows = toRows(data.<key> ?? [])
  const rows: ReturnType<typeof toRows> = []
  return <<PascalComponent> rows={rows} onEdit={row => console.log('edit', row)} />
}

export function <PascalDesign>(props: <PascalDesign>Props) {
  return (
    <BaseComponent onEvent={() => {}}>
      <Flex flexDirection="column" gap={32} alignItems="stretch">
        <Suspense fallback={<div>Loading...</div>}>
          <Root {...props} />
        </Suspense>
      </Flex>
    </BaseComponent>
  )
}
```

Wire the actual hook (filled in from research in step 3). If the design needs multiple hooks, call them in `Root` and combine inside `toRows`. If a real combined hook doesn't exist and you'd need N+1 fetching, **stop and use just the primary entity** — leave a TODO comment with the secondary fetch sketch but don't generate per-row hook calls.

**Import-path depth cheat sheet** (count `..` from the container file):

| Categorized example                                                                                       | Uncategorized example                                            |
| --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `prototypes/employee-management/ManageCompensation/ManageCompensation.tsx`                                | `prototypes/payroll-list/PayrollList.tsx`                        |
| Presentation: `../../../components/employee/management/EmployeeCompensationList/EmployeeCompensationList` | Presentation: `../../components/payroll/PayrollList/PayrollList` |

Uncategorized designs are one directory level shallower — drop a `..` from each presentation/util import.

### 3. Entrypoint — `prototypes/<prototype-dir>/index.tsx`

```tsx
import { useOutletContext } from 'react-router-dom'
import type { EntityIds } from '../../../../useEntities'
import { ComponentStatesPage } from '../../ComponentStatesPage'
import { <PascalDesign> } from './<PascalDesign>'
import { components } from './states'
import { Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

const BASE_PATH = '/design/<kebab-route>'

export function <PascalDesign>Prototype() {
  const { entities } = useOutletContext<{ entities: EntityIds }>()
  const Components = useComponentContext()

  if (!entities.companyId) {
    return (
      <Flex flexDirection="column" gap={16} alignItems="stretch">
        <Components.Heading as="h2"><Display Name></Components.Heading>
        <Components.Alert label="Missing company ID" status="warning">
          Set a company ID in Settings (top right) to load real data.
        </Components.Alert>
      </Flex>
    )
  }

  return <<PascalDesign> companyId={entities.companyId} />
}

export function <PascalDesign>States() {
  return <ComponentStatesPage basePath={`${BASE_PATH}/component-states`} components={components} />
}
```

The entrypoint handles entity-ID guards (`companyId`, `employeeId`, `contractorId`, etc.) and delegates to the container. If the design needs a different entity guard, adjust accordingly — see [employee-management/CompensationHistory/index.tsx](sdk-app/src/design/prototypes/employee-management/CompensationHistory/index.tsx) for an `employeeId` example.

For **uncategorized** designs, the depth changes:

| Categorized                                          | Uncategorized                                     |
| ---------------------------------------------------- | ------------------------------------------------- |
| `useEntities`: `'../../../../useEntities'`           | `useEntities`: `'../../../useEntities'`           |
| `ComponentStatesPage`: `'../../ComponentStatesPage'` | `ComponentStatesPage`: `'../ComponentStatesPage'` |

### 4. States — `prototypes/<prototype-dir>/states.tsx`

```tsx
import type { /* Entity */ } from '@gusto/embedded-api-v-2025-11-15/models/components/<entity-file>'
import type { PrototypeComponent } from '../../prototypeTypes'
import {
  <PascalComponent>,
  type <PascalComponent>Row,
} from '../../../components/<presentation-dir>/<PascalComponent>'

// Adapter: shapes API data → row shape. Used by the container. Keep it dumb — pure data
// transformation, no hooks.
export function toRows(entities: /* Entity */[]): <PascalComponent>Row[] {
  return entities.map(e => ({
    id: /* e.uuid ?? '' */ '',
    // ... fill in the row fields from entity fields
  }))
}

// Mock fixtures, row-shaped directly. Build full nested entity trees only if absolutely needed.
function buildRow(overrides: Partial<<PascalComponent>Row>): <PascalComponent>Row {
  return {
    id: 'row-default',
    // ... default values for each row field
    ...overrides,
  }
}

const populated: <PascalComponent>Row[] = [
  buildRow({ id: 'r-1' /* , ... */ }),
  buildRow({ id: 'r-2' /* , ... */ }),
  buildRow({ id: 'r-3' /* , ... */ }),
]

export const components: PrototypeComponent[] = [
  {
    slug: 'list',
    name: '<Display Name>',
    description: 'Variations of the <PascalComponent> the prototype renders.',
    configurations: [
      {
        slug: 'populated',
        name: 'Populated',
        description: 'A handful of mocked rows in the typical case.',
        render: () => <<PascalComponent> rows={populated} onEdit={() => {}} />,
      },
      {
        slug: 'empty',
        name: 'Empty',
        description: 'The list with no rows — empty state.',
        render: () => <<PascalComponent> rows={[]} onEdit={() => {}} />,
      },
      // Add more configurations that matter to this design, e.g.:
      // - 'mixed-types' (some hourly, some salary)
      // - 'single-row'
      // - 'long-content' (very long names, missing optional fields)
      // - 'read-only' (omit onEdit)
    ],
  },
]
```

**Add configurations that matter to the design.** A "manage compensation" table benefits from a "mixed hourly+salary" configuration; a "payroll list" benefits from "mix of statuses". Think about which states the designer will want to see while iterating.

For uncategorized designs, the depth changes: `PrototypeComponent` is at `'../prototypeTypes'` (one up, not two), and the presentation is at `'../../components/<entity>/<PascalComponent>/<PascalComponent>'`.

### Registry entry

Append to the chosen domain's array in [registry.ts](sdk-app/src/design/registry.ts):

```ts
{
  name: '<Display Name>',
  path: '/design/<kebab-route>',
  description: 'TODO: describe what this prototype demonstrates.',
  children: [
    {
      name: 'Prototype',
      path: '/design/<kebab-route>',
      description: 'Live prototype against the real API.',
    },
    {
      name: 'Component states',
      path: '/design/<kebab-route>/component-states',
      description: 'Browse individual components and configurations with mock data.',
    },
  ],
},
```

### main.tsx import + route

Import near the other prototype imports (around lines 16–24):

```ts
import {
  <PascalDesign>Prototype,
  <PascalDesign>States,
} from './design/prototypes/<prototype-dir>'
```

Route block inside the `design` route's `children` array, after the last sibling design route:

```tsx
{
  path: '<kebab-route>',
  children: [
    { index: true, element: <<PascalDesign>Prototype /> },
    {
      path: 'component-states',
      children: [
        { index: true, element: <<PascalDesign>States /> },
        { path: ':componentSlug/:configSlug', element: <<PascalDesign>States /> },
      ],
    },
  ],
},
```

## Why these choices

- **No shared placeholder component.** A generic preview taught the designer nothing about the real design. Generating a domain-specific starting UI gives them something concrete to iterate on instead of something generic to delete.
- **Read the reference before writing.** The intent → UI pattern table names specific files for a reason — copying conventions from a real example is more reliable than reasoning from scratch, especially for table markup, error/empty states, and the BaseComponent wrapper.
- **`toRows` lives in `states.tsx`.** Both surfaces share it — keeps the row shape in one place, avoids circular imports (`index.tsx` already imports `components` from `./states`).
- **Multiple state configurations from day one.** A single "populated" configuration is half the value of the states page. Empty + mixed/edge variations make the gallery actually useful for design review.
- **No N+1 hooks.** If the real data shape needs per-row fetching, the scaffold uses primary-entity-only fields with a TODO — better to leave a stub than to bake in a pattern the designer would have to undo.
- **`useComponentContext` everywhere.** All SDK UI flows through the components context (see [CLAUDE.md](CLAUDE.md) "ComponentsContext Pattern"). The scaffold models the right pattern from the start.

## Out of scope

- Multi-step flows (wizards, state machines) — start with one page; the designer adds flow steps later if needed.
- Nested wizard routes (`:contractorId`, `add`, etc.) — emit only the basic Prototype + Component states routes; add later if the design grows.
- Real edit/submit forms — the `onEdit` callback is a stub; the designer wires real behavior when the design calls for it.
- Updating the design home page copy — the new card appears automatically once registry.ts is updated.
- Running `npm run sdk-app` — the user may already have it running.
