---
title: 'Endpoint Reference'
---

<!-- AUTO-GENERATED FILE. Do not edit manually. Run "npm run endpoints:derive" to regenerate. -->

# Endpoint Reference

Every SDK component ("block") makes a specific set of API calls. This reference lists them all. For a concise overview, see the [Proxy Security: Partner Guidance](../getting-started/proxy-security-partner-guidance.md).

Paths use named parameters (`:companyId`, `:employeeId`, etc.) that correspond to real IDs at runtime. This data is also available as a machine-readable JSON file at [`endpoint-inventory.json`](./endpoint-inventory.json), which includes the list of variables each block expects. For programmatic access, import it directly from the package:

```typescript
import inventory from '@gusto/embedded-react-sdk/endpoint-inventory.json'
```

## Company components

| Component                      | Method | Path                                                             |
| ------------------------------ | ------ | ---------------------------------------------------------------- |
| **Company.AssignSignatory**    | GET    | `/v1/companies/:companyUuid/signatories`                         |
|                                | POST   | `/v1/companies/:companyUuid/signatories`                         |
|                                | PUT    | `/v1/companies/:companyUuid/signatories/:signatoryUuid`          |
|                                | DELETE | `/v1/companies/:companyUuid/signatories/:signatoryUuid`          |
|                                | POST   | `/v1/companies/:companyUuid/signatories/invite`                  |
| **Company.BankAccount**        | GET    | `/v1/companies/:companyId/bank_accounts`                         |
|                                | POST   | `/v1/companies/:companyId/bank_accounts`                         |
|                                | PUT    | `/v1/companies/:companyId/bank_accounts/:bankAccountUuid/verify` |
| **Company.DocumentSigner**     | GET    | `/v1/companies/:companyId/forms`                                 |
|                                | GET    | `/v1/companies/:companyUuid/signatories`                         |
|                                | GET    | `/v1/forms/:formId`                                              |
|                                | PUT    | `/v1/forms/:formId/sign`                                         |
|                                | GET    | `/v1/forms/:formId/pdf`                                          |
| **Company.FederalTaxes**       | PUT    | `/v1/companies/:companyId/federal_tax_details`                   |
|                                | GET    | `/v1/companies/:companyId/federal_tax_details`                   |
| **Company.Industry**           | GET    | `/v1/companies/:companyId/industry_selection`                    |
|                                | PUT    | `/v1/companies/:companyId/industry_selection`                    |
| **Company.Locations**          | PUT    | `/v1/locations/:locationId`                                      |
|                                | GET    | `/v1/locations/:locationId`                                      |
|                                | POST   | `/v1/companies/:companyId/locations`                             |
|                                | GET    | `/v1/companies/:companyId/locations`                             |
| **Company.OnboardingOverview** | GET    | `/v1/companies/:companyUuid/onboarding_status`                   |
| **Company.PaySchedule**        | GET    | `/v1/companies/:companyId/pay_schedules/preview`                 |
|                                | PUT    | `/v1/companies/:companyId/pay_schedules/:payScheduleId`          |
|                                | GET    | `/v1/companies/:companyId/pay_schedules`                         |
|                                | POST   | `/v1/companies/:companyId/pay_schedules`                         |
| **Company.StateTaxes**         | PUT    | `/v1/companies/:companyUuid/tax_requirements/:state`             |
|                                | GET    | `/v1/companies/:companyUuid/tax_requirements/:state`             |
|                                | GET    | `/v1/companies/:companyUuid/tax_requirements`                    |

## Contractor components

