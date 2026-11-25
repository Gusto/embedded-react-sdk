import type { Tab } from './gaps'

export type ChangeId =
  | 'view-shifts'
  | 'missed-breaks'
  | 'break-times'
  | 'policy-pages'
  | 'send-page'
  | 'clock-out'
  | 'row-icons'
  | 'shift-window'
  | 'receipt'
  | 'breadcrumbs'
  | 'policy-cards'
  | 'send-outcomes'
  | 'receipt-totals'
  | 'row-actions-text'
  | 'one-send-page'
  | 'send-dialog'
  | 'send-warning'
  | 'people-policies'
  | 'eligible-only'
  | 'delayed-breaks'
  | 'overnight-shifts'
  | 'three-tabs'
  | 'no-overtime'
  | 'send-anchored'
  | 'alerts-column'
  | 'person-alerts'
  | 'approval-binary'
  | 'person-payroll'
  | 'shift-sent-time'

export type ChangeRound = 'nov-19' | 'nov-20' | 'nov-24'

export const ROUND_LABEL: Record<ChangeRound, string> = {
  'nov-24': 'Since the Nov 24 review',
  'nov-20': 'Since the Nov 20 call',
  'nov-19': 'Since the Nov 19 review',
}

export interface Change {
  id: ChangeId
  round: ChangeRound
  tabs: Tab[]
  title: string
  feedback: string | null
  what: string
  where: string
}

