---
title: Events
sidebar_position: 3
---

The SDK uses a unified event system to communicate user interactions, API responses, and step completions to your application.

## How events work

Every SDK component accepts an `onEvent` callback:

```typescript
(eventType: EventType, data?: unknown) => void
```

- `eventType` is a string constant identifying the event
- `data` is an optional payload, typically the API response associated with the action (e.g., the created employee object)

## Using events

Import `componentEvents` for type-safe event constants:

```tsx
import { Employee, GustoProvider, componentEvents } from '@gusto/embedded-react-sdk'

function App({ companyId, employeeId }) {
  const handleEvent = (eventType, data) => {
    if (eventType === componentEvents.EMPLOYEE_CREATED) {
      const newEmployeeId = data.uuid
      analytics.track('employee_created', { employeeId: newEmployeeId })
    }

    if (eventType === componentEvents.EMPLOYEE_PROFILE_DONE) {
      router.push('/next-step')
    }
  }

  return (
    <GustoProvider config={{ baseUrl: '/api/gusto/' }}>
      <Employee.Profile companyId={companyId} employeeId={employeeId} onEvent={handleEvent} />
    </GustoProvider>
  )
}
```

## Common patterns

**Navigation** — Listen for `*_DONE` events to know when a step is complete and navigate to the next step.

**Analytics** — Track `*_CREATED`, `*_UPDATED`, and `*_DELETED` events to measure user progress.

**Side effects** — Trigger actions in your application when specific events fire (e.g., refresh a list after an employee is created).

**Cancellation** — Listen for the `CANCEL` event to handle user-initiated cancellation.

## Event types reference

All events emitted by SDK components are listed below. Import `componentEvents` and use the Key as the property name.