| Component                                | Method | Path                                                                |
| ---------------------------------------- | ------ | ------------------------------------------------------------------- |
| **Contractor.Address**                   | GET    | `/v1/contractors/:contractorUuid`                                   |
|                                          | GET    | `/v1/contractors/:contractorUuid/address`                           |
|                                          | PUT    | `/v1/contractors/:contractorUuid/address`                           |
| **Contractor.ContractorList**            | DELETE | `/v1/contractors/:contractorUuid`                                   |
|                                          | GET    | `/v1/companies/:companyUuid/contractors`                            |
| **Contractor.NewHireReport**             | GET    | `/v1/contractors/:contractorUuid`                                   |
|                                          | PUT    | `/v1/contractors/:contractorUuid`                                   |
| **Contractor.PaymentMethod**             | GET    | `/v1/contractors/:contractorUuid/payment_method`                    |
|                                          | GET    | `/v1/contractors/:contractorUuid/bank_accounts`                     |
|                                          | POST   | `/v1/contractors/:contractorUuid/bank_accounts`                     |
|                                          | PUT    | `/v1/contractors/:contractorUuid/payment_method`                    |
| **Contractor.Payments.CreatePayment**    | GET    | `/v1/companies/:companyUuid/contractors`                            |
|                                          | POST   | `/v1/companies/:companyId/contractor_payment_groups`                |
|                                          | POST   | `/v1/companies/:companyId/contractor_payment_groups/preview`        |
|                                          | GET    | `/v1/companies/:companyId/bank_accounts`                            |
| **Contractor.Payments.PaymentHistory**   | GET    | `/v1/contractor_payment_groups/:contractorPaymentGroupUuid`         |
|                                          | GET    | `/v1/companies/:companyUuid/contractors`                            |
|                                          | DELETE | `/v1/companies/:companyId/contractor_payments/:contractorPaymentId` |
| **Contractor.Payments.PaymentStatement** | GET    | `/v1/contractor_payment_groups/:contractorPaymentGroupUuid`         |
|                                          | GET    | `/v1/companies/:companyUuid/contractors`                            |
|                                          | GET    | `/v1/contractor_payments/:contractorPaymentUuid/receipt`            |
| **Contractor.Payments.PaymentSummary**   | GET    | `/v1/contractor_payment_groups/:contractorPaymentGroupUuid`         |
|                                          | GET    | `/v1/companies/:companyUuid/contractors`                            |
|                                          | GET    | `/v1/companies/:companyId/bank_accounts`                            |
| **Contractor.Payments.PaymentsList**     | GET    | `/v1/companies/:companyId/contractor_payment_groups`                |
|                                          | GET    | `/v1/companies/:companyUuid/information_requests`                   |
| **Contractor.ContractorProfile**         | GET    | `/v1/contractors/:contractorUuid`                                   |
|                                          | POST   | `/v1/companies/:companyUuid/contractors`                            |
|                                          | PUT    | `/v1/contractors/:contractorUuid`                                   |
| **Contractor.ContractorSubmit**          | PUT    | `/v1/contractors/:contractorUuid/onboarding_status`                 |
|                                          | GET    | `/v1/contractors/:contractorUuid/onboarding_status`                 |
|                                          | GET    | `/v1/contractors/:contractorUuid`                                   |

## Employee components