export const CHANGES: Change[] = [
  {
    id: 'view-shifts',
    round: 'nov-19',
    tabs: ['review'],
    title: 'View shifts in each person’s menu',
    feedback:
      'I’d also like a dropdown option for “view shifts” for the folks who will not understand that the underline on the shift count in the table is a link.',
    what: '“View shifts” is the first item in each person’s ⋮ menu. It opens the same view as the “N shifts” link.',
    where: 'Timesheets › each person’s ⋮ menu.',
  },
  {
    id: 'missed-breaks',
    round: 'nov-19',
    tabs: ['review'],
    title: 'Missed-break premium explainer',
    feedback:
      'Makes me wonder if we need some text explainer for any shifts that have a missed break that would get a premium.',
    what: 'Shifts missing a break, or with a short one, get a badge (“· premium” when the policy pays one), a note above the list, and a note in Edit shift. The page checks this itself; the API doesn’t flag it.',
    where: 'A person’s shifts › Breaks column and the note above it; Edit shift.',
  },
  {
    id: 'break-times',
    round: 'nov-19',
    tabs: ['review'],
    title: 'Editable break times',
    feedback: 'At some point will need an affordance for modifying the time.',
    what: 'Add shift and Edit shift share one break editor with start and end times. Changing a start keeps the length. Edit shift can now add, move and remove breaks.',
    where: 'Add shift and Edit shift › Breaks.',
  },
  {
    id: 'policy-pages',
    round: 'nov-19',
    tabs: ['policies'],
    title: 'Policy pages, like TimeOffFlow',
    feedback:
      'Wondering if we should try to keep these more similar in terms of when we open a sub page vs when we use a modal. / It feels like I should be able to do more of a selectable table than these cards.',
    what: 'Each policy has a detail page. New, Edit and Assign people are full pages; Assign people is a full-width selectable table with “Select all eligible”. The row menu still opens each one directly.',
    where: 'Policies › policy names, row menus, and the pages they open.',
  },
  {
    id: 'send-page',
    round: 'nov-19',
    tabs: ['review'],
    title: 'Send to payroll as a page',
    feedback: 'Why are all the modals so narrow? We have so much real estate and it’s wasted.',
    what: 'The send review and receipt are a page in the Timesheets tab, with a table of everyone included and a table of shifts that won’t be sent.',
    where: 'Timesheets › Send to payroll.',
  },
  {
    id: 'clock-out',
    round: 'nov-19',
    tabs: ['review'],
    title: 'Clock out now',
    feedback:
      'Part of me does want a “clock out” action… but I guess really that would just open the edit modal with the end time set to now?',
    what: 'A shift that’s still clocked in has “Clock out now” in its ⋮ menu. It opens Edit shift titled “Clock out”, with the end set to now.',
    where: 'A person’s shifts › ⋮ menu on a shift that’s still clocked in.',
  },
  {
    id: 'row-icons',
    round: 'nov-19',
    tabs: ['review'],
    title: 'Approve and reject icons on each row',
    feedback: null,
    what: 'A green check and red X beside each row’s ⋮ menu. On a person they apply to all their shifts. Approve and Reject moved out of the menus. An icon fades when it wouldn’t do anything.',
    where: 'Timesheets › person rows and shift rows.',
  },
  {
    id: 'shift-window',
    round: 'nov-20',
    tabs: ['review'],
    title: 'Add and edit shift are one full screen',
    feedback:
      'If the modal needs to be wider, that’s usually a sign that it needs to be a screen. (Agreed: everything is a screen by default.)',
    what: 'Add shift and Edit shift are now the same screen instead of a popup. The wider Modal size added after Nov 19 is gone, so the remaining popups are the standard SDK width. Person is locked when editing. Start and end each get a date and a time, so overnight shifts are explicit, and each break’s start and end sit side by side. Delete asks to confirm in place.',
    where: 'Timesheets › Add shift; a person’s shifts › Edit or Clock out now.',
  },
  {
    id: 'receipt',
    round: 'nov-19',
    tabs: ['review'],
    title: 'Receipt after sending, and View what was sent',
    feedback: null,
    what: 'Brought over from the HTML prototype. Sending no longer blocks: a “Sending hours to payroll…” strip shows while it runs. Afterwards a “Last sent” strip stays on Timesheets with totals and “View what was sent”, which opens a read-only receipt with a per-person table. It flags shifts changed since the send, and offers “See it in Run payroll”.',
    where: 'Timesheets › under the pay period; Send to payroll.',
  },
  {
    id: 'breadcrumbs',
    round: 'nov-20',
    tabs: ['review', 'policies'],
    title: 'Breadcrumbs on every sub-screen',
    feedback:
      'Do you want that where the context is always where you came from, or would you expect Assign people to sit under California overtime, and go back from there to everything?',
    what: 'Every sub-screen starts with a breadcrumb trail built on the SDK Breadcrumbs. Policy screens always read Policies › policy › page, even when opened from the table’s ⋮ menu. Timesheet screens read Timesheets › person › page. Cancel still returns to where you came from.',
    where: 'Every page inside Timesheets and Policies.',
  },
  {
    id: 'policy-cards',
    round: 'nov-20',
    tabs: ['policies'],
    title: 'Policy detail as cards, like the employee dashboard',
    feedback:
      'This is the pattern that we have for showing a lot of cards on a page, and then when you click edit, it takes you to a full screen view.',
    what: 'The details and people tabs became two stacked cards. Policy details has Edit, People has Assign people, and each opens its full screen. Delete policy stays at the top.',
    where: 'Policies › any policy name.',
  },
  {
    id: 'send-outcomes',
    round: 'nov-20',
    tabs: ['review'],
    title: 'Send waits for a result: sent, partly sent, or failed',
    feedback:
      'Sync is async. At the very least we need a place to sit here letting it spin and then either say “yay, everything went” or “boo, something failed.”',
    what: 'After Send, the page waits on the send, then shows success, a partial failure naming who wasn’t sent (with Try again), or a failed send. Timesheets flags a send that didn’t finish. A dashed “Prototype only” picker on the send page chooses the outcome, since the demo can’t fail on its own.',
    where: 'Timesheets › Send to payroll.',
  },
  {
    id: 'receipt-totals',
    round: 'nov-20',
    tabs: ['review'],
    title: 'Receipt shows hours by type, not shift counts',
    feedback:
      'At the very least we’d be able to tell you: Amelia, 100 hours regular, 49 hours overtime, zero double time for the pay period.',
    what: 'The receipt lists regular, overtime, double time and total hours per person. The shift count and the guessed payroll column are gone, since neither can be read from the API yet. Overtime and double time stay marked as estimates.',
    where: 'Timesheets › View what was sent.',
  },
  {
    id: 'row-actions-text',
    round: 'nov-20',
    tabs: ['review'],
    title: 'Row actions live in the ⋮ menu; bulk bars keep the buttons',
    feedback:
      'Without the tooltip it’s hard: does X mean I’m deleting the entry? Maybe I’ll experiment with making it a real button and see how badly it breaks the experience.',
    what: 'To keep the tables clean, every row’s Approve, Reject and Return to pending sit in its ⋮ menu with a check, X and slash icon, and a count on person rows. Selecting rows brings up a bulk bar with the same three actions as labelled, counted buttons. Clicking a person’s name or “View shifts (n)” opens their shifts. The SDK icon button has no tooltip, which is still an open question for the SDK components.',
    where: 'Timesheets › every row’s ⋮ menu, both bulk bars, and person names.',
  },
  {
    id: 'one-send-page',
    round: 'nov-20',
    tabs: ['review'],
    title: 'One page for sending: review, wait, result',
    feedback:
      'Send, here’s the thing, send it. And then when you’re done, one more time, a receipt of what has been sent. Maybe this is overkill.',
    what: 'Send to payroll is now a single page. It lists what will be sent by person and type of hours, then after Send the same page waits on the sync and shows the result in place. The separate receipt page is gone; “View what was sent” on Timesheets opens this page in its result state.',
    where: 'Timesheets › Send to payroll, and View what was sent.',
  },
  {
    id: 'send-dialog',
    round: 'nov-24',
    tabs: ['review'],
    title: 'Sending is its own short flow: review, sending, summary',
    feedback:
      'Simplify the send, without “what we’ll send” and “what we sent” tables. Then: the send should be a dedicated experience with an explicit return, not just a banner.',
    what: 'Send to payroll opens a “Review and send hours” page, like contractor payments’ “Review and submit”: the deadline, a warning for shifts left out, and four facts (hours, shifts, people, payroll) instead of a table, with Back and Send. While it runs, the page shows the same loader as submitting a payroll, and you can go back to Timesheets. It ends on a “Send summary” page with the result and a Done button that returns to Timesheets, like contractor payments’ Payment summary. Timesheets keeps a one-line status that opens the summary.',
    where: 'Timesheets › Send to payroll.',
  },
  {
    id: 'send-warning',
    round: 'nov-24',
    tabs: ['review'],
    title: 'Warn about shifts left out before sending',
    feedback:
      'Warn people when pending, rejected or still clocked-in shifts won’t be part of the payroll calculation.',
    what: 'When any shift won’t be sent, the review page shows a warning with the count by reason (not approved, still clocked in), who they belong to, and a Review shifts button. This follows how Payroll review shows blockers inline above Submit.',
    where: 'Timesheets › Send to payroll.',
  },
  {
    id: 'people-policies',
    round: 'nov-24',
    tabs: ['people'],
    title: 'Policies by person: move people between policies',
    feedback:
      'Flip the assignment view to people first, show each person’s current policies, and use the Time Off bulk selection pattern.',
    what: 'The People tab lists every eligible person with their current overtime and break policy. Change anyone from their row; there are no checkboxes, since the dropdowns do the job. Overtime has no “none” option since the API can only move people, not remove them. Built on the same searchable, selectable table as Time Off’s add employees.',
    where: 'People tab.',
  },
  {
    id: 'eligible-only',
    round: 'nov-24',
    tabs: ['people'],
    title: 'Only eligible people are listed',
    feedback:
      'Drop the eligibility column; the employees API can filter by FLSA status so only hourly and salaried non-exempt people show.',
    what: 'People who can’t be on a policy aren’t listed at all, so the Eligibility column is gone. For now the page filters by FLSA status itself, pending the API filter.',
    where: 'People tab.',
  },
  {
    id: 'delayed-breaks',
    round: 'nov-24',
    tabs: ['review'],
    title: 'Delayed breaks, and more than one problem per break',
    feedback: 'Breaks can be missed, delayed or shortened, and more than one at once.',
    what: 'Break columns can show Delayed when a break starts after the policy’s latest start, alongside Missed and Short. A shift can show several at once.',
    where: 'A person’s shifts › Alerts column; Edit shift.',
  },
  {
    id: 'overnight-shifts',
    round: 'nov-24',
    tabs: ['review'],
    title: 'Overnight and long shifts aren’t blocked',
    feedback:
      'Partners’ clock-in apps send messy data, so handle overnight shifts gracefully instead of strict rules.',
    what: 'Add and Edit shift only require the end to be after the start; if the end time is earlier on the same day, the error suggests changing the end date. Overnight shifts say “Ends the next day”. Shifts over 16 hours get a note, and an overlap with another shift is a warning instead of an error, so messy clock-in data can still be fixed and saved.',
    where: 'Add shift and Edit shift.',
  },
  {
    id: 'three-tabs',
    round: 'nov-24',
    tabs: ['policies', 'people'],
    title: 'Three tabs: Timesheets, Policies, People',
    feedback:
      'Policies is confusing. Make it three pages: Timesheets, Policies (assigned people and details), and People (the table of where everyone belongs). Drop Run payroll from the prototype.',
    what: 'Policies now only lists policies; each policy page shows its assigned people and details, and “Edit people” opens the People tab. People is its own tab: everyone eligible with their overtime and break policy, changed with the dropdown on each row (no checkboxes or bulk bar). The separate “Add employees to policy” screen and the Run payroll tab are gone.',
    where: 'The tabs at the top; Policies › a policy › Edit people.',
  },
  {
    id: 'no-overtime',
    round: 'nov-24',
    tabs: ['people'],
    title: 'No overtime policy is an error, no break policy is fine',
    feedback:
      'Is it possible for someone to not have a break policy or an overtime policy at all? Pressure-testing the dropdowns.',
    what: 'Both can happen, but they mean different things. Someone with no overtime policy (a new hire, say) can’t have shifts saved, so their overtime dropdown is marked invalid, their row says “No overtime policy” in red, and an error alert at the top names them. No break policy is allowed, so it gets an info note only. Overtime still has no “none” option, since once someone is on one they can only be moved.',
    where: 'People tab.',
  },
  {
    id: 'send-anchored',
    round: 'nov-24',
    tabs: ['review'],
    title: 'Send flow stays put: one layout, fixed buttons',
    feedback:
      'We have jumping CTAs and no clear “return to timesheets” button. Make the flow buttoned up, less jumpy, and anchor expectations.',
    what: 'Review, sending and the result are one page that changes in place. The title stays “Send to payroll”; the alert at the top shows where you are (deadline and left-out warning, then “Sending…”, then the result); the facts box stays in the same spot and is retitled What you’re sending, What’s being sent, What was sent. The buttons never move: Back to timesheets on the left, and on the right Send, then the same button spinning while it sends, then Try again if it failed. After a successful send the one remaining button is Back to timesheets.',
    where: 'Timesheets › Send to payroll.',
  },
  {
    id: 'alerts-column',
    round: 'nov-24',
    tabs: ['review'],
    title: 'One Alerts column instead of a column per break type',
    feedback:
      'Rather than separate columns for meal and rest breaks, have one Alerts column and stack the issues.',
    what: 'A person’s shifts now have one Alerts column. Each problem is its own line: missed, delayed or short meal and rest breaks, and shifts over 16 hours. Shifts with no problems show a dash.',
    where: 'A person’s shifts › Alerts column.',
  },
  {
    id: 'person-alerts',
    round: 'nov-24',
    tabs: ['review'],
    title: 'Alerts on the timesheets list',
    feedback: 'Show the same stacked alerts on the main timesheets table, one row per person.',
    what: 'Each person’s row has an Alerts column that totals their problems across the period, one line each: e.g. “3 missed meal breaks” or “1 long shift”.',
    where: 'Timesheets › Alerts column.',
  },
  {
    id: 'approval-binary',
    round: 'nov-24',
    tabs: ['review'],
    title: 'Approved or not approved, nothing else',
    feedback: 'Do we still need Return to pending? Maybe it’s not rejected, just unapproved.',
    what: 'A shift is either approved or not. Each shift row has an Approve switch, and each person row has an “Approve (n)” switch that is on when all their finished shifts are approved, and bulk actions are Approve and Unapprove. Reject and Return to pending are gone. Unapproving writes “pending”. A shift rejected elsewhere shows as Not approved, since the API treats pending and rejected the same: neither is sent, and rejected has no reason, lock or notice. The one difference is the status-change webhook partners receive.',
    where:
      'Timesheets › Approval column, row menus and bulk bar; a person’s shifts › Approve switch; Send to payroll warning.',
  },
  {
    id: 'person-payroll',
    round: 'nov-24',
    tabs: ['review'],
    title: 'Payroll state on the timesheets list',
    feedback: 'Mirror the shifts table’s Payroll column on the main table, e.g. Sent (15).',
    what: 'Each person’s row stacks Sent, Changed since send and Not sent with counts, so it shows who needs payroll updated without opening each person. Built from each shift’s synced_to_payroll_at, which the API never clears and doesn’t tie to a payroll.',
    where: 'Timesheets › Payroll column.',
  },
  {
    id: 'shift-sent-time',
    round: 'nov-24',
    tabs: ['review'],
    title: 'When each shift was sent',
    feedback:
      'Keep the timesheets list generic (sent or not sent) and put the timestamp on each shift.',
    what: 'A person’s shifts show one badge with the time: “Sent Nov 24, 3:12 PM”, or “Changed since sent Nov 24, 3:12 PM” when the shift was edited after. The timesheets list keeps the counts.',
    where: 'A person’s shifts › Payroll column.',
  },
]

export const CHANGE_NUMBER: Record<ChangeId, number> = Object.fromEntries(
  CHANGES.map((change, index) => [change.id, index + 1]),
) as Record<ChangeId, number>