| Key                                            | Value                                           |
| ---------------------------------------------- | ----------------------------------------------- |
| `BREADCRUMB_NAVIGATE`                          | `breadcrumb/navigate`                           |
| `CANCEL`                                       | `CANCEL`                                        |
| `COMPANY_ASSIGN_SIGNATORY_DONE`                | `company/signatory/assignSignatory/done`        |
| `COMPANY_ASSIGN_SIGNATORY_MODE_UPDATED`        | `company/signatory/assignSignatory/modeUpdated` |
| `COMPANY_BANK_ACCOUNT_CANCEL`                  | `company/bankAccount/cancel`                    |
| `COMPANY_BANK_ACCOUNT_CHANGE`                  | `company/bankAccount/change`                    |
| `COMPANY_BANK_ACCOUNT_CREATED`                 | `company/bankAccount/created`                   |
| `COMPANY_BANK_ACCOUNT_DONE`                    | `company/bankAccount/done`                      |
| `COMPANY_BANK_ACCOUNT_VERIFIED`                | `company/bankAccount/verified`                  |
| `COMPANY_BANK_ACCOUNT_VERIFY`                  | `company/bankAccount/verify`                    |
| `COMPANY_CREATE_SIGNATORY_DONE`                | `company/signatory/createSignatory/done`        |
| `COMPANY_FEDERAL_TAXES_DONE`                   | `company/federalTaxes/done`                     |
| `COMPANY_FEDERAL_TAXES_UPDATED`                | `company/federalTaxes/updated`                  |
| `COMPANY_FORM_EDIT_SIGNATORY`                  | `company/forms/editSignatory`                   |
| `COMPANY_FORMS_DONE`                           | `company/forms/done`                            |
| `COMPANY_INDUSTRY`                             | `company/industry`                              |
| `COMPANY_INDUSTRY_SELECTED`                    | `company/industry/selected`                     |
| `COMPANY_INVITE_SIGNATORY_DONE`                | `company/signatory/inviteSignatory/done`        |
| `COMPANY_LOCATION_CREATE`                      | `company/location/add`                          |
| `COMPANY_LOCATION_CREATED`                     | `company/location/add/done`                     |
| `COMPANY_LOCATION_DONE`                        | `company/location/done`                         |
| `COMPANY_LOCATION_EDIT`                        | `company/location/edit`                         |
| `COMPANY_LOCATION_UPDATED`                     | `company/location/edit/done`                    |
| `COMPANY_OVERVIEW_CONTINUE`                    | `company/overview/continue`                     |
| `COMPANY_OVERVIEW_DONE`                        | `company/overview/done`                         |
| `COMPANY_SIGN_FORM`                            | `company/forms/sign/signForm`                   |
| `COMPANY_SIGN_FORM_BACK`                       | `company/forms/sign/back`                       |
| `COMPANY_SIGN_FORM_DONE`                       | `company/forms/sign/done`                       |
| `COMPANY_SIGNATORY_CREATED`                    | `company/signatory/created`                     |
| `COMPANY_SIGNATORY_INVITED`                    | `company/signatory/invited`                     |
| `COMPANY_SIGNATORY_UPDATED`                    | `company/signatory/updated`                     |
| `COMPANY_STATE_TAX_DONE`                       | `company/stateTaxes/done`                       |
| `COMPANY_STATE_TAX_EDIT`                       | `company/stateTaxes/edit`                       |
| `COMPANY_STATE_TAX_UPDATED`                    | `company/stateTaxes/updated`                    |
| `COMPANY_VIEW_FORM_TO_SIGN`                    | `company/forms/view`                            |
| `CONTRACTOR_ADDRESS_DONE`                      | `contractor/address/done`                       |
| `CONTRACTOR_ADDRESS_UPDATED`                   | `contractor/address/updated`                    |
| `CONTRACTOR_BANK_ACCOUNT_CREATED`              | `contractor/bankAccount/created`                |
| `CONTRACTOR_CREATE`                            | `contractor/create`                             |
| `CONTRACTOR_CREATED`                           | `contractor/created`                            |
| `CONTRACTOR_DELETED`                           | `contractor/deleted`                            |
| `CONTRACTOR_INVITE_CONTRACTOR`                 | `contractor/invite/selfOnboarding`              |
| `CONTRACTOR_NEW_HIRE_REPORT_DONE`              | `contractor/newHireReport/done`                 |
| `CONTRACTOR_NEW_HIRE_REPORT_UPDATED`           | `contractor/newHireReport/updated`              |
| `CONTRACTOR_ONBOARDING_CONTINUE`               | `contractor/onboarding/continue`                |
| `CONTRACTOR_ONBOARDING_STATUS_UPDATED`         | `contractor/onboardingStatus/updated`           |
| `CONTRACTOR_PAYMENT_BACK_TO_EDIT`              | `contractor/payments/backToEdit`                |
| `CONTRACTOR_PAYMENT_CANCEL`                    | `contractor/payments/cancel`                    |
| `CONTRACTOR_PAYMENT_CREATE`                    | `contractor/payments/create`                    |
| `CONTRACTOR_PAYMENT_CREATED`                   | `contractor/payments/created`                   |
| `CONTRACTOR_PAYMENT_EDIT`                      | `contractor/payments/edit`                      |
| `CONTRACTOR_PAYMENT_EXIT`                      | `contractor/payments/exit`                      |
| `CONTRACTOR_PAYMENT_METHOD_DONE`               | `contractor/paymentMethod/done`                 |
| `CONTRACTOR_PAYMENT_METHOD_UPDATED`            | `contractor/paymentMethod/updated`              |
| `CONTRACTOR_PAYMENT_PREVIEW`                   | `contractor/payments/preview`                   |
| `CONTRACTOR_PAYMENT_RFI_RESPOND`               | `contractor/payments/rfi/respond`               |
| `CONTRACTOR_PAYMENT_SUBMIT`                    | `contractor/payments/submit`                    |
| `CONTRACTOR_PAYMENT_UPDATE`                    | `contractor/payments/update`                    |
| `CONTRACTOR_PAYMENT_VIEW`                      | `contractor/payments/view`                      |
| `CONTRACTOR_PAYMENT_VIEW_DETAILS`              | `contractor/payments/view/details`              |
| `CONTRACTOR_PROFILE_DONE`                      | `contractor/profile/done`                       |
| `CONTRACTOR_SUBMIT_DONE`                       | `contractor/submit/done`                        |
| `CONTRACTOR_UPDATE`                            | `contractor/update`                             |
| `CONTRACTOR_UPDATED`                           | `contractor/updated`                            |
| `DISMISSAL_PAY_PERIOD_SELECTED`                | `dismissal/payPeriod/selected`                  |
| `EMPLOYEE_BANK_ACCOUNT_CREATE`                 | `employee/bankAccount/create`                   |
| `EMPLOYEE_BANK_ACCOUNT_CREATED`                | `employee/bankAccount/created`                  |
| `EMPLOYEE_BANK_ACCOUNT_DELETED`                | `employee/bankAccount/deleted`                  |
| `EMPLOYEE_CHANGE_ELIGIBILITY_STATUS`           | `employee/employmentEligibility/change`         |
| `EMPLOYEE_COMPENSATION_CREATE`                 | `employee/compensations/create`                 |
| `EMPLOYEE_COMPENSATION_CREATED`                | `employee/compensations/created`                |
| `EMPLOYEE_COMPENSATION_DONE`                   | `employee/compensations/done`                   |
| `EMPLOYEE_COMPENSATION_UPDATED`                | `employee/compensations/updated`                |
| `EMPLOYEE_CREATE`                              | `employee/create`                               |
| `EMPLOYEE_CREATED`                             | `employee/created`                              |
| `EMPLOYEE_DEDUCTION_ADD`                       | `employee/deductions/add`                       |
| `EMPLOYEE_DEDUCTION_CANCEL`                    | `employee/deductions/cancel`                    |
| `EMPLOYEE_DEDUCTION_CANCEL_EMPTY`              | `employee/deductions/cancelEmpty`               |
| `EMPLOYEE_DEDUCTION_CREATED`                   | `employee/deductions/created`                   |
| `EMPLOYEE_DEDUCTION_DELETED`                   | `employee/deductions/deleted`                   |
| `EMPLOYEE_DEDUCTION_DELETED_EMPTY`             | `employee/deductions/deletedEmpty`              |
| `EMPLOYEE_DEDUCTION_DONE`                      | `employee/deductions/done`                      |
| `EMPLOYEE_DEDUCTION_EDIT`                      | `employee/deductions/edit`                      |
| `EMPLOYEE_DEDUCTION_INCLUDE_NO`                | `employee/deductions/include/no`                |
| `EMPLOYEE_DEDUCTION_INCLUDE_YES`               | `employee/deductions/include/yes`               |
| `EMPLOYEE_DEDUCTION_UPDATED`                   | `employee/deductions/updated`                   |
| `EMPLOYEE_DELETED`                             | `employee/deleted`                              |
| `EMPLOYEE_DISMISS`                             | `employee/dismiss`                              |
| `EMPLOYEE_DOCUMENTS_DONE`                      | `employee/documents/done`                       |
| `EMPLOYEE_EMPLOYMENT_ELIGIBILITY_DONE`         | `employee/employmentEligibility/done`           |
| `EMPLOYEE_FEDERAL_TAXES_DONE`                  | `employee/federalTaxes/done`                    |
| `EMPLOYEE_FEDERAL_TAXES_UPDATED`               | `employee/federalTaxes/updated`                 |
| `EMPLOYEE_FORMS_DONE`                          | `employee/forms/done`                           |
| `EMPLOYEE_HOME_ADDRESS`                        | `employee/addresses/home`                       |
| `EMPLOYEE_HOME_ADDRESS_CREATED`                | `employee/addresses/home/created`               |
| `EMPLOYEE_HOME_ADDRESS_UPDATED`                | `employee/addresses/home/updated`               |
| `EMPLOYEE_JOB_CREATED`                         | `employee/job/created`                          |
| `EMPLOYEE_JOB_DELETED`                         | `employee/job/deleted`                          |
| `EMPLOYEE_JOB_UPDATED`                         | `employee/job/updated`                          |
| `EMPLOYEE_ONBOARDING_DOCUMENTS_CONFIG_UPDATED` | `employee/onboardingDocumentsConfig/updated`    |
| `EMPLOYEE_ONBOARDING_DONE`                     | `employee/onboarding/done`                      |
| `EMPLOYEE_ONBOARDING_STATUS_UPDATED`           | `employee/onboardingStatus/updated`             |
| `EMPLOYEE_PAYMENT_METHOD_DONE`                 | `employee/paymentMethod/done`                   |
| `EMPLOYEE_PAYMENT_METHOD_UPDATED`              | `employee/paymentMethod/updated`                |
| `EMPLOYEE_PROFILE_DONE`                        | `employee/profile/done`                         |
| `EMPLOYEE_REHIRE`                              | `employee/rehire`                               |
| `EMPLOYEE_SELF_ONBOARDING_START`               | `employee/selfOnboarding/start`                 |
| `EMPLOYEE_SIGN_FORM`                           | `employee/forms/sign`                           |
| `EMPLOYEE_SPLIT_PAYCHECK`                      | `employee/bankAccount/split`                    |
| `EMPLOYEE_SPLIT_PAYMENT`                       | `employee/paymentMethod/split`                  |
| `EMPLOYEE_STATE_TAXES_DONE`                    | `employee/stateTaxes/done`                      |
| `EMPLOYEE_STATE_TAXES_UPDATED`                 | `employee/stateTaxes/updated`                   |
| `EMPLOYEE_SUMMARY_VIEW`                        | `employee/summary`                              |
| `EMPLOYEE_TAXES_DONE`                          | `employee/taxes/done`                           |
| `EMPLOYEE_TERMINATION_CANCELLED`               | `employee/termination/cancelled`                |
| `EMPLOYEE_TERMINATION_CREATED`                 | `employee/termination/created`                  |
| `EMPLOYEE_TERMINATION_DONE`                    | `employee/termination/done`                     |
| `EMPLOYEE_TERMINATION_EDIT`                    | `employee/termination/edit`                     |
| `EMPLOYEE_TERMINATION_PAYROLL_CREATED`         | `employee/termination/payroll/created`          |
| `EMPLOYEE_TERMINATION_PAYROLL_FAILED`          | `employee/termination/payroll/failed`           |
| `EMPLOYEE_TERMINATION_RUN_OFF_CYCLE_PAYROLL`   | `employee/termination/runOffCyclePayroll`       |
| `EMPLOYEE_TERMINATION_RUN_PAYROLL`             | `employee/termination/runPayroll`               |
| `EMPLOYEE_TERMINATION_UPDATED`                 | `employee/termination/updated`                  |
| `EMPLOYEE_TERMINATION_VIEW_SUMMARY`            | `employee/termination/viewSummary`              |
| `EMPLOYEE_UPDATE`                              | `employee/update`                               |
| `EMPLOYEE_UPDATED`                             | `employee/updated`                              |
| `EMPLOYEE_VIEW_FORM_TO_SIGN`                   | `employee/forms/view`                           |
| `EMPLOYEE_WORK_ADDRESS`                        | `employee/addresses/work`                       |
| `EMPLOYEE_WORK_ADDRESS_CREATED`                | `employee/addresses/work/created`               |
| `EMPLOYEE_WORK_ADDRESS_UPDATED`                | `employee/addresses/work/updated`               |
| `EMPLOYEES_LIST`                               | `company/employees`                             |
| `ERROR`                                        | `ERROR`                                         |
| `INFORMATION_REQUEST_FORM_CANCEL`              | `informationRequest/form/cancel`                |
| `INFORMATION_REQUEST_FORM_DONE`                | `informationRequest/form/done`                  |
| `INFORMATION_REQUEST_FORM_SUBMIT`              | `informationRequest/form/submit`                |
| `INFORMATION_REQUEST_RESPOND`                  | `informationRequest/respond`                    |
| `OFF_CYCLE_CREATED`                            | `offCycle/created`                              |
| `OFF_CYCLE_DEDUCTIONS_CHANGE`                  | `offCycle/deductionsChange`                     |
| `OFF_CYCLE_SELECT_REASON`                      | `offCycle/selectReason`                         |
| `PAY_SCHEDULE_CREATE`                          | `paySchedule/create`                            |
| `PAY_SCHEDULE_CREATED`                         | `paySchedule/created`                           |
| `PAY_SCHEDULE_DELETE`                          | `paySchedule/delete`                            |
| `PAY_SCHEDULE_DELETED`                         | `paySchedule/deleted`                           |
| `PAY_SCHEDULE_DONE`                            | `paySchedule/done`                              |
| `PAY_SCHEDULE_UPDATE`                          | `paySchedule/update`                            |
| `PAY_SCHEDULE_UPDATED`                         | `paySchedule/updated`                           |
| `PAYROLL_DELETED`                              | `payroll/deleted`                               |
| `PAYROLL_EXIT_FLOW`                            | `payroll/saveAndExit`                           |
| `PAYROLL_SKIPPED`                              | `payroll/skipped`                               |
| `PAYROLL_WIRE_FORM_CANCEL`                     | `payroll/wire/form/cancel`                      |
| `PAYROLL_WIRE_FORM_DONE`                       | `payroll/wire/form/done`                        |
| `PAYROLL_WIRE_INSTRUCTIONS_CANCEL`             | `payroll/wire/instructions/cancel`              |
| `PAYROLL_WIRE_INSTRUCTIONS_DONE`               | `payroll/wire/instructions/done`                |
| `PAYROLL_WIRE_INSTRUCTIONS_SELECT`             | `payroll/wire/instructions/select`              |
| `PAYROLL_WIRE_START_TRANSFER`                  | `payroll/wire/startTransfer`                    |
| `RECOVERY_CASE_RESOLVE`                        | `recoveryCase/resolve`                          |
| `RECOVERY_CASE_RESUBMIT`                       | `recoveryCase/resubmit`                         |
| `RECOVERY_CASE_RESUBMIT_CANCEL`                | `recoveryCase/resubmit/cancel`                  |
| `RECOVERY_CASE_RESUBMIT_DONE`                  | `recoveryCase/resubmit/done`                    |
| `REVIEW_PAYROLL`                               | `payroll/review`                                |
| `ROBOT_MACHINE_DONE`                           | `done`                                          |
| `RUN_OFF_CYCLE_PAYROLL`                        | `runPayroll/offCycle/start`                     |
| `RUN_PAYROLL_BACK`                             | `runPayroll/back`                               |
| `RUN_PAYROLL_BLOCKER_RESOLUTION_ATTEMPTED`     | `runPayroll/blocker/resolutionAttempted`        |
| `RUN_PAYROLL_BLOCKERS_DETECTED`                | `runPayroll/blockers/detected`                  |
| `RUN_PAYROLL_BLOCKERS_VIEW_ALL`                | `runPayroll/blockers/viewAll`                   |
| `RUN_PAYROLL_CALCULATED`                       | `runPayroll/calculated`                         |
| `RUN_PAYROLL_CANCELLED`                        | `runPayroll/cancelled`                          |
| `RUN_PAYROLL_CANCELLED_ALERT_DISMISSED`        | `runPayroll/cancelled/alertDismissed`           |
| `RUN_PAYROLL_DATES_CONFIGURED`                 | `runPayroll/dates/configured`                   |
| `RUN_PAYROLL_EDIT`                             | `runPayroll/edit`                               |
| `RUN_PAYROLL_EMPLOYEE_CANCELLED`               | `runPayroll/employee/cancelled`                 |
| `RUN_PAYROLL_EMPLOYEE_EDIT`                    | `runPayroll/employee/edit`                      |
| `RUN_PAYROLL_EMPLOYEE_SAVED`                   | `runPayroll/employee/saved`                     |
| `RUN_PAYROLL_EMPLOYEE_SKIP`                    | `runPayroll/employee/skip`                      |
| `RUN_PAYROLL_GROSS_UP_CALCULATED`              | `runPayroll/grossUp/calculated`                 |
| `RUN_PAYROLL_GROSS_UP_SELECTED`                | `runPayroll/grossUp/selected`                   |
| `RUN_PAYROLL_PDF_PAYSTUB_VIEWED`               | `runPayroll/pdfPaystub/viewed`                  |
| `RUN_PAYROLL_PROCESSED`                        | `runPayroll/processed`                          |
| `RUN_PAYROLL_PROCESSING_FAILED`                | `runPayroll/processingFailed`                   |
| `RUN_PAYROLL_RECEIPT_GET`                      | `runPayroll/receipt/get`                        |
| `RUN_PAYROLL_RECEIPT_VIEWED`                   | `runPayroll/receipt/viewed`                     |
| `RUN_PAYROLL_SELECTED`                         | `runPayroll/selected`                           |
| `RUN_PAYROLL_SUBMITTED`                        | `runPayroll/submitted`                          |
| `RUN_PAYROLL_SUBMITTING`                       | `runPayroll/submitting`                         |
| `RUN_PAYROLL_SUMMARY_VIEWED`                   | `runPayroll/summary/viewed`                     |
| `RUN_TRANSITION_PAYROLL`                       | `transition/runPayroll`                         |
| `TIME_OFF_ADD_EMPLOYEES_DONE`                  | `timeOff/addEmployees/done`                     |
| `TIME_OFF_ADD_EMPLOYEES_ERROR`                 | `timeOff/addEmployees/error`                    |
| `TIME_OFF_BACK_TO_LIST`                        | `timeOff/backToList`                            |
| `TIME_OFF_CREATE_POLICY`                       | `timeOff/createPolicy`                          |
| `TIME_OFF_HOLIDAY_ADD_EMPLOYEES_DONE`          | `timeOff/holidayAddEmployees/done`              |
| `TIME_OFF_HOLIDAY_ADD_EMPLOYEES_ERROR`         | `timeOff/holidayAddEmployees/error`             |
| `TIME_OFF_HOLIDAY_CREATE_ERROR`                | `timeOff/holidayCreate/error`                   |
| `TIME_OFF_HOLIDAY_SELECTION_DONE`              | `timeOff/holidaySelection/done`                 |
| `TIME_OFF_POLICY_CREATE_ERROR`                 | `timeOff/policyCreate/error`                    |
| `TIME_OFF_POLICY_DETAILS_DONE`                 | `timeOff/policyDetails/done`                    |
| `TIME_OFF_POLICY_SETTINGS_DONE`                | `timeOff/policySettings/done`                   |
| `TIME_OFF_POLICY_SETTINGS_ERROR`               | `timeOff/policySettings/error`                  |
| `TIME_OFF_POLICY_TYPE_SELECTED`                | `timeOff/policyTypeSelected`                    |
| `TIME_OFF_VIEW_HOLIDAY_EMPLOYEES`              | `timeOff/viewHolidayEmployees`                  |
| `TIME_OFF_VIEW_HOLIDAY_SCHEDULE`               | `timeOff/viewHolidaySchedule`                   |
| `TIME_OFF_VIEW_POLICY`                         | `timeOff/viewPolicy`                            |
| `TIME_OFF_VIEW_POLICY_DETAILS`                 | `timeOff/viewPolicyDetails`                     |
| `TIME_OFF_VIEW_POLICY_EMPLOYEES`               | `timeOff/viewPolicyEmployees`                   |
| `TRANSITION_CREATED`                           | `transition/created`                            |
| `TRANSITION_PAYROLL_SKIPPED`                   | `transition/payrollSkipped`                     |

See the individual component and workflow documentation for details on which events each component emits and what data is included.