| Component                      | Method | Path                                                       |
| ------------------------------ | ------ | ---------------------------------------------------------- |
| **Employee.Compensation**      | GET    | `/v1/employees/:employeeId/jobs`                           |
|                                | POST   | `/v1/employees/:employeeId/jobs`                           |
|                                | PUT    | `/v1/jobs/:jobId`                                          |
|                                | DELETE | `/v1/jobs/:jobId`                                          |
|                                | PUT    | `/v1/compensations/:compensationId`                        |
|                                | GET    | `/v1/locations/:locationUuid/minimum_wages`                |
|                                | GET    | `/v1/employees/:employeeId/work_addresses`                 |
|                                | GET    | `/v1/companies/:companyId/federal_tax_details`             |
|                                | GET    | `/v1/employees/:employeeId`                                |
| **Employee.Deductions**        | GET    | `/v1/employees/:employeeId/garnishments`                   |
|                                | POST   | `/v1/employees/:employeeId/garnishments`                   |
|                                | PUT    | `/v1/garnishments/:garnishmentId`                          |
|                                | GET    | `/v1/garnishments/child_support`                           |
| **Employee.DocumentSigner**    | GET    | `/v1/employees/:employeeId/forms`                          |
|                                | GET    | `/v1/employees/:employeeId/forms/:formId/pdf`              |
|                                | PUT    | `/v1/employees/:employeeId/forms/:formId/sign`             |
|                                | GET    | `/v1/employees/:employeeId/forms/:formId`                  |
| **Employee.EmployeeList**      | GET    | `/v1/companies/:companyId/employees`                       |
|                                | DELETE | `/v1/employees/:employeeId`                                |
|                                | PUT    | `/v1/employees/:employeeId/onboarding_status`              |
| **Employee.FederalTaxes**      | GET    | `/v1/employees/:employeeUuid/federal_taxes`                |
|                                | PUT    | `/v1/employees/:employeeUuid/federal_taxes`                |
| **Employee.Landing**           | GET    | `/v1/employees/:employeeId`                                |
|                                | GET    | `/v1/companies/:companyId`                                 |
| **Employee.OnboardingSummary** | GET    | `/v1/employees/:employeeId`                                |
|                                | GET    | `/v1/employees/:employeeId/onboarding_status`              |
| **Employee.PaymentMethod**     | POST   | `/v1/employees/:employeeId/bank_accounts`                  |
|                                | DELETE | `/v1/employees/:employeeId/bank_accounts/:bankAccountUuid` |
|                                | GET    | `/v1/employees/:employeeId/bank_accounts`                  |
|                                | GET    | `/v1/employees/:employeeId/payment_method`                 |
|                                | PUT    | `/v1/employees/:employeeId/bank_accounts/:bankAccountUuid` |
|                                | PUT    | `/v1/employees/:employeeId/payment_method`                 |
| **Employee.Profile**           | GET    | `/v1/companies/:companyId/locations`                       |
|                                | POST   | `/v1/companies/:companyId/employees`                       |
|                                | GET    | `/v1/employees/:employeeId`                                |
|                                | GET    | `/v1/employees/:employeeId/home_addresses`                 |
|                                | POST   | `/v1/employees/:employeeId/home_addresses`                 |
|                                | PUT    | `/v1/home_addresses/:homeAddressUuid`                      |
|                                | PUT    | `/v1/work_addresses/:workAddressUuid`                      |
|                                | PUT    | `/v1/employees/:employeeId`                                |
|                                | GET    | `/v1/employees/:employeeId/work_addresses`                 |
|                                | POST   | `/v1/employees/:employeeId/work_addresses`                 |
|                                | PUT    | `/v1/employees/:employeeId/onboarding_status`              |
| **Employee.StateTaxes**        | GET    | `/v1/employees/:employeeUuid/state_taxes`                  |
|                                | PUT    | `/v1/employees/:employeeUuid/state_taxes`                  |
| **Employee.Taxes**             | GET    | `/v1/employees/:employeeUuid/federal_taxes`                |
|                                | PUT    | `/v1/employees/:employeeUuid/federal_taxes`                |
|                                | GET    | `/v1/employees/:employeeUuid/state_taxes`                  |
|                                | PUT    | `/v1/employees/:employeeUuid/state_taxes`                  |

## InformationRequests components

| Component               | Method | Path                                                      |
| ----------------------- | ------ | --------------------------------------------------------- |
| **InformationRequests** | GET    | `/v1/companies/:companyUuid/information_requests`         |
|                         | PUT    | `/v1/information_requests/:informationRequestUuid/submit` |

## Payroll components

