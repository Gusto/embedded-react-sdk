---
title: 'Test Fest: Compensation — Steady State SDK'
description: Internal test-fest plan validating the Dashboard Compensation card lifecycle — view, edit, schedule future changes, multi-job table, and FLSA reclassification.
---

# Test Fest: Compensation — Steady State SDK

**Driven by:** Steve Jensen
**Date:** May 21, 2026

---

## Feature Overview

### Objective

Validate the end-to-end behavior of employee compensation management in the Gusto Embedded React SDK's Employee Dashboard. This test fest covers the full lifecycle of the Compensation card on the Job & Pay tab: viewing, editing, scheduling future changes, managing pending-change alerts, and canceling scheduled changes. It also covers multi-job scenarios (adding a secondary job, viewing the jobs table, deleting a secondary job) and the FLSA reclassification carve-out (deleting secondary jobs when reclassifying away from Nonexempt).

### What changed recently

Two recent deliveries are relevant to this test fest:

1. **Steady State Phase 1 (Dmitriy, May 19)** — Dashboard Job & Pay tab, including the Compensation card, pay stubs, payment method, and deductions. This is the primary feature under test.
2. **Add job + Add another job wired in (May 21, #1898)** — The "Add a job" and "Add another job" forms are now fully wired into the DashboardFlow state machine.
3. **Pending badge for future-dated jobs (#1897)** — The Compensation card and multi-job table now show a "Pending" badge on jobs whose compensation hasn't started yet (hire date is in the future).
4. **Edit compensation routing by job state (#1909)** — Clicking "Edit" no longer always opens a create form. The dashboard now inspects the job's pending compensation and routes to the correct form:
   - **No pending comp** → create form (POST a new future-dated comp)
   - **Pending comp exists (existing active job)** → edit form (PUT), effective date pre-filled
   - **Primary new job** (future hire date, no current comp) → edit form (PUT), shows **Hire date** field instead of Effective date
   - **Secondary new job** (future hire date) → edit form (PUT), shows Effective date with minimum = hire date or tomorrow (whichever is later)

### Scope (primary flows)

- `Employee.DashboardFlow` — Job & Pay tab → Compensation card
- Viewing and editing compensation for a single job (no pending changes)
- Viewing and editing a future-dated job (the "Pending" badge case; uses PUT, not POST)
- Scheduling a future-dated compensation change (POST a new comp with future effective date)
- Viewing and canceling a pending compensation change (single-job inline alert)
- Multi-job table: viewing, editing, and deleting secondary jobs
- Pending-change alerts in multi-job context (inline vs. summary modal)
- Adding a secondary job for a Nonexempt employee
- FLSA reclassification when secondary jobs exist (carve-out warning + secondary-deletion behavior)

### What we are NOT testing

- Pay stubs, deductions, and payment method sections of Job & Pay (covered by Steady State Phase 1 separately)
- Employee onboarding compensation (covered by `Employee.OnboardingFlow`)
- Contractor compensation

### Test focus questions

- Does the Compensation card display current values (title, type, wage, effective date) correctly?
- When a job's compensation is future-dated, does the card show a "Pending" badge and does clicking "Edit" open the form in **edit mode** (pre-populated with the future comp)?
- When a future change is scheduled, does the yellow warning alert appear with the correct effective date and change details?
- Can you cancel a pending change from the inline alert? From the Review modal (multi-job)?
- Does the "Add another job" footer button only appear when the primary's FLSA is Nonexempt and no future non-Nonexempt comp is scheduled?
- Does the FLSA reclassification warning appear when changing from Nonexempt while secondary jobs exist?
  - In create mode (scheduling future change): is the date field still editable?
  - In update/edit mode: is the date forced to today and disabled?
- Does the multi-job table correctly show the "Pending" badge column only when at least one job is in a pending-new state?
- Does the "Review pending changes" modal show all pending update-type changes (not new-job changes)?
- Are all SDK events firing in the console at the right times?
- Any copy issues (truncation, missing strings, wrong labels)?

### Relevant links

- JIRA Epic: [SDK-XXX Steady State Phase 1](https://gustohq.atlassian.net/browse/SDK-XXX)
- Figma: [Frontend SDK Partner Design File — Employee Dashboard](https://www.figma.com/design/6dxOSiONDiJoa9zY1wOwbs/Frontend-SDK-Partner-Design-File)
- Component: `src/components/Employee/Dashboard/JobAndPayView.tsx`
- Compensation form: `src/components/Employee/Compensation/management/EditCompensation/EditCompensation.tsx`

---

## Assumptions

These are baked into the test cases below. Flag anything that doesn't match actual behavior.

| #   | Assumption                                                                                                                                                                                                                                                                                                                                               |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1  | **"Current comp"** = the pay rate currently in effect (effective date is today or in the past). This is what the Compensation card displays.                                                                                                                                                                                                             |
| A2  | **"Future-dated job"** = a job whose only compensation has a future effective date — the job hasn't started yet. The card shows a "Pending" badge instead of a pending-change alert.                                                                                                                                                                     |
| A3  | **"Pending change"** = a job that already has a current comp AND a scheduled future change. The card shows a warning alert with the effective date and a "Cancel change" button.                                                                                                                                                                         |
| A4  | **Editing compensation** behaves differently by job state. If no pending comp exists, it schedules a new future change (POST; effective date must be tomorrow or later). If a pending comp already exists — or the job itself is future-dated — clicking Edit opens that pending comp for update (PUT) instead of stacking a second change on top of it. |
| A5  | **"Add another job" is Nonexempt-gated**: the button only appears when the primary job's current FLSA is Nonexempt and no future reclassification away from Nonexempt is already scheduled.                                                                                                                                                              |
| A6  | **FLSA reclassification warning**: switching a primary job from Nonexempt to any other type while secondary jobs exist shows a warning that secondaries will be removed when the change takes effect.                                                                                                                                                    |
| A7  | **Pending change alerts — single vs. multi-job**: one pending change shows an inline alert on the card. Two or more pending changes collapse into a summary alert with a "Review" button that opens a modal listing each change individually.                                                                                                            |
| A8  | **"Pending" badge vs. pending-change alert**: the badge means the job hasn't started yet. The alert means an active job has a future pay change scheduled. They are mutually exclusive states on any given job.                                                                                                                                          |

---

## Test Environment Setup

### Creating a Demo Company

1. Navigate to [https://flows.gusto-demo.com/demos](https://flows.gusto-demo.com/demos)
2. Expand the **Select a Type** dropdown and select **React SDK (Company Onboarded)**, then click **Create demo**
3. Wait for "Your demo is ready!" to appear, then click the generated flow URL
4. You should see a component picker with a **Select component** dropdown at the top of the page

### Viewing SDK Events

Right-click anywhere on the page and select **Inspect**, then open the **Console** tab. The console will show SDK events that fire along with the associated data.

### Relevant SDK Events to Watch

| Event                                                             | When it fires                                                          |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `EMPLOYEE_MANAGEMENT_COMPENSATION_EDIT_FORM_SUBMITTED`            | Edit-compensation save completed (current or scheduled pending change) |
| `EMPLOYEE_MANAGEMENT_COMPENSATION_ADD_JOB_FORM_SUBMITTED`         | First job + compensation saved from the empty state                    |
| `EMPLOYEE_MANAGEMENT_COMPENSATION_ADD_ANOTHER_JOB_FORM_SUBMITTED` | Secondary job + compensation saved                                     |
| `EMPLOYEE_MANAGEMENT_COMPENSATION_CARD_CHANGE_CANCELLED`          | Scheduled future-dated change cancelled from the card                  |
| `EMPLOYEE_MANAGEMENT_COMPENSATION_CARD_JOB_DELETED`               | Secondary job deleted from the card                                    |

Each form also emits a matching `..._CANCELLED` event when the user clicks Cancel.

---

## Task 0 — Add the First Job (Empty State → Active Job)

**Purpose:** Tests the "Add job" flow for an employee with no existing compensation. This path just landed with `#1898`.

**Setup — Creating a fresh employee with no jobs:**

You need an employee who has been created but has no jobs yet. The easiest way is to use `Employee.OnboardingFlow` to create a new employee, then navigate to `Employee.DashboardFlow` for that employee.

1. In the component picker, select **Employee.OnboardingFlow**
2. Open the browser inspector (right-click → **Inspect**) and go to the **Console** tab
3. Click **Add another employee** in the top right of the component
4. Fill out the employee profile (first name, last name, email) — do **not** proceed past the first step; just save the profile
5. In the console, look for the `employee/created` event. Click the caret (▶) to expand it and copy the **UUID** value — this is the employee ID
6. In the URL bar, navigate to the DashboardFlow URL for that employee. The URL follows this pattern — replace the last segment with the UUID you copied:
   ```
   https://flows.gusto-demo.com/app/{token}/react_sdk/employee/DashboardFlow/{employee-uuid}
   ```
   For example:
   ```
   https://flows.gusto-demo.com/app/QyP_Qvx7XEZY28TBU740esqSYeqa07zMf0X0CI8ouMU/react_sdk/employee/DashboardFlow/e7deb882-6136-4a63-baff-b12da0fa0a03
   ```
   The `{token}` portion comes from your demo's existing URL (it's already in the address bar when you're on the flows site). Just replace the final path segment with the employee UUID. Press Enter.
7. You should land on the Employee Dashboard for the newly created employee — the Compensation card should show the empty state.

**Steps:**

1. Click the **Job and pay** tab
2. Verify the Compensation card shows the empty state: magnifying glass icon, "No compensation", "Compensation will appear here once added", and an **Add job** button in the card header (not "Edit")
3. Click **Add job**
4. The **"Add a job"** form opens with these fields:
   - **Job Title** — text input
   - **Start date** — date picker (this is the hire date; also becomes the effective date of the first compensation)
   - **Employee type** — FLSA dropdown (Salary/No overtime, Salary/Eligible for overtime, Paid by the hour, Owner's draw, Commission Only/No Overtime, Commission Only/Eligible for overtime)
   - **Compensation amount** — dollar amount
   - **Wage frequency** — defaults to "Hour"
5. Fill in all fields. Set the Start date to a **past date** (e.g., 01/01/2025) to create an immediately active job
6. Click **Save job**

**Expected:**

- Save succeeds; you are returned to the dashboard with a **"Job successfully added."** green banner at the top
- The Compensation card now shows the single-job detail view:
  - **Job title** — the title you entered
  - **Type** — the FLSA label (e.g., "Hourly/Overtime eligible" for Paid by the hour)
  - **Wage** — the rate you entered formatted with frequency (e.g., "$25.00 per hour")
  - **Effective date** — the Start date you entered (e.g., "January 1, 2025")
- An **Edit** button appears in the card header
- If the FLSA you chose is Nonexempt (Paid by the hour), an **Add another job** button appears in the card footer

> **Hire date = effective date for first job:** The Start date on this form is the hire date AND the effective date of the job's initial compensation. They are always the same on first creation.

---

## Task 0b — FLSA Classification Field Behavior (Add Job or Edit Compensation)

**Purpose:** The Employee type (FLSA) selection drives several conditional field behaviors. These apply whenever you're on the "Add a job" or "Edit compensation" form for a primary job. Run these checks while doing Task 0 or Task 2 — no separate setup needed, just try each FLSA option.

### Salary Exempt (Salary/No overtime) — wage threshold validation

1. Select **Edit** from the dashboard to edit the job you just entered
2. Select **Salary/No overtime** as Employee type
3. Enter a wage below **$35,568/year** (e.g., $30,000)
4. Select **Anually** as Wage frequency
5. Enter an **Effective date**
6. Attempt to save

**Expected:** Validation error on the Wage field: _"FLSA Exempt employees must meet salary threshold of $35,568.00/year"_. Form does not submit.

---

### Commission Only (either variant) — Rate and Wage frequency disabled

1. Select **Commission Only/No Overtime** or **Commission Only/Eligible for overtime**

**Expected:**

- The **Compensation amount** field becomes disabled (greyed out, not editable)
- The **Wage frequency** field becomes disabled
- Form can still be saved with the locked values

---

### Owner's Draw — Wage frequency disabled

1. Select **Owner's draw**

**Expected:**

- The **Wage frequency** field becomes disabled (rate remains editable)
- Compensation amount is still editable

---

### Nonexempt + tip-credit state — "Adjust for minimum wage" appears

> This field only appears when the employee's work location is in a state that supports tip credits. It will **not** appear for employees in AK, CA, MN, NV, OR, or WA.

**Setup — adding a NY work location and a new employee assigned to it:**

1. In the component picker dropdown, select **Company.Locations**
2. Click **Add location** and enter a New York address, e.g.:
   - Street: `123 Fake St`
   - City: `New York`
   - State: `New York`
   - Zip: `10012`
3. Save the location
4. Switch to **Employee.OnboardingFlow** and create a new employee (name + email)
5. On the first onboarding step (employee profile), set the **work address** to the NY address you just added, then submit the form
6. Copy the employee UUID from the `employee/created` console event (same method as Task 0 setup)
7. Navigate to `Employee.DashboardFlow` for that employee using the URL pattern from Task 0

With a NY work address confirmed, proceed to add a job (Task 0) so you're on the Add Job form.

1. Select **Paid by the hour** as Employee type
2. Check **"Adjust for minimum wage"** and select a minimum wage option from the dropdown that appears
3. Fill in the remaining required fields and click **Save**

**Expected:**

- The "Adjust for minimum wage" checkbox and Minimum wage dropdown appear when Paid by the hour is selected
- The job saves successfully with the minimum wage adjustment applied

---

### FLSA reclassification warning — primary job with secondary jobs

> Covered in depth in Task 11. Quick check here: while on the Edit compensation form for a primary Nonexempt job that has at least one secondary job, change Employee type to any non-Nonexempt value.

**Expected:** An inline warning appears: _"Scheduling this classification change will delete the employee's additional jobs when it goes into effect."_

---

## Task 1 — View the Compensation Card (Single Job, Current State)

**Setup**: You need an employee with an active job (hire date in the past, no pending badge). If you completed Task 0, reuse that employee — copy their UUID and navigate to `Employee.DashboardFlow` using the URL pattern from Task 0. Any FLSA classification works here.

**Steps:**

1. Click the **Job and pay** tab
2. Locate the **Compensation** card at the top of the page

**Expected:**

- The card header reads **"Compensation"** with an **Edit** button in the top right
- The card body shows four rows:
  - **Job title** — the job title text
  - **Type** — FLSA classification label (e.g., "Hourly/Overtime eligible", "Salary/No overtime")
  - **Wage** — formatted rate and frequency (e.g., "$25.00 per hour", "$80,000.00 per year")
  - **Effective date** — formatted as e.g. "January 1, 2025"
- The effective date shown is the current compensation's `effectiveDate` — this is when the _current pay rate_ took effect, **not** the employee's hire date (the two differ after any compensation adjustment)
- No pending change alert is visible
- No "Pending" badge is visible
- If the employee is Nonexempt (FLSA = Hourly/Overtime eligible), an **Add another job** button appears at the bottom of the card

> **Hire date vs. effective date:** The Compensation card shows when the current pay rate took effect. On initial job creation the effective date equals the hire date. After a pay adjustment, the effective date advances while the hire date stays fixed.

> **Empty state:** If the employee has no jobs at all, the Compensation card shows a magnifying glass icon with "No compensation — Compensation will appear here once added" and an **Add job** button in the card header (replacing the Edit button).

---

## Task 2 — Edit Compensation (Single Job, Schedule a Future Change)

**Setup**: Same employee as Task 1 (active job, no pending changes).

**Steps:**

1. On the **Job and pay** tab, click **Edit** in the Compensation card header
2. The **"Edit compensation"** form opens (page heading) pre-populated with the current comp values:
   - **Job title** — current comp's title
   - **Employee type** — current FLSA classification (e.g., "Paid by the hour")
   - **Wage** — current rate
   - **Wage frequency** — current unit (e.g., "Hourly")
3. Verify the **Effective date** field is visible and **empty** (`mm/dd/yyyy` placeholder — intentionally not pre-populated)
4. Change at least one field (e.g., increase the wage slightly)
5. Set the effective date to **at least tomorrow** (the minimum allowed date is tomorrow)
6. Click **Save**

**Expected:**

- Save succeeds; you are returned to the dashboard
- Console shows `EMPLOYEE_MANAGEMENT_COMPENSATION_EDIT_FORM_SUBMITTED`
- Back on the Compensation card, the **current comp values remain unchanged** (the change isn't live yet)
- A pending change alert now appears (orange warning icon): **"Compensation will change on [date you chose]."** with a **Cancel change** button
- The current comp details (Job title, Type, Wage, Effective date) remain visible below the alert

> **Why is the current comp unchanged?** This path has no pending comp, so Edit opens in create mode (POST), scheduling a new future-dated compensation. The existing comp doesn't change until that effective date arrives.

> **Effective date field is always empty:** Unlike the job title and wage which are pre-filled from the current comp, the effective date is intentionally blank — you must explicitly choose when the change takes effect.

> **Cancel vs. Back:** Clicking "Cancel" on the Edit form discards all unsaved changes and returns to the dashboard. No compensation is saved.

---

## Task 3 — Cancel a Pending Compensation Change (Single Job)

**Setup**: Complete Task 2 first so there is a pending change on the employee.

**Steps:**

1. On the Compensation card, verify the pending change alert shows: **"Compensation will change on [date]."** with a **Cancel change** button
2. Click **Cancel change** — no confirmation dialog appears; the API call fires immediately
3. The alert disappears

**Expected:**

- The pending change alert is removed immediately after the API responds
- The Compensation card returns to showing only the current (unchanged) comp values (Job title, Type, Wage, Effective date)
- Console shows `EMPLOYEE_MANAGEMENT_COMPENSATION_CARD_CHANGE_CANCELLED`
- The **Edit** button remains in the card header (no unintended state change)
- The **Add another job** button is still visible in the footer if applicable

---

## Task 4 — View a Future-Dated Job ("Pending" Badge)

**Setup:** You'll need an employee with a job that hasn't started yet. Options:

- **Single-job case** (primary job is future-dated): Follow the Task 0 setup to create a fresh employee, but use a **future** Start date (e.g., 01/01/2027) when adding the job. That employee's only comp will be future-dated, putting it in the `isNewJob: true` state.
- **Multi-job case** (active primary + future-dated secondary): Use an existing Nonexempt employee with an active job, then follow Task 7 to add a secondary job (secondary jobs are always future-dated when added).

**Steps:**

1. Navigate to `Employee.DashboardFlow` for the relevant employee
2. Click **Job & pay**

**Single-job case** (the only job is future-dated):

- Compensation card shows: job title, type, wage, and the future effective date
- A "Pending" badge (yellow) appears below those fields
- No yellow warning alert appears (the badge IS the status indicator — there is no "change" relative to a prior comp)
- **Edit** button is present in the card header

**Multi-job case** (at least one job is future-dated alongside an active job):

- The compensation table gains a **Status** column
- The future-dated job's row shows a "Pending" badge in the Status column
- The active job's row shows nothing in the Status column
- The "Pending" badge column only appears in the table when at least one job is in the pending-new state

> **Hire date vs. effective date (primary job):** When adding a primary job, the Start date you enter becomes both the hire date and the initial compensation's effective date — they're the same value. The card's "Effective date" row shows the comp's effective date. For secondary jobs, the hire date is automatically inherited from the primary and is not shown in the form; the Effective date you set is independent of it.

---

## Task 5 — Edit a Job with a Pending Compensation (Edit/PUT Mode)

---

### 5a — Primary new job (future hire date, no current comp)

**Setup:** Same future-dated primary job from Task 4 (hire date in the future, no current comp).

**Steps:**

1. Click **Edit** in the Compensation card header
2. The Edit Compensation form opens

**Expected form state:**

- Form heading reads **"Edit compensation"**
- A **Hire date** field is shown (not "Effective date") — pre-filled with the job's current hire date
- All other fields (job title, classification, wage, wage frequency) are pre-filled with the pending comp's values
- The hire date field has **no minimum or maximum restriction** — you can move it earlier or later

3. Change the hire date to a different future date (e.g., push it out one month)
4. Optionally change the wage
5. Click **Save**

**Expected save behavior:**

- Console shows `EMPLOYEE_MANAGEMENT_COMPENSATION_EDIT_FORM_SUBMITTED`
- You are returned to the dashboard
- The Compensation card still shows the "Pending" badge
- The displayed effective date reflects the new hire date
- Click Edit again — confirm the same hire date is shown (not a second comp stacked on top)

---

### 5b — Secondary new job (future hire date, no current comp)

**Setup:** An employee with an active primary job + a secondary job that was added with a future effective date (Task 7 with a future date). The secondary job should have no current comp.

**Steps:**

1. In the multi-job table, open the hamburger menu for the future-dated secondary job and click **Edit**
2. The Edit Compensation form opens

**Expected form state:**

- An **Effective date** field is shown (not "Hire date"), pre-filled with the secondary job's current future effective date
- The **minimum allowed effective date** is the later of: tomorrow, or the secondary job's hire date
- Other comp fields (classification, wage, frequency) are pre-filled

3. Change the effective date
4. Click **Save**

**Expected:**

- Console shows `EMPLOYEE_MANAGEMENT_COMPENSATION_EDIT_FORM_SUBMITTED`
- The secondary job still shows the "Pending" badge with the updated effective date
- No duplicate future comp created (click Edit again to confirm same comp)

---

### 5c — Existing active job with a scheduled pending change

**Setup:** An employee who has an active job with a future comp already scheduled (complete Task 2 first). The job has a current comp AND a future pending change.

**Steps:**

1. Click **Edit** in the Compensation card header (or the pending-change alert also links to edit)
2. The Edit Compensation form opens

**Expected form state:**

- An **Effective date** field is shown, pre-filled with the **pending comp's effective date**
- Wage and other fields are pre-filled with the pending comp's values
- Effective date minimum = tomorrow

3. Change the wage or effective date
4. Click **Save**

**Expected:**

- Console shows `EMPLOYEE_MANAGEMENT_COMPENSATION_EDIT_FORM_SUBMITTED`
- You are returned to the dashboard
- The pending-change alert updates to reflect the new values (same comp, not a new one)
- Click Edit once more to confirm the updated values are pre-filled (not the old ones)

---

## Task 7 — Add a Secondary Job (Multi-Job Scenario Setup)

**Purpose:** Set up the multi-job state needed for Tasks 8–11. Tests the "Add another job" button and form.

**Setup:** Use a Nonexempt employee (FLSA status = "Hourly/Overtime eligible"). The "Add another job" button only appears when the primary's current FLSA is Nonexempt and no future non-Nonexempt comp is scheduled on the primary.

**Steps:**

1. On the **Job and pay** tab, verify the **Add another job** button appears at the bottom of the Compensation card
2. Click **Add another job**
3. The **"Add another job"** form opens (page heading) with these fields:
   - **Job Title** — text field
   - **Compensation amount** — dollar amount (no FLSA/employee type field — secondary jobs inherit Nonexempt)
   - **Wage frequency** — defaults to "Hour"
   - **Effective date** — date picker (empty; this is the effective date of the secondary job's first compensation)
4. Fill in Job Title and Compensation amount, leave Wage frequency as "Hour"
5. Set the **Effective date** — minimum is tomorrow, or the primary job's hire date if that falls later
6. Click **Save job**

**Expected:**

- Save succeeds; you are returned to the dashboard with a **"Job successfully added."** green banner
- The Compensation card switches from the single-job detail view to a **table** layout
- The table shows both jobs with columns for the job and comp details
- The secondary job row has a delete action (hamburger menu → Delete); the primary row does NOT have a delete option
- The secondary row shows a "Pending" badge and a Status column appears in the table (secondary jobs are always added as pending)
- The "Add another job" button remains visible in the footer only if the Nonexempt + no-future-non-Nonexempt condition is still met

> **No Employee type field:** The "Add another job" form does not include an Employee type (FLSA) dropdown. Secondary jobs are always classified as Nonexempt (the primary job's FLSA governs secondary eligibility).

> **Effective date for secondary jobs:** The Effective date field sets when the secondary job's first compensation becomes active. The secondary job's hire date is automatically inherited from the primary (not shown in the form) and is independent of this value. The minimum allowed effective date is tomorrow, or the primary's hire date if that falls later.

---

## Task 8 — Multi-Job: Pending Change Alert (Single Update)

**Purpose:** When there is exactly one pending update-type change across all jobs, a single inline alert shows inside the Compensation card.

**Setup:** Have two or more jobs with the primary job active. Schedule a future comp change on the primary job (Task 2).

> **Note:** Scheduling a future comp change on a secondary job via the UI may trigger a known API bug ("title is required"). To avoid this, target the primary job for the pending change in this task. If you need a secondary job in an active state (effective date already passed), you may need to create it directly via the Gusto API rather than through the SDK UI.

**Expected state of the Compensation card:**

- Yellow warning alert appears **above the table**
- Alert label: "Compensation for [Job Title] will change on [date]."
- Alert body: bulleted list of the change details (e.g., "Pay will change to $X/hr")
- **Cancel change** button appears in the alert
- The table rows still show current comp values (no change yet)

**Steps:**

1. Click **Cancel change** in the alert
2. Confirm it reverts to no alert
3. Console shows `EMPLOYEE_MANAGEMENT_COMPENSATION_CARD_CHANGE_CANCELLED`

---

## Task 9 — Multi-Job: Multiple Pending Changes (Review Modal)

**Purpose:** When 2+ update-type pending changes exist across jobs, a summary alert replaces the inline alert and a modal lists all changes.

**Setup:** Have two or more jobs, each with a future-dated pending compensation change.

> **Note:** This state is difficult to reach through the SDK UI due to a known issue creating future effective dated secondary jobs (see [Slack thread](https://gustohq.slack.com/archives/C0ABG6Y4YJH/p1779381549278499)). The most reliable path is to create secondary jobs and seed their pending comp changes directly via the Gusto API, then load the employee in `Employee.DashboardFlow` to verify the display behavior described below.

**Expected state of the Compensation card:**

- A single summary alert appears (not per-job alerts): "There are multiple pending changes to [First Name]'s compensation."
- A **Review** button appears in the alert (not a "Cancel change" button directly in the alert)
- The table rows themselves show no individual badges for update-type changes (only "Pending" badge for new-job type)

**Steps:**

1. Click **Review**
2. The "Review pending changes" modal opens
3. The modal lists each pending change as a card with: job title, effective date, bulleted change details, and a **Cancel change** button
4. Cancel one of the changes from within the modal
5. The modal updates in place — the cancelled change's card is removed
6. If only one change remains, closing the modal and returning to the dashboard should now show the single-change inline alert (Task 8 behavior) rather than the summary

**Expected after cancellation of one:**

- If 1 update change remains: modal close → inline alert visible on the card
- If 0 update changes remain: no alert visible

---

## Task 10 — Delete a Secondary Job

**Setup:** At least two jobs exist (Task 7).

**Steps:**

1. In the jobs table, click the **hamburger menu** on the secondary job row
2. Select **Delete**
3. A confirmation dialog appears: "Delete job? [Job Title] will be permanently removed."
4. Click **Delete** in the dialog

**Expected:**

- The table reverts to the single-job detail card layout (if only one job remains)
- The deleted job's row is gone
- Console shows `EMPLOYEE_MANAGEMENT_COMPENSATION_CARD_JOB_DELETED`
- **Edit** button reappears in the Compensation card header (single-job mode)
- The "Add another job" footer button reappears if the primary is still Nonexempt

> Verify the **primary job** does NOT have a Delete option in its hamburger menu — only "Edit" should be available for the primary.

---

## Task 11 — FLSA Reclassification Warning (Secondary Jobs + Create Mode)

**Purpose:** When the primary is Nonexempt and you schedule a future comp change that changes the FLSA to non-Nonexempt, the SDK warns that secondary jobs will be deleted at the chosen effective date.

**Setup:** Employee has a primary Nonexempt job AND at least one secondary job (Task 7).

**Steps:**

1. Click **Edit** on the primary job
2. In the **Employee classification** dropdown, change from Nonexempt (Hourly/Overtime eligible) to any other option (e.g., Exempt)
3. Observe the yellow inline warning: "Scheduling this change will remove all secondary jobs when it takes effect."
4. Note that the **Effective date** field is still editable — you can pick any future date
5. Set an effective date (e.g., 3 months from now)
6. Save

**Expected:**

- Save succeeds
- On the dashboard, the primary job shows the pending-change alert for the FLSA change
- The secondary job's rows in the table are **still present** (they are not deleted yet — deletion happens server-side at the effective date, not now)

> **Why can you still pick the date?** In create mode, you're scheduling a future effective-dated compensation. The secondaries will be deleted by the API on that future date, not immediately. The effective date field stays editable so you can choose when the reclassification takes effect.

---

## Other Things to Check

Don't feel obligated to test all of these. These are suggestions for exploratory testing and edge cases.

- **Accessibility**: Tab through the Edit Compensation form using only the keyboard. Are all fields reachable? Is the effective date picker keyboard-navigable? Are focus states visible?
- **Copy validity**: Are there any missing translation strings (raw keys like `Employee.Dashboard.something`)? Any truncated text in the pending-change alert?
- **Error recovery**: If you submit the compensation form with a network error (try throttling in DevTools), does the error banner appear? Can you retry?
- **Loading states**: The Compensation card loads independently from the rest of the tab. Observe whether the skeleton/loading state appears before data arrives and disappears cleanly.
- **Wage formatting**: Try both hourly (per hour) and salaried (per year) employees. Does the rate format correctly in the card ("$25.00 / hr" vs. "$80,000 / yr")?
- **Long job titles**: Enter a very long job title. Does the table row or single-job card truncate gracefully without breaking layout?
- **Commission-only / Owner FLSA**: If possible, test an employee with Commission Only Nonexempt, Commission Only Exempt, or Owner classification. The wage and wage frequency fields should be locked/preset for these types.
- **Cancel from the Edit form**: Click Edit, make changes, then click Cancel. Verify no compensation was saved and the dashboard is unchanged.
- **Browser behavior**: Primary testing in Chrome. If time permits, try Firefox or Safari.
- **SDK events payload**: Expand `EMPLOYEE_COMPENSATION_UPDATED` in the console. Does the payload include the compensation UUID, rate, FLSA status, and effective date?

---

## Issues / Questions / Comments

| Type | Name | Description | Screenshots | Ticket |
| ---- | ---- | ----------- | ----------- | ------ |
|      |      |             |             |        |

---

_Thanks everyone for joining the test fest!_
