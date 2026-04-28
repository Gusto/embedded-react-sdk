---
name: create-demo-data
description: Create test data (employees, contractors, time off policies, etc.) in the Gusto demo environment via API. Use this skill whenever the user wants to create, add, or seed records for their current demo company — even if they just say "add an employee" or "I need a contractor to test with". Also triggers for requests like "set up test data", "create some records", or "I need a company with X".
---

# Create Demo Data

Create records in the current Gusto demo company by making API calls directly to the GWS Flows demo environment. This is for testing the SDK against realistic data states without needing ZenPayroll running locally.

The demo company is always pre-provisioned — this skill only creates entities within the existing company.

## Step 1 — Load environment

Read the env file at `sdk-app/env/.env.demo` and extract:

- `GWS_FLOWS_HOST` — the base URL (should be `https://flows.gusto-demo.com`)
- `FLOW_TOKEN` — auth token embedded in URL path
- `VITE_COMPANY_ID` — the current demo company UUID

If the file doesn't exist or is empty, tell the user to run `npm run sdk-app` first to provision a demo company.

Construct the base URL for all API calls:

```
{GWS_FLOWS_HOST}/fe_sdk/{FLOW_TOKEN}
```

## Step 2 — Understand what the user wants

Ask the user what entity they want to create. Supported entity types:

| Entity             | Clarifying questions to ask                                    |
| ------------------ | -------------------------------------------------------------- |
| Employee           | Self-onboarding or admin-entered? Any specific name/email?     |
| Contractor         | Individual or Business? Hourly or Fixed wage? Self-onboarding? |
| Time off policy    | Vacation or sick? What accrual method?                         |
| Location           | What address?                                                  |
| Pay schedule       | What frequency?                                                |
| Contractor payment | Which contractor? Amount?                                      |

For each entity type, ask only the questions that meaningfully change the outcome. Use sensible defaults for everything else:

- Names: generate realistic fake names (e.g., "Sarah Chen", "Marcus Rivera")
- Emails: use `{first}.{last}-{random4digits}@example.com`
- Dates: use today's date for start dates
- Addresses: use `123 Main St, San Francisco, CA 94105`
- Wage rates: use `"50.00"` for hourly contractors

If the user gives a vague request like "add an employee", create one with reasonable defaults and report what was created. Don't over-ask.

## Step 3 — Verify connectivity

Before the first API call, verify the token is still valid:

```bash
curl -s -o /dev/null -w '%{http_code}' '{base_url}/v1/companies/{company_id}/employees'
```

If this returns anything other than 200, tell the user their token has likely expired and suggest running `npm run sdk-app:setup` to re-provision.

## Step 4 — Make the API call

Read `references/api-endpoints.md` for the exact endpoint, method, and request body schema for the entity type.

Use curl with:

- `Content-Type: application/json`
- The constructed base URL from Step 1
- Snake_case field names in the JSON body

Example:

```bash
curl -s -X POST '{base_url}/v1/companies/{company_id}/employees' \
  -H 'Content-Type: application/json' \
  -d '{
    "first_name": "Sarah",
    "last_name": "Chen",
    "email": "sarah.chen-4821@example.com",
    "self_onboarding": false
  }'
```

Capture the full response. On success (2xx), extract the `uuid` from the response.

On failure (4xx), read the error response body and:

- If 422: show the validation errors and ask the user how to fix
- If 401/403: token is likely expired, suggest re-provisioning
- If 404: endpoint may not be available in demo, explain this

## Step 5 — Report results

After a successful creation, report:

- Entity type and key identifiers (name, UUID)
- Any useful details from the response (status, onboarding state)
- If the user might want to do follow-up operations (e.g., "Want me to also add a home address and bank account for this employee?")

## Step 6 — Batch creation

If the user asks for multiple records (e.g., "create 3 employees"), create them sequentially and report a summary table at the end.

If the user asks for a specific state (e.g., "employee with missing bank info"), create the employee but skip the optional setup steps that would complete that state.

## Handling common scenarios

These map user requests to the specific data states needed to test each SDK flow.

### Employee Onboarding Flow (admin-led)

The Employee Onboarding Flow (`src/components/Employee/OnboardingFlow/`) walks an admin through setting up a new employee: profile → compensation → taxes → payment method → deductions → documents → summary.

**"I need to test admin employee onboarding"**
→ Create an employee with `self_onboarding: false` and minimal fields (first_name, last_name). This gives an employee in `admin_onboarding_incomplete` status — the earliest state where the admin fills in everything.

