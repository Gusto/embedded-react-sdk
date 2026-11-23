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

export interface Change {
  id: ChangeId
  tabs: Tab[]
  title: string
  feedback: string | null
  what: string
  where: string
}

export const CHANGES: Change[] = [
  {
    id: 'view-shifts',
    tabs: ['review'],
    title: 'View shifts in each person’s menu',
    feedback:
      'I’d also like a dropdown option for “view shifts” for the folks who will not understand that the underline on the shift count in the table is a link.',
    what: '“View shifts” is the first item in each person’s ⋮ menu. It opens the same view as the “N shifts” link.',
    where: 'Timesheets › each person’s ⋮ menu.',
  },
  {
    id: 'missed-breaks',
    tabs: ['review'],
    title: 'Missed-break premium explainer',
    feedback:
      'Makes me wonder if we need some text explainer for any shifts that have a missed break that would get a premium.',
    what: 'Shifts missing a break, or with a short one, get a badge (“· premium” when the policy pays one), a note above the list, and a note in Edit shift. The page checks this itself; the API doesn’t flag it.',
    where: 'A person’s shifts › Breaks column and the note above it; Edit shift.',
  },
  {
    id: 'break-times',
    tabs: ['review'],
    title: 'Editable break times',
    feedback: 'At some point will need an affordance for modifying the time.',
    what: 'Add shift and Edit shift share one break editor with start and end times. Changing a start keeps the length. Edit shift can now add, move and remove breaks.',
    where: 'Add shift and Edit shift › Breaks.',
  },
  {
    id: 'policy-pages',
    tabs: ['policies'],
    title: 'Policy pages, like TimeOffFlow',
    feedback:
      'Wondering if we should try to keep these more similar in terms of when we open a sub page vs when we use a modal. / It feels like I should be able to do more of a selectable table than these cards.',
    what: 'Each policy has a detail page with details and people tabs. New, Edit and Assign people are full pages; Assign people is a full-width selectable table with “Select all eligible”. The row menu still opens each one directly.',
    where: 'Policies › policy names, row menus, and the pages they open.',
  },
  {
    id: 'send-page',
    tabs: ['review'],
    title: 'Send to payroll as a page',
    feedback: 'Why are all the modals so narrow? We have so much real estate and it’s wasted.',
    what: 'The send review and receipt are a page in the Timesheets tab, with a table of everyone included and a table of shifts that won’t be sent. Add and Edit shift stay as modals (see the wider shift window).',
    where: 'Timesheets › Send to payroll.',
  },
  {
    id: 'clock-out',
    tabs: ['review'],
    title: 'Clock out now',
    feedback:
      'Part of me does want a “clock out” action… but I guess really that would just open the edit modal with the end time set to now?',
    what: 'A shift that’s still clocked in has “Clock out now” in its ⋮ menu. It opens Edit shift titled “Clock out”, with the end set to now.',
    where: 'A person’s shifts › ⋮ menu on a shift that’s still clocked in.',
  },
  {
    id: 'row-icons',
    tabs: ['review'],
    title: 'Approve and reject icons on each row',
    feedback: null,
    what: 'A green check and red X beside each row’s ⋮ menu. On a person they apply to all their shifts. Approve and Reject moved out of the menus. An icon fades when it wouldn’t do anything.',
    where: 'Timesheets › person rows and shift rows.',
  },
  {
    id: 'shift-window',
    tabs: ['review'],
    title: 'Add and edit shift are one full screen',
    feedback: 'Dang why are all the modals so narrow? We have so much real estate and it’s wasted.',
    what: 'Add shift and Edit shift are now the same screen instead of a popup, with a back link to where you came from. Person is locked when editing. Start and end each get a date and a time, so overnight shifts are explicit, and each break’s start and end sit side by side. Delete asks to confirm in place.',
    where: 'Timesheets › Add shift; a person’s shifts › Edit or Clock out now.',
  },
  {
    id: 'receipt',
    tabs: ['review'],
    title: 'Receipt after sending, and View what was sent',
    feedback: null,
    what: 'Brought over from the HTML prototype. Sending no longer blocks: a “Sending hours to payroll…” strip shows while it runs. Afterwards a “Last sent” strip stays on Timesheets with totals and “View what was sent”, which opens a read-only receipt with a per-person table. It flags shifts changed since the send, and offers “See it in Run payroll”.',
    where: 'Timesheets › under the pay period; Send to payroll.',
  },
]

export const CHANGE_NUMBER: Record<ChangeId, number> = Object.fromEntries(
  CHANGES.map((change, index) => [change.id, index + 1]),
) as Record<ChangeId, number>