| Component                         | Method | Path                                                     |
| --------------------------------- | ------ | -------------------------------------------------------- |
| **Payroll.ConfirmWireDetails**    | GET    | `/v1/companies/:companyUuid/wire_in_requests`            |
|                                   | GET    | `/v1/companies/:companyId/payrolls`                      |
|                                   | PUT    | `/v1/wire_in_requests/:wireInRequestUuid`                |
|                                   | GET    | `/v1/wire_in_requests/:wireInRequestUuid`                |
| **Payroll.PayrollBlocker**        | GET    | `/v1/companies/:companyUuid/payrolls/blockers`           |
|                                   | GET    | `/v1/companies/:companyUuid/recovery_cases`              |
|                                   | GET    | `/v1/companies/:companyUuid/information_requests`        |
| **Payroll.PayrollConfiguration**  | GET    | `/v1/companies/:companyId/payrolls/:payrollId`           |
|                                   | PUT    | `/v1/companies/:companyId/payrolls/:payrollId/calculate` |
|                                   | PUT    | `/v1/companies/:companyId/payrolls/:payrollId`           |
|                                   | GET    | `/v1/companies/:companyUuid/payrolls/blockers`           |
|                                   | GET    | `/v1/companies/:companyId/employees`                     |
|                                   | GET    | `/v1/companies/:companyId/pay_schedules/:payScheduleId`  |
|                                   | PUT    | `/v1/companies/:companyId/payrolls/:payrollId/prepare`   |
| **Payroll.PayrollEditEmployee**   | GET    | `/v1/employees/:employeeId`                              |
|                                   | GET    | `/v1/employees/:employeeId/bank_accounts`                |
|                                   | PUT    | `/v1/companies/:companyId/payrolls/:payrollId`           |
| **Payroll.PayrollHistory**        | GET    | `/v1/companies/:companyId/payrolls`                      |
|                                   | PUT    | `/v1/companies/:companyId/payrolls/:payrollId/cancel`    |
|                                   | GET    | `/v1/companies/:companyUuid/wire_in_requests`            |
| **Payroll.PayrollLanding**        | GET    | `/v1/companies/:companyUuid/wire_in_requests`            |
|                                   | GET    | `/v1/companies/:companyUuid/payrolls/blockers`           |
| **Payroll.PayrollList**           | GET    | `/v1/companies/:companyId/payrolls`                      |
|                                   | GET    | `/v1/companies/:companyId/pay_schedules`                 |
|                                   | POST   | `/v1/companies/:companyUuid/payrolls/skip`               |
|                                   | GET    | `/v1/companies/:companyUuid/payrolls/blockers`           |
|                                   | GET    | `/v1/companies/:companyUuid/wire_in_requests`            |
| **Payroll.PayrollOverview**       | PUT    | `/v1/companies/:companyId/payrolls/:payrollId/submit`    |
|                                   | PUT    | `/v1/companies/:companyId/payrolls/:payrollId/cancel`    |
|                                   | GET    | `/v1/companies/:companyId/payrolls/:payrollId`           |
|                                   | GET    | `/v1/companies/:companyId/bank_accounts`                 |
|                                   | GET    | `/v1/companies/:companyId/employees`                     |
|                                   | GET    | `/v1/wire_in_requests/:wireInRequestUuid`                |
|                                   | GET    | `/v1/payrolls/:payrollId/employees/:employeeId/pay_stub` |
| **Payroll.PayrollReceipts**       | GET    | `/v1/payrolls/:payrollUuid/receipt`                      |
| **Payroll.RecoveryCases**         | GET    | `/v1/companies/:companyUuid/recovery_cases`              |
|                                   | PUT    | `/v1/recovery_cases/:recoveryCaseUuid/redebit`           |
| **Payroll.UNSTABLE_PayrollHooks** | GET    | `/v1/companies/:companyId/payrolls/:payrollId`           |

## Flows

Flows compose multiple blocks into a single workflow. The endpoint list for a flow is the union of all its block endpoints.

| Flow                                | Blocks included                                                                                                                                                                                        |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Company.OnboardingFlow**          | Company.BankAccount, Company.DocumentSigner, Company.FederalTaxes, Company.Industry, Company.Locations, Company.OnboardingOverview, Company.PaySchedule, Company.StateTaxes                            |
| **Contractor.OnboardingFlow**       | Contractor.Address, Contractor.ContractorList, Contractor.ContractorProfile, Contractor.ContractorSubmit, Contractor.NewHireReport, Contractor.PaymentMethod                                           |
| **Contractor.Payments.PaymentFlow** | Contractor.Payments.CreatePayment, Contractor.Payments.PaymentHistory, Contractor.Payments.PaymentStatement, Contractor.Payments.PaymentSummary, Contractor.Payments.PaymentsList, InformationRequests |
| **Employee.OnboardingFlow**         | Employee.Compensation, Employee.Deductions, Employee.EmployeeList, Employee.FederalTaxes, Employee.OnboardingSummary, Employee.PaymentMethod, Employee.Profile, Employee.StateTaxes                    |
| **Employee.SelfOnboardingFlow**     | Employee.DocumentSigner, Employee.FederalTaxes, Employee.Landing, Employee.OnboardingSummary, Employee.PaymentMethod, Employee.Profile, Employee.StateTaxes                                            |
| **Payroll.PayrollFlow**             | Payroll.ConfirmWireDetails, Payroll.PayrollBlocker, Payroll.PayrollConfiguration, Payroll.PayrollEditEmployee, Payroll.PayrollLanding, Payroll.PayrollOverview, Payroll.PayrollReceipts                |
