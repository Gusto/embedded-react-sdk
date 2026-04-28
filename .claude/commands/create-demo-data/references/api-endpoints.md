# Gusto Demo API Endpoints Reference

All requests use this URL pattern:

```
{GWS_FLOWS_HOST}/fe_sdk/{FLOW_TOKEN}/v1/{path}
```

All request bodies use **snake_case** field names. Set `Content-Type: application/json`.

---

## Employees

### Create Employee

```
POST /v1/companies/{company_id}/employees
```

| Field                | Type    | Required | Notes                               |
| -------------------- | ------- | -------- | ----------------------------------- |
| first_name           | string  | yes      |                                     |
| last_name            | string  | yes      |                                     |
| middle_initial       | string  | no       |                                     |
| email                | string  | no       | Required if self_onboarding is true |
| work_email           | string  | no       |                                     |
| date_of_birth        | string  | no       | Format: YYYY-MM-DD                  |
| ssn                  | string  | no       | Format: XXX-XX-XXXX                 |
| preferred_first_name | string  | no       |                                     |
| self_onboarding      | boolean | no       | If true, employee self-onboards     |

### Create Job for Employee

```
POST /v1/employees/{employee_id}/jobs
```

| Field       | Type   | Required | Notes              |
| ----------- | ------ | -------- | ------------------ |
| title       | string | yes      |                    |
| hire_date   | string | yes      | Format: YYYY-MM-DD |
| location_id | number | no       |                    |

### Terminate Employee

```
POST /v1/employees/{employee_id}/terminations
```

| Field                   | Type    | Required | Notes              |
| ----------------------- | ------- | -------- | ------------------ |
| effective_date          | string  | yes      | Format: YYYY-MM-DD |
| run_termination_payroll | boolean | no       |                    |

### Rehire Employee

```
POST /v1/employees/{employee_id}/rehire
```

| Field          | Type   | Required | Notes              |
| -------------- | ------ | -------- | ------------------ |
| effective_date | string | yes      | Format: YYYY-MM-DD |

### Create Home Address

```
POST /v1/employees/{employee_id}/home_addresses
```

| Field    | Type   | Required | Notes                 |
| -------- | ------ | -------- | --------------------- |
| street_1 | string | yes      |                       |
| street_2 | string | no       |                       |
| city     | string | yes      |                       |
| state    | string | yes      | Two-letter state code |
| zip      | string | yes      |                       |

### Create Bank Account (Employee)

```
POST /v1/employees/{employee_id}/bank_accounts
```

| Field          | Type   | Required | Notes                   |
| -------------- | ------ | -------- | ----------------------- |
| name           | string | yes      | Account label           |
| routing_number | string | yes      | 9 digits                |
| account_number | string | yes      |                         |
| account_type   | string | yes      | "Checking" or "Savings" |

---

## Contractors

### Create Contractor

```
POST /v1/companies/{company_uuid}/contractors
```

| Field                | Type    | Required | Notes                                                     |
| -------------------- | ------- | -------- | --------------------------------------------------------- |
| type                 | string  | yes      | "Individual" or "Business"                                |
| wage_type            | string  | yes      | "Hourly" or "Fixed"                                       |
| start_date           | string  | yes      | Format: YYYY-MM-DD                                        |
| first_name           | string  | yes\*    | Required for Individual, ignored for Business             |
| last_name            | string  | yes\*    | Required for Individual, ignored for Business             |
| middle_initial       | string  | no       | Individual only                                           |
| email                | string  | no       | Required if self_onboarding is true                       |
| hourly_rate          | string  | no       | Required if wage_type is "Hourly" (e.g., "50.00")         |
| self_onboarding      | boolean | no       | Recommended true so contractors get Gusto accounts        |
| file_new_hire_report | boolean | no       | Individual only                                           |
| work_state           | string  | no       | Two-letter code. Required if file_new_hire_report is true |
| ssn                  | string  | no       | Individual only, for 1099 filing                          |
| business_name        | string  | yes\*    | Required for Business type                                |
| ein                  | string  | no       | Business type only                                        |
| is_active            | boolean | no       |                                                           |

### Terminate Contractor

```
POST /v1/contractors/{contractor_uuid}/termination
```

| Field    | Type   | Required | Notes              |
| -------- | ------ | -------- | ------------------ |
| end_date | string | yes      | Format: YYYY-MM-DD |

### Rehire Contractor

```
POST /v1/contractors/{contractor_uuid}/rehire
```

| Field      | Type   | Required | Notes              |
| ---------- | ------ | -------- | ------------------ |
| start_date | string | yes      | Format: YYYY-MM-DD |

### Create Bank Account (Contractor)

```
POST /v1/contractors/{contractor_uuid}/bank_accounts
```