**"I need an employee partway through onboarding"**
→ Create the employee with `self_onboarding: false`, then add a home address and job to simulate partial completion. The flow uses smart guards to detect which steps are already done.

**"I need a fully onboarded employee"**
→ Create the employee with all fields populated (name, email, DOB, SSN), then create a home address, bank account, and job. This puts them in `onboarding_completed` status.

### Employee Self-Onboarding Flow

The Self-Onboarding Flow (`src/components/Employee/SelfOnboardingFlow/`) is the employee-facing experience: profile → taxes → payment method → documents → summary.

**"I need to test employee self-onboarding"**
→ Create an employee with `self_onboarding: true` and an email address. This puts them in `self_onboarding_pending_invite` status initially, which transitions to `self_onboarding_invited` once the invite is sent — the entry point for the self-onboarding flow.

**"I need a self-onboarding employee who started but hasn't finished"**
→ This status (`self_onboarding_invited_started`) is set by the backend when the employee begins. Create with `self_onboarding: true` — the user can advance the state by partially completing the flow in the SDK.

### Contractor Onboarding Flow

The Contractor Onboarding Flow (`src/components/Contractor/OnboardingFlow/`) walks through: profile → address → payment method → new hire report → submit. If self-onboarding, the address step is skipped.

**"I need to test contractor onboarding"**
→ Create an Individual contractor with `self_onboarding: false`, `wage_type: "Hourly"`, `hourly_rate: "50.00"`, and a start_date of today. This gives `admin_onboarding_incomplete` status.

**"I need a self-onboarding contractor"**
→ Create with `self_onboarding: true` and an email. The flow skips the address step and goes profile → payment → new hire report → submit.

**"I need a contractor who finished onboarding"**
→ Create with all fields: name, email, SSN, work_state, wage details. Add a bank account afterward. This results in `onboarding_completed` status.

**"I need a Business-type contractor"**
→ Create with `type: "Business"`, `business_name`, and optionally `ein`. Individual-only fields (first_name, last_name, ssn) are ignored.

### Contractor Payment Flow

The Contractor Payment Flow (`src/components/Contractor/Payments/PaymentFlow/`) manages creating payments, viewing history, and handling RFIs.

**"I need to test contractor payments"**
→ First ensure an onboarded contractor exists (create one if needed). Then create a contractor payment with a date, amount, and payment method.

### Contractor Profile Management

The Contractor Profile Management flow (`sdk-app/src/design/prototypes/contractor-management/`) allows viewing and editing an existing contractor's details: address, payment method, basic info, and compensation.

**"I need to test contractor profile editing"**
→ Create a fully onboarded contractor (all fields populated + bank account). The profile flow expects an existing contractor with data to display and edit.

### Time Off Policies

**"Set up a time off policy"**
→ Ask: vacation or sick? Then ask about accrual method. Default to `unlimited` if they don't have a preference. Set `complete: true` to mark it as fully configured.

**"I need a PTO policy with accrual"**
→ Create with `policy_type: "vacation"`, `accrual_method: "per_pay_period"`, `accrual_rate: "3.08"` (80 hours/year ÷ 26 pay periods). Set reasonable limits like `max_hours: "160.0"` and `carryover_limit_hours: "40.0"`.

**"I need an unlimited PTO policy"**
→ Create with `accrual_method: "unlimited"`. Leave accrual_rate, max_hours, carryover_limit_hours, max_accrual_hours_per_year, AND accrual_waiting_period_days all blank/absent (they must be null or omitted for unlimited — the API rejects even `0` for these fields).

### Entity lists

**"I need to test the employee list"**
→ The Employee Onboarding Flow starts with an employee list (Index state). Create several employees in different onboarding states so the list shows variety. Include at least one `admin_onboarding_incomplete` (self_onboarding: false), one `self_onboarding_pending_invite` (self_onboarding: true + email), and one fully onboarded.

**"I need to test the contractor list"**
→ Same approach: create contractors in different states. Include at least one admin-onboarding incomplete, one self-onboarding invited, and one fully onboarded.

### Mixed scenarios

**"I need a company with a mix of employees and contractors"**
→ Create 2-3 employees in different states (one admin-onboarding, one self-onboarding, one fully onboarded) and 1-2 contractors (one Individual hourly, one fully onboarded). Report all UUIDs in a summary table.
