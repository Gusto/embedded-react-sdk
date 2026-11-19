export type GapKind = 'planned' | 'workaround' | 'none' | 'bug' | 'question' | 'sdk'

export const GAP_KIND_LABEL: Record<GapKind, string> = {
  planned: 'API work planned',
  workaround: 'Client workaround',
  none: 'No workaround',
  bug: 'Known API bug',
  question: 'Open question',
  sdk: 'SDK limitation',
}

export type Tab = 'review' | 'policies' | 'payroll'

export interface Gap {
  id: string
  tabs: Tab[]
  kind: GapKind
  title: string
  api: string
  here: string
}

export const GAPS: Gap[] = [
  {
    id: 'period',
    tabs: ['review', 'payroll'],
    kind: 'workaround',
    title: 'No pay period filter on shifts',
    api: 'Shifts filter by people and UTC timestamps only. The appendix workaround: resolve the period dates and the people on the schedule, fetch with broad bounds, then keep shifts by their local start date.',
    here: 'Fetches one day either side in UTC, then filters by each shift’s own time zone. Planned: a pay schedule and period filter (work starts mid-Dec to early Jan).',
  },
  {
    id: 'membership',
    tabs: ['review', 'payroll'],
    kind: 'workaround',
    title: 'Who is on this schedule is reconstructed',
    api: 'Nothing on a shift says which pay schedule it belongs to. Schedule membership comes from current assignments, so anyone who changed schedule mid-period is placed by where they are today.',
    here: 'Resolves each employee from pay_schedules/assignments, the same way the Pay Period Shifts explorer does.',
  },
  {
    id: 'overtime',
    tabs: ['review'],
    kind: 'planned',
    title: 'No overtime or regular split',
    api: 'Shifts only carry Unclassified worked hours. Classification runs at sync time, per person per period, and isn’t returned on reads.',
    here: 'The overtime column stays empty. Planned: classified hours (the overtime preview). Its design isn’t confirmed.',
  },
  {
    id: 'which-payroll',
    tabs: ['review', 'payroll'],
    kind: 'planned',
    title: 'Which shifts went to which payroll',
    api: 'A sync doesn’t list the shifts it used. Each shift only gets synced_to_payroll_at.',
    here: '“Sent” means the shift has a synced_to_payroll_at timestamp. Planned: a payroll UUID on each shift, set on completion and cleared on change. Not confirmed.',
  },
  {
    id: 'changed',
    tabs: ['review'],
    kind: 'question',
    title: '“Changed since send” is a guess',
    api: 'Whether editing a shift clears synced_to_payroll_at is still being checked.',
    here: 'Flags a shift when updated_at is later than synced_to_payroll_at. A status change also bumps updated_at, so this can over-flag.',
  },
  {
    id: 'receipt',
    tabs: ['review'],
    kind: 'none',
    title: 'No sync history to build a receipt from',
    api: 'There’s no endpoint that lists past syncs (GET …/time_tracking/payroll_syncs returns 404). A sync’s status can only be read by its UUID.',
    here: 'The receipt is inferred from the latest synced_to_payroll_at in the period. A partner would have to store sync UUIDs themselves.',
  },
  {
    id: 'payroll-hours',
    tabs: ['review', 'payroll'],
    kind: 'none',
    title: 'Can’t read what payroll currently has',
    api: 'GET payroll returns no employee_compensations until the payroll is prepared, and preparing it is a PUT.',
    here: 'The send preview can’t show what each person’s hours will change from, or spot hand edits that a send would overwrite.',
  },
  {
    id: 'scope',
    tabs: ['review'],
    kind: 'none',
    title: 'A send covers everyone on the schedule',
    api: 'Sync takes a pay schedule and dates. It recalculates everyone and overwrites payroll hours, including hand edits. Filters and selections on this page don’t narrow it.',
    here: 'The send preview lists everyone it would include and skip, whatever the filters show.',
  },
  {
    id: 'flsa',
    tabs: ['review'],
    kind: 'workaround',
    title: 'Whose hours actually land in payroll',
    api: 'Hourly nonexempt hours sync. Salaried nonexempt regular hours are filtered out; their overtime still syncs. The appendix doesn’t say what happens to exempt employees. There’s no FLSA filter on employees yet.',
    here: 'Reads FLSA status from each person’s current compensation and labels the effect. Planned: an FLSA filter on the employees endpoint.',
  },
  {
    id: 'approval',
    tabs: ['review'],
    kind: 'question',
    title: 'Approval doesn’t mean reviewed',
    api: 'New shifts can be created approved, and edits don’t reset approval. Approval only makes a shift eligible for a future sync.',
    here: 'Shows the real status. In this demo company every shift is already approved, so there’s nothing to review.',
  },
  {
    id: 'batch',
    tabs: ['review'],
    kind: 'workaround',
    title: 'Bulk approve is batches of explicit shifts',
    api: 'Batches take up to 500 shifts with uuid and version, and partial successes persist.',
    here: 'Select shifts, or use a person’s “Approve all pending”. The batch is built from those shifts and split at 500.',
  },
  {
    id: 'lock-bug',
    tabs: ['review', 'payroll'],
    kind: 'bug',
    title: 'Any processed overlapping payroll blocks status changes',
    api: 'Status changes are blocked when any company pay period that overlaps has a processed payroll, not just the one this shift went to.',
    here: 'Warns when another schedule’s overlapping period is processed.',
  },
  {
    id: 'transition',
    tabs: ['review', 'payroll'],
    kind: 'none',
    title: 'Transition and termination payrolls',
    api: 'Sync doesn’t target transition or termination payrolls. Shifts in those periods can land on an overlapping regular payroll or on none.',
    here: 'Only regular pay periods appear in the picker.',
  },
  {
    id: 'state',
    tabs: ['policies'],
    kind: 'none',
    title: 'No state on overtime policies',
    api: 'Break policies have a jurisdiction (this company’s is CA). Overtime policies don’t, so the SDK can’t say whether overtime rules meet a state’s law.',
    here: 'Shows each person’s policies by name only.',
  },
  {
    id: 'grouped-rows',
    tabs: ['review'],
    kind: 'sdk',
    title: 'The SDK table can’t group rows',
    api: 'Not an API gap. Partners bring their own table through the component adapter, which has no grouped or expandable rows.',
    here: 'Uses the SDK table as it is: a row per person, and “See shifts” opens that person’s shifts. Grouped rows would need new table props that every partner adapter supports.',
  },
  {
    id: 'overlap-create',
    tabs: ['review'],
    kind: 'workaround',
    title: 'Overlap is only checked on create',
    api: 'Creating a shift that overlaps another one for the same person is rejected. Editing a shift into an overlap isn’t.',
    here: 'Add shift checks against the shifts already loaded, so the clash shows before the request. Edit can only warn.',
  },
  {
    id: 'timezone',
    tabs: ['review'],
    kind: 'question',
    title: 'Which time zone a new shift uses',
    api: 'Every shift needs a time_zone, but nothing on the employee or company says which one to use.',
    here: 'Uses the time zone of the person’s other shifts, or the most common one in the period.',
  },
  {
    id: 'delete',
    tabs: ['review'],
    kind: 'workaround',
    title: 'Deleting is one shift at a time',
    api: 'Batches only create and update. Each delete is its own request with the shift’s version.',
    here: 'Delete shows a single DELETE request.',
  },
  {
    id: 'eligibility',
    tabs: ['policies'],
    kind: 'workaround',
    title: 'Eligibility is derived, and rejections have no reasons',
    api: 'There’s no eligibility filter on employees. Assigning someone ineligible fails for the whole request, without saying who or why.',
    here: 'Derives eligibility from each person’s current FLSA status (the same rules as the first prototype) and disables ineligible people with a reason. Planned: an FLSA filter on employees.',
  },
  {
    id: 'missing-policy',
    tabs: ['policies'],
    kind: 'none',
    title: 'No way to tell if policies are compliant',
    api: 'The API has no list of required policies by state, so it can’t warn about missing or non-compliant ones.',
    here: 'Only checks coverage: it warns when an eligible person has no overtime or no break policy. That says nothing about the law.',
  },
  {
    id: 'ot-required',
    tabs: ['policies'],
    kind: 'workaround',
    title: 'Overtime policies can’t be removed, only replaced',
    api: 'Overtime policies have assign but no remove. Someone leaves a policy by being assigned to another one.',
    here: 'People already on the policy are locked in the picker, with “move them from the other policy” as the way out.',
  },
  {
    id: 'ot-effective',
    tabs: ['policies'],
    kind: 'workaround',
    title: 'Overtime changes reach back to the start of the workweek',
    api: 'An overtime change applies to the current workweek. The workweek comes from each pay schedule, and here they differ (Saturday on one, Monday on the others). Nothing says which payrolls already include that week.',
    here: 'The edit form lists each schedule’s current workweek start.',
  },
  {
    id: 'break-today',
    tabs: ['policies'],
    kind: 'workaround',
    title: 'A break taken today blocks the change',
    api: 'Changing someone’s break policy, or deleting a policy they’re on, fails if they took a break today. The error doesn’t say who.',
    here: 'Loads today’s shifts and flags anyone with a break today before you try.',
  },
  {
    id: 'break-replace',
    tabs: ['policies'],
    kind: 'workaround',
    title: 'Editing a break policy replaces it',
    api: 'Update is a full replacement (PUT) and rejects jurisdiction, which is fixed when the policy is created. Assign and remove are separate requests, and the second needs the version the first returns.',
    here: 'The edit form locks jurisdiction and sends every rule. Assign changes show both requests in order.',
  },
  {
    id: 'min-time',
    tabs: ['policies'],
    kind: 'question',
    title: 'Where does “minimum time required” come from?',
    api: 'Break rules come back with minimum_time_required_in_minutes (361 and 211 here), but it isn’t in the create body.',
    here: 'Shows it read-only. Is it derived from the jurisdiction, and what does it mean for an admin?',
  },
  {
    id: 'resync',
    tabs: ['payroll'],
    kind: 'none',
    title: 'Payroll doesn’t know about unsent hours',
    api: 'Nothing on a payroll says time tracking is in use, or that approved hours haven’t been sent. Payroll never pulls from timesheets.',
    here: 'Counts approved shifts with no synced_to_payroll_at in each payroll’s period. Run payroll shows the reminder before going on.',
  },
]

export const GAP_NUMBER: Record<string, number> = Object.fromEntries(
  GAPS.map((gap, index) => [gap.id, index + 1]),
)
