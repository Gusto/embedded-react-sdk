# Time Off PR Verification Results

**Date:** 2026-03-25
**Branch tested:** `kw/test/sdk-698-700-combined` (cherry-pick of SDK-698 + SDK-700 onto ZenPayroll main)
**Company UUID:** `782586e2-7ca6-4139-9a3c-9ac1eec7e772`
**Employee UUID:** `3e928ff7-ab26-4281-9440-2cdd76b5bb80`
**API version:** `2025-06-15`

---

## SDK-700: OAuth Scopes — VERIFIED

**PR:** [zenpayroll#326015](https://github.com/Gusto/zenpayroll/pull/326015)

All five scopes (`time_off_policies:read`, `time_off_policies:write`, `holiday_pay_policies:read`, `holiday_pay_policies:write`, `employee_time_off_activities:read`) are now included in `REACT_SDK_DEMO` flow tokens via the `TIME_OFF_MANAGEMENT` scope group.

| Endpoint                                                              | HTTP Status | Result                                    |
| --------------------------------------------------------------------- | ----------- | ----------------------------------------- |
| `GET /v1/companies/{uuid}/time_off_policies`                          | **200**     | 11 policies returned                      |
| `GET /v1/companies/{uuid}/holiday_pay_policy`                         | **204**     | No policy exists for this company (valid) |
| `GET /v1/employees/{uuid}/time_off_activities?time_off_type=vacation` | **200**     | Empty array (valid, no activities exist)  |

No `missing_oauth_scopes` errors on any endpoint.

---

## SDK-698: Time-Off-Activity Nullable Fields — VERIFIED (partial)

**PR:** [zenpayroll#326016](https://github.com/Gusto/zenpayroll/pull/326016)

### TimeOffPolicy field validation (live API, 11 policies)

| Field                         | Values observed | Null count | Type                     |
| ----------------------------- | --------------- | ---------- | ------------------------ |
| `paid_out_on_termination`     | `true`, `false` | 0/11       | bool (never null)        |
| `complete`                    | `true`          | 0/11       | bool (never null)        |
| `accrual_waiting_period_days` | `null`          | 11/11      | always null in test data |
| `carryover_limit_hours`       | `null`          | 11/11      | always null in test data |
| `max_accrual_hours_per_year`  | `null`          | 11/11      | always null in test data |
| `accrual_rate`                | `"1.0"`         | 0/11       | string                   |
| `version`                     | hash strings    | 0/11       | string                   |

`paid_out_on_termination` and `complete` are confirmed always boolean — SDK-698 correctly does NOT modify these fields. The nullable fields (`accrual_waiting_period_days`, `carryover_limit_hours`, `max_accrual_hours_per_year`) already have `z.nullable()` in the existing schema.

### TimeOffActivity field validation — NOT TESTABLE

The test employee has zero time off activities across all 10 valid policy types (`vacation`, `sick`, `bereavement`, `floating_holiday`, `jury_duty`, `learning_and_development`, `personal_day`, `volunteer`, `weather`, `parental_leave`). The SDK-698 schema changes (making `policy_uuid`, `policy_name`, `event_description`, `effective_time`, `balance`, `balance_change` nullable) were validated via ZenPayroll source code analysis:

- **GraphQL query builder** (`packs/.../queries/employees/time_off_activities/query.rb`): builds rows with `policy = entry['policy'] || {}`, so `policy['id']` and `policy['name']` are `nil` when no policy exists
- **RABL template** (`app/views/api/v1/employee_time_off_activities/index.json.rabl`): `formatted_timestamp` returns `nil` for nil input
- **GraphQL upstream**: `balanceHours` and `balanceHoursChange` can be null

---

## Bonus Finding: PolicyType Enum Gap

The real API returns **11 distinct `policy_type` values**, but the OpenAPI schema enum only defines `vacation` and `sick`. This will cause Zod validation failures for 9 of 11 policy types.

| API value                  | In schema enum? |
| -------------------------- | --------------- |
| `vacation`                 | Yes             |
| `sick`                     | Yes             |
| `bereavement`              | No              |
| `custom`                   | No              |
| `floating_holiday`         | No              |
| `jury_duty`                | No              |
| `learning_and_development` | No              |
| `parental_leave`           | No              |
| `personal_day`             | No              |
| `volunteer`                | No              |
| `weather`                  | No              |

This is a separate issue from SDK-698 and should be addressed in `schemas.yml.erb` by extending the `policy_type` enum or converting it to a plain string.
