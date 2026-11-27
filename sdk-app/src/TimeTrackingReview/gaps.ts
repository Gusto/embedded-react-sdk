export type GapKind =
  'none' | 'planned' | 'plannedWorkaround' | 'plannedPartial' | 'bug' | 'limited' | 'sdkComponent'

export const GAP_KIND_LABEL: Record<GapKind, string> = {
  none: 'Not supported, no workaround',
  planned: 'API work planned; coverage TBD',
  plannedWorkaround: 'API work planned; workaround exists',
  plannedPartial: 'API work planned; partial workaround exists',
  bug: 'Supported, with known bugs',
  limited: 'Supported with limitations',
  sdkComponent: 'SDK component gap; possible enhancement',
}

export type Tab = 'review' | 'policies' | 'people'

export type GapId =
  | 'ot-state'
  | 'state-reminders'
  | 'rules-applied'
  | 'auto-sync'
  | 'which-timesheets'
  | 'by-period'
  | 'eligibility'
  | 'period-totals'
  | 'bulk-approval'
  | 'break-timing'
  | 'status-lock'
  | 'sync-limits'
  | 'table-toolbar'
  | 'select-icon'

export interface Gap {
  id: GapId
  priority: 'P0' | 'P1'
  tabs: Tab[]
  kind: GapKind
  title: string
  details: string
  needed?: string
  here: string
}