| Field          | Type   | Required | Notes                   |
| -------------- | ------ | -------- | ----------------------- |
| name           | string | yes      | Account label           |
| routing_number | string | yes      | 9 digits                |
| account_number | string | yes      |                         |
| account_type   | string | yes      | "Checking" or "Savings" |

---

## Time Off Policies

### Create Time Off Policy

```
POST /v1/companies/{company_uuid}/time_off_policies
```

| Field                       | Type    | Required | Notes                                                  |
| --------------------------- | ------- | -------- | ------------------------------------------------------ |
| name                        | string  | yes      | e.g., "Vacation", "Sick Leave"                         |
| policy_type                 | string  | yes      | "vacation" or "sick"                                   |
| accrual_method              | string  | yes      | See values below                                       |
| accrual_rate                | string  | no       | Float as string, e.g., "40.0"                          |
| accrual_rate_unit           | string  | no       | Hours per unit for hourly policies, e.g., "40.0"       |
| paid_out_on_termination     | boolean | no       |                                                        |
| accrual_waiting_period_days | number  | no       | Must be blank/null for unlimited; 0 for yearly methods |
| carryover_limit_hours       | string  | no       | Must be blank for unlimited                            |
| max_accrual_hours_per_year  | string  | no       | Must be blank for yearly/unlimited                     |
| max_hours                   | string  | no       | Must be blank for unlimited                            |
| policy_reset_date           | string  | no       | Format: MM-DD                                          |
| complete                    | boolean | no       | Mark policy as fully configured                        |

**Accrual methods:**

- `unlimited` — no accrual tracking
- `per_pay_period` — accrues each pay period
- `per_calendar_year` — fixed annual accrual, resets on policy_reset_date
- `per_anniversary_year` — fixed annual accrual, resets on hire date
- `per_hour_worked` — accrues based on hours worked (including overtime)
- `per_hour_worked_no_overtime` — accrues based on hours worked (excluding overtime)
- `per_hour_paid` — accrues based on hours paid (including overtime)
- `per_hour_paid_no_overtime` — accrues based on hours paid (excluding overtime)

---

## Company

### Create Location

```
POST /v1/companies/{company_id}/locations
```

| Field        | Type   | Required | Notes                 |
| ------------ | ------ | -------- | --------------------- |
| street_1     | string | yes      |                       |
| street_2     | string | no       |                       |
| city         | string | yes      |                       |
| state        | string | yes      | Two-letter state code |
| zip          | string | yes      |                       |
| phone_number | string | no       |                       |

### Create Earning Type

```
POST /v1/companies/{company_id}/earning_types
```

| Field               | Type    | Required | Notes |
| ------------------- | ------- | -------- | ----- |
| name                | string  | yes      |       |
| include_in_overtime | boolean | no       |       |

---

## Payroll

### Create Pay Schedule

```
POST /v1/companies/{company_id}/pay_schedules
```

| Field                    | Type   | Required | Notes                                                          |
| ------------------------ | ------ | -------- | -------------------------------------------------------------- |
| frequency                | string | yes      | "Every week", "Every other week", "Twice per month", "Monthly" |
| anchor_pay_date          | string | yes      | Format: YYYY-MM-DD                                             |
| anchor_end_of_pay_period | string | yes      | Format: YYYY-MM-DD                                             |
| day_1                    | number | no       | For "Twice per month" — first pay day (1-31)                   |
| day_2                    | number | no       | For "Twice per month" — second pay day (1-31)                  |

### Create Contractor Payment

```
POST /v1/companies/{company_id}/contractor_payments
```

| Field           | Type   | Required | Notes                       |
| --------------- | ------ | -------- | --------------------------- |
| contractor_uuid | string | yes      |                             |
| date            | string | yes      | Format: YYYY-MM-DD          |
| payment_method  | string | yes      | "Direct Deposit" or "Check" |
| wage            | number | no       |                             |
| hours           | number | no       |                             |
| bonus           | number | no       |                             |
| reimbursement   | number | no       |                             |

---

## Listing Entities (GET)

Use these to discover existing records before creating new ones:

```
GET /v1/companies/{company_id}/employees
GET /v1/companies/{company_id}/contractors
GET /v1/companies/{company_id}/payrolls
GET /v1/companies/{company_id}/locations
GET /v1/companies/{company_id}/pay_schedules
GET /v1/companies/{company_uuid}/time_off_policies
GET /v1/companies/{company_id}/earning_types
GET /v1/companies/{company_id}/forms
```

---

## Notes

- The `company_id` / `company_uuid` comes from the `VITE_COMPANY_ID` env var
- Some endpoints use `company_id` and some use `company_uuid` — in practice they accept the same UUID
- Responses include a `uuid` field on the created entity — capture this for follow-up operations
- If a POST returns 422, the response body contains validation error details
- The demo environment resets periodically; tokens expire and need re-provisioning via `npm run sdk-app:setup`
