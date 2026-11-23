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

export type ChangeRound = 'nov-19' | 'nov-20'

export const ROUND_LABEL: Record<ChangeRound, string> = {
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
    what: 'After Send, the receipt waits on the send, then shows success, a partial failure naming who wasn’t sent (with Try again), or a failed send. Timesheets flags a send that didn’t finish. A dashed “Prototype only” picker on the send page chooses the outcome, since the demo can’t fail on its own.',
    where: 'Timesheets › Send to payroll, and the receipt it opens.',
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
    title: 'Try approve and reject as text buttons',
    feedback:
      'Without the tooltip it’s hard: does X mean I’m deleting the entry? Maybe I’ll experiment with making it a real button and see how badly it breaks the experience.',
    what: 'A prototype-only “Row actions” switch in the header swaps the ✓ and ✕ icons for “Approve” and “Reject” text buttons on every person and shift row, so both can be compared. The choice stays in the URL. The SDK icon button has no tooltip, which is a question for Steve.',
    where: 'Header › Row actions; Timesheets › person rows and shift rows.',
  },
]

export const CHANGE_NUMBER: Record<ChangeId, number> = Object.fromEntries(
  CHANGES.map((change, index) => [change.id, index + 1]),
) as Record<ChangeId, number>