export const GAPS: Gap[] = [
  {
    id: 'ot-state',
    priority: 'P0',
    tabs: ['policies', 'people'],
    kind: 'none',
    title: 'Policy creation: state designation for OT',
    details: 'Overtime (OT) policies do not have a jurisdiction field.',
    here: 'Shows overtime policies by name only. Break policies do have a jurisdiction.',
  },
  {
    id: 'state-reminders',
    priority: 'P1',
    tabs: ['policies', 'people'],
    kind: 'none',
    title: 'State reminders: identify missing compliant policies',
    details:
      'The APIs do not provide the requirements needed to identify missing compliant policies, and OT policies do not have a jurisdiction field.',
    here: 'Only checks coverage: it warns when an eligible person has no overtime or no break policy. That says nothing about the law.',
  },
  {
    id: 'rules-applied',
    priority: 'P0',
    tabs: ['review'],
    kind: 'none',
    title: 'Timesheet viewing: see rules applied for the date',
    details:
      'Timesheet reads do not expose classified regular, overtime, or double-overtime (DT) hours. Classification is calculated in a pay-period context, rather than returned as a per-shift result.',
    here: 'The overtime column is the page’s own estimate from each person’s overtime policy, marked “est.” in the column header.',
  },
  {
    id: 'auto-sync',
    priority: 'P0',
    tabs: ['review'],
    kind: 'none',
    title: 'Payroll sync: automatically sync hours after approval',
    details:
      'Approval changes the status of individual shifts. Payroll sync is a separate operation scoped to a pay schedule and date range; it does not trigger automatically on approval. Payroll admins will manually sync hours before running payroll.',
    here: 'Send to payroll is its own step, with a review page and a summary.',
  },
  {
    id: 'which-timesheets',
    priority: 'P0',
    tabs: ['review'],
    kind: 'planned',
    title: 'Payroll sync: see which timesheets were factored in',
    details:
      'Missing result detail: no definitive list of successfully applied source shifts/versions.',
    needed:
      'Planned: add a payroll UUID to time sheets to associate current shifts with a payroll. Proposed: set it on confirmed completion and clear it when hours or breaks change. Confirm those semantics and how failed or partial syncs are represented.',
    here: '“Sent” means the shift has synced_to_payroll_at, and “changed since sent” means updated_at is later. The receipt is inferred from those timestamps.',
  },
  {
    id: 'by-period',
    priority: 'P0',
    tabs: ['review'],
    kind: 'plannedWorkaround',
    title: 'Main page / history: view employee timesheets by pay period',
    details:
      'Requires client reconstruction: shifts accept date/person filters, not a period identifier.',
    needed:
      'Workaround: resolve period dates and historical employee membership, fetch shifts using broad timestamp bounds, and filter by each shift’s local start date. Planned: filter time sheets by pay schedule and period dates.',
    here: 'Fetches one day either side in UTC and keeps shifts by their local start date. People come from current schedule assignments, without history.',
  },
  {
    id: 'eligibility',
    priority: 'P0',
    tabs: ['policies', 'people'],
    kind: 'plannedWorkaround',
    title: 'Employee assignment: show eligible employees and explain exclusions',
    details: 'Requires client reconstruction: no eligibility filter for employees.',
    needed:
      'Workaround: fetch all employee pages, resolve current compensation, and derive eligibility/reasons. Planned: an FLSA status filter on the company employees endpoint.',
    here: 'Derives eligibility from each person’s current FLSA status and disables ineligible people with a reason.',
  },
  {
    id: 'period-totals',
    priority: 'P0',
    tabs: ['review'],
    kind: 'plannedPartial',
    title: 'Timesheet viewing: per-person pay-period totals',
    details: 'Requires client reconstruction: no period aggregate response.',
    needed:
      'Workaround: aggregate matching shift hours using the same period scope as review and bulk approval. This does not reproduce classified regular, overtime, and double-overtime totals. Planned: schedule/period filters and classified hours. Confirm the classification design and whether it provides per-person period totals.',
    here: 'Worked adds up each person’s shift hours in the period.',
  },
  {
    id: 'bulk-approval',
    priority: 'P0',
    tabs: ['review'],
    kind: 'plannedWorkaround',
    title: 'Bulk approval: approve all employees for a pay period',
    details: 'Requires client reconstruction: batches need explicit shift UUIDs/versions.',
    needed:
      'Workaround: resolve every shift in the selected period and submit/reconcile update batches via client-side pagination. Planned: schedule/period filters should help identify shifts in scope; batches will still require explicit shift UUIDs/versions and reconciliation of partial outcomes.',
    here: 'Select people or shifts, or use a person’s “Approve all shifts”. The batch is built from those shifts and split at 500.',
  },
  {
    id: 'break-timing',
    priority: 'P0',
    tabs: ['review'],
    kind: 'bug',
    title: 'Timesheet editing: always block invalid break timing',
    details: 'Supported, with a known bug.',
    needed:
      'Known bug: backend validation gap. Shift-boundary-only edits can skip checks on preserved breaks.',
    here: 'Edit shift checks that existing breaks stay inside the new times before saving.',
  },
  {
    id: 'status-lock',
    priority: 'P0',
    tabs: ['review'],
    kind: 'bug',
    title: 'Approval management: allow status changes until hours reach a processed payroll',
    details: 'Supported, with a known bug.',
    needed:
      'Known bug: the API blocks status changes when any overlapping company pay period has processed payroll, not only when the specific shift was included.',
    here: 'Warns when another schedule’s overlapping period is processed.',
  },
  {
    id: 'sync-limits',
    priority: 'P0',
    tabs: ['review'],
    kind: 'limited',
    title: 'Payroll sync: sync approved pay-period hours and see completion',
    details:
      'Sync accepts a pay schedule UUID and start/end dates, not a pay-period identifier. Async status reports completion. Sync does not target transition or termination payrolls; shifts in those periods can resolve to an overlapping regular payroll or to no payroll.',
    here: 'A send covers everyone on the schedule for the period. Only regular pay periods appear in the picker.',
  },
  {
    id: 'table-toolbar',
    priority: 'P1',
    tabs: ['review'],
    kind: 'sdkComponent',
    title: 'SDK: table toolbar that swaps to bulk actions on select',
    details:
      'The SDK DataView has row selection but no toolbar slot. There’s no built-in row above a table that holds page actions and is replaced by a selection count, Clear selection and bulk actions while rows are selected.',
    needed:
      'Possible SDK enhancement: a DataView toolbar (or companion component) with a default slot and a selection slot at a fixed height, so tables don’t shift when selection changes.',
    here: 'The page builds its own control bar from SDK Buttons and Text, and keeps its height fixed.',
  },
  {
    id: 'select-icon',
    priority: 'P1',
    tabs: ['review'],
    kind: 'sdkComponent',
    title: 'SDK: Select has no leading icon',
    details:
      'Buttons take an icon and TextInput takes adornments, but the SDK Select has no icon or adornment prop, so dropdowns can’t match the buttons beside them.',
    needed: 'Possible SDK enhancement: a leading icon (or start adornment) prop on Select.',
    here: 'The pay schedule and period dropdowns place an icon over the Select with CSS and pad its trigger.',
  },
]

export const GAP_NUMBER: Record<GapId, number> = Object.fromEntries(
  GAPS.map((gap, index) => [gap.id, index + 1]),
) as Record<GapId, number>
