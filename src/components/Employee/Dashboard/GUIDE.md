<!-- Partner-facing guide content, published to the SDK docs site. -->

# DashboardFlow

## Tabs <!-- slot: overview -->

The dashboard organizes an employee's payroll information into four tabs. Switching tabs emits `employee/dashboard/tabChange`.

- **Basic details** — legal name, start date, SSN, date of birth, and personal email, plus home address and work address cards. Fields are read-only with "Edit"/"Manage" CTAs.
- **Job and pay** — compensation (one job, or a table of jobs when the primary job is nonexempt), payment method (direct-deposit bank accounts), deductions (garnishments), and paystub history. Lists paginate.
- **Taxes** — federal tax withholding (supports both pre-2020 and Rev 2020 W-4 versions, so the visible fields vary with the W-4 on file) and per-state tax withholding records.
- **Documents** — a read-only table of employee forms (W-2s, W-4s, direct-deposit authorizations, and other documents) with a "View" CTA per row.

## Step flow <!-- slot: appendix -->

The dashboard is a hub: the tabbed cards view (`index`) is the resting state. Selecting an edit/manage CTA on a card swaps the dashboard chrome for that section's edit screen; cancelling or completing the edit returns to the cards. On a successful save the dashboard returns to the cards and surfaces a success alert at the top, which the user can dismiss (`employee/dismiss`). The diagram shows the federal-taxes spoke; every other section follows the same card → edit → cards shape.

```mermaid
flowchart
  Index -->|"employee/management/federalTaxes/card/editRequested"| FederalTaxes
  FederalTaxes -->|"employee/management/federalTaxes/editForm/submitted (success alert)"| Index
  FederalTaxes -->|"employee/management/federalTaxes/editForm/cancelled"| Index
  Index -->|"employee/dashboard/tabChange"| Index
  Index -->|"employee/dismiss"| Index
```

Some actions stay on the cards view rather than opening a spoke: deleting a bank account (`employee/management/paymentMethod/card/bankAccountDeleted`) or a deduction (`employee/management/deductions/card/deleted`) surfaces a success alert in place without a screen swap.

## Empty states <!-- slot: appendix -->

Each section handles missing data on its own: compensation shows an empty state whose header CTA switches from "Edit" to "Add job"; payment methods, deductions, and state taxes each show a "none on file" message with the relevant add CTA; paystubs indicate that records appear after payroll is run; documents show a "No forms" message.
