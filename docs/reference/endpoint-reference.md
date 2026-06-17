---
title: 'Endpoint Reference'
description: Auto-generated list of every Gusto Embedded API endpoint each SDK block calls, with HTTP methods, paths, and URL parameters for proxy allowlisting.
---

<!-- AUTO-GENERATED FILE. Do not edit manually. Run "npm run endpoints:derive" to regenerate. -->

# Endpoint Reference

Every SDK component ("block") makes a specific set of API calls. This reference lists them all. For a concise overview, see the [Proxy Security: Partner Guidance](../getting-started/proxy-security-partner-guidance.md).

Paths use named parameters (`:companyId`, `:employeeId`, etc.) that correspond to real IDs at runtime. This data is also available as a machine-readable JSON file at [`endpoint-inventory.json`](./endpoint-inventory.json), which includes the list of variables each block expects. For programmatic access, import it directly from the package:

```typescript
import inventory from '@gusto/embedded-react-sdk/endpoint-inventory.json'
```

## InformationRequests components

| Component | Method | Path |
| --- | --- | --- |
| **InformationRequests.InformationRequestsFlow** | GET | `/v1/companies/:companyUuid/information_requests` |
|  | PUT | `/v1/information_requests/:informationRequestUuid/submit` |
| **InformationRequests.InformationRequestList** | GET | `/v1/companies/:companyUuid/information_requests` |
| **InformationRequests.InformationRequestForm** | GET | `/v1/companies/:companyUuid/information_requests` |
|  | PUT | `/v1/information_requests/:informationRequestUuid/submit` |

## Payroll components

| Component | Method | Path |
| --- | --- | --- |
| **Payroll.PayrollConfiguration** | GET | `/v1/companies/:companyId/employees` |
|  | GET | `/v1/companies/:companyId/pay_schedules/:payScheduleId` |
|  | GET | `/v1/companies/:companyId/payrolls/:payrollId` |
|  | PUT | `/v1/companies/:companyId/payrolls/:payrollId` |
|  | PUT | `/v1/companies/:companyId/payrolls/:payrollId/calculate` |
|  | PUT | `/v1/companies/:companyId/payrolls/:payrollId/prepare` |
|  | GET | `/v1/companies/:companyUuid/payrolls/blockers` |
|  | GET | `/v1/employees/:employeeId` |
|  | POST | `/v1/payrolls/:payrollUuid/gross_up` |
| **Payroll.PayrollEditEmployee** | GET | `/v1/companies/:companyId/pay_schedules/:payScheduleId` |
|  | PUT | `/v1/companies/:companyId/payrolls/:payrollId` |
|  | PUT | `/v1/companies/:companyId/payrolls/:payrollId/prepare` |
|  | GET | `/v1/employees/:employeeId` |
|  | GET | `/v1/employees/:employeeId/bank_accounts` |
| **Payroll.PayrollHistory** | GET | `/v1/companies/:companyId/payrolls` |
|  | PUT | `/v1/companies/:companyId/payrolls/:payrollId/cancel` |
|  | GET | `/v1/companies/:companyUuid/wire_in_requests` |
| **Payroll.PayrollLanding** | GET | `/v1/companies/:companyId/pay_periods` |
|  | GET | `/v1/companies/:companyId/pay_schedules` |
|  | GET | `/v1/companies/:companyUuid/payrolls/blockers` |
|  | POST | `/v1/companies/:companyUuid/payrolls/skip` |
|  | GET | `/v1/companies/:companyUuid/wire_in_requests` |
| **Payroll.PayrollList** | GET | `/v1/companies/:companyId/pay_periods` |
|  | GET | `/v1/companies/:companyId/pay_schedules` |
|  | GET | `/v1/companies/:companyId/payrolls` |
|  | DELETE | `/v1/companies/:companyId/payrolls/:payrollId` |
|  | GET | `/v1/companies/:companyUuid/payrolls/blockers` |
|  | POST | `/v1/companies/:companyUuid/payrolls/skip` |
|  | GET | `/v1/companies/:companyUuid/wire_in_requests` |
| **Payroll.PayrollOverview** | GET | `/v1/companies/:companyId/bank_accounts` |
|  | GET | `/v1/companies/:companyId/payrolls/:payrollId` |
|  | PUT | `/v1/companies/:companyId/payrolls/:payrollId/cancel` |
|  | PUT | `/v1/companies/:companyId/payrolls/:payrollId/submit` |
|  | GET | `/v1/companies/:companyUuid/payment_configs` |
|  | GET | `/v1/payrolls/:payrollId/employees/:employeeId/pay_stub` |
|  | GET | `/v1/wire_in_requests/:wireInRequestUuid` |
| **Payroll.PayrollFlow** | GET | `/v1/companies/:companyId/payrolls` |
|  | GET | `/v1/companies/:companyId/payrolls/:payrollId` |
| **Payroll.PayrollReceipts** | GET | `/v1/payrolls/:payrollUuid/receipt` |
| **Payroll.ConfirmWireDetails** | GET | `/v1/companies/:companyId/payrolls` |
|  | GET | `/v1/companies/:companyUuid/wire_in_requests` |
|  | GET | `/v1/wire_in_requests/:wireInRequestUuid` |
|  | PUT | `/v1/wire_in_requests/:wireInRequestUuid` |
| **Payroll.PayrollBlockerList** | GET | `/v1/companies/:companyUuid/information_requests` |
|  | GET | `/v1/companies/:companyUuid/payrolls/blockers` |
|  | GET | `/v1/companies/:companyUuid/recovery_cases` |
| **Payroll.RecoveryCases** | GET | `/v1/companies/:companyUuid/recovery_cases` |
|  | PUT | `/v1/recovery_cases/:recoveryCaseUuid/redebit` |
| **Payroll.OffCycleCreation** | GET | `/v1/companies/:companyId/employees` |
|  | POST | `/v1/companies/:companyId/payrolls` |
|  | GET | `/v1/companies/:companyUuid/payment_configs` |
| **Payroll.OffCycleFlow** | GET | `/v1/companies/:companyId/payrolls/:payrollId` |
| **Payroll.DismissalFlow** | GET | `/v1/companies/:companyId/pay_periods/unprocessed_termination_pay_periods` |
|  | POST | `/v1/companies/:companyId/payrolls` |
|  | GET | `/v1/companies/:companyId/payrolls/:payrollId` |
| **Payroll.DismissalPayPeriodSelection** | GET | `/v1/companies/:companyId/pay_periods/unprocessed_termination_pay_periods` |
|  | POST | `/v1/companies/:companyId/payrolls` |
|  | GET | `/v1/companies/:companyId/payrolls/:payrollId` |
| **Payroll.TransitionFlow** | GET | `/v1/companies/:companyId/payrolls/:payrollId` |
| **Payroll.TransitionCreation** | GET | `/v1/companies/:companyId/pay_schedules` |
|  | POST | `/v1/companies/:companyId/payrolls` |
|  | GET | `/v1/companies/:companyUuid/payment_configs` |

## TimeOff components

| Component | Method | Path |
| --- | --- | --- |
| **TimeOff.PolicyList** | GET | `/v1/companies/:companyId/employees` |
|  | GET | `/v1/companies/:companyUuid/holiday_pay_policy` |
|  | DELETE | `/v1/companies/:companyUuid/holiday_pay_policy` |
|  | GET | `/v1/companies/:companyUuid/time_off_policies` |
|  | PUT | `/v1/time_off_policies/:timeOffPolicyUuid/deactivate` |
| **TimeOff.PolicyTypeSelector** | GET | `/v1/companies/:companyUuid/holiday_pay_policy` |
| **TimeOff.PolicyConfigurationForm** | POST | `/v1/companies/:companyUuid/time_off_policies` |
|  | GET | `/v1/time_off_policies/:timeOffPolicyUuid` |
|  | PUT | `/v1/time_off_policies/:timeOffPolicyUuid` |
| **TimeOff.PolicySettings** | GET | `/v1/time_off_policies/:timeOffPolicyUuid` |
|  | PUT | `/v1/time_off_policies/:timeOffPolicyUuid` |
| **TimeOff.PolicySettingsPresentation** | GET | `/v1/time_off_policies/:timeOffPolicyUuid` |
|  | PUT | `/v1/time_off_policies/:timeOffPolicyUuid` |
| **TimeOff.AddEmployeesToPolicy** | GET | `/v1/companies/:companyId/employees` |
|  | GET | `/v1/time_off_policies/:timeOffPolicyUuid` |
|  | PUT | `/v1/time_off_policies/:timeOffPolicyUuid` |
|  | PUT | `/v1/time_off_policies/:timeOffPolicyUuid/add_employees` |
| **TimeOff.HolidaySelectionForm** | GET | `/v1/companies/:companyUuid/holiday_pay_policy` |
|  | POST | `/v1/companies/:companyUuid/holiday_pay_policy` |
|  | PUT | `/v1/companies/:companyUuid/holiday_pay_policy` |
| **TimeOff.AddEmployeesHoliday** | GET | `/v1/companies/:companyId/employees` |
|  | GET | `/v1/companies/:companyUuid/holiday_pay_policy` |
|  | PUT | `/v1/companies/:companyUuid/holiday_pay_policy/add` |
| **TimeOff.ViewHolidayEmployees** | GET | `/v1/companies/:companyId/employees` |
|  | GET | `/v1/companies/:companyUuid/holiday_pay_policy` |
|  | PUT | `/v1/companies/:companyUuid/holiday_pay_policy/remove` |
| **TimeOff.ViewHolidayPolicyDetails** | GET | `/v1/companies/:companyId/employees` |
|  | GET | `/v1/companies/:companyUuid/holiday_pay_policy` |
|  | PUT | `/v1/companies/:companyUuid/holiday_pay_policy/remove` |
| **TimeOff.ViewHolidaySchedule** | GET | `/v1/companies/:companyId/employees` |
|  | GET | `/v1/companies/:companyUuid/holiday_pay_policy` |
|  | PUT | `/v1/companies/:companyUuid/holiday_pay_policy/remove` |
| **TimeOff.TimeOffPolicyDetail** | GET | `/v1/companies/:companyId/employees` |
|  | GET | `/v1/time_off_policies/:timeOffPolicyUuid` |
|  | PUT | `/v1/time_off_policies/:timeOffPolicyUuid/balance` |
|  | PUT | `/v1/time_off_policies/:timeOffPolicyUuid/remove_employees` |
| **TimeOff.TimeOffPolicyDetailPresentation** | GET | `/v1/companies/:companyId/employees` |
|  | GET | `/v1/time_off_policies/:timeOffPolicyUuid` |
|  | PUT | `/v1/time_off_policies/:timeOffPolicyUuid/balance` |
|  | PUT | `/v1/time_off_policies/:timeOffPolicyUuid/remove_employees` |

## EmployeeOnboarding components

| Component | Method | Path |
| --- | --- | --- |
| **EmployeeOnboarding.EmployeeList** | GET | `/v1/companies/:companyId/employees` |
|  | DELETE | `/v1/employees/:employeeId` |
|  | PUT | `/v1/employees/:employeeId/onboarding_status` |
| **EmployeeOnboarding.OnboardingSummary** | GET | `/v1/employees/:employeeId` |
|  | GET | `/v1/employees/:employeeId/onboarding_status` |
| **EmployeeOnboarding.Landing** | GET | `/v1/companies/:companyId` |
|  | GET | `/v1/employees/:employeeId` |
| **EmployeeOnboarding.DocumentSigner** | GET | `/v1/employees/:employeeId` |
|  | GET | `/v1/employees/:employeeId/forms` |
|  | GET | `/v1/employees/:employeeId/forms/:formId` |
|  | GET | `/v1/employees/:employeeId/forms/:formId/pdf` |
|  | PUT | `/v1/employees/:employeeId/forms/:formId/sign` |
|  | GET | `/v1/employees/:employeeId/i9_authorization` |
|  | PUT | `/v1/employees/:employeeId/i9_authorization` |
| **EmployeeOnboarding.EmploymentEligibility** | GET | `/v1/employees/:employeeId/i9_authorization` |
|  | PUT | `/v1/employees/:employeeId/i9_authorization` |
| **EmployeeOnboarding.DocumentList** | GET | `/v1/employees/:employeeId/forms` |
| **EmployeeOnboarding.SignatureForm** | GET | `/v1/employees/:employeeId/forms/:formId` |
|  | GET | `/v1/employees/:employeeId/forms/:formId/pdf` |
|  | PUT | `/v1/employees/:employeeId/forms/:formId/sign` |
| **EmployeeOnboarding.I9SignatureForm** | GET | `/v1/employees/:employeeId/forms/:formId` |
|  | GET | `/v1/employees/:employeeId/forms/:formId/pdf` |
|  | PUT | `/v1/employees/:employeeId/forms/:formId/sign` |
|  | GET | `/v1/employees/:employeeId/i9_authorization` |
| **EmployeeOnboarding.EmployeeDocuments** | GET | `/v1/employees/:employeeId` |
|  | PUT | `/v1/employees/:employeeId/onboarding_documents_config` |
| **EmployeeOnboarding.Profile** | POST | `/v1/companies/:companyId/employees` |
|  | GET | `/v1/companies/:companyId/locations` |
|  | GET | `/v1/employees/:employeeId` |
|  | PUT | `/v1/employees/:employeeId` |
|  | GET | `/v1/employees/:employeeId/home_addresses` |
|  | POST | `/v1/employees/:employeeId/home_addresses` |
|  | PUT | `/v1/employees/:employeeId/onboarding_status` |
|  | GET | `/v1/employees/:employeeId/work_addresses` |
|  | POST | `/v1/employees/:employeeId/work_addresses` |
|  | GET | `/v1/home_addresses/:homeAddressUuid` |
|  | PUT | `/v1/home_addresses/:homeAddressUuid` |
|  | GET | `/v1/work_addresses/:workAddressUuid` |
|  | PUT | `/v1/work_addresses/:workAddressUuid` |
| **EmployeeOnboarding.Compensation** | GET | `/v1/companies/:companyId/federal_tax_details` |
|  | PUT | `/v1/compensations/:compensationId` |
|  | DELETE | `/v1/compensations/:compensationId` |
|  | GET | `/v1/employees/:employeeId` |
|  | GET | `/v1/employees/:employeeId/jobs` |
|  | POST | `/v1/employees/:employeeId/jobs` |
|  | GET | `/v1/employees/:employeeId/work_addresses` |
|  | PUT | `/v1/jobs/:jobId` |
|  | DELETE | `/v1/jobs/:jobId` |
|  | POST | `/v1/jobs/:jobId/compensations` |
|  | GET | `/v1/locations/:locationUuid/minimum_wages` |
| **EmployeeOnboarding.JobsList** | GET | `/v1/employees/:employeeId/jobs` |
|  | DELETE | `/v1/jobs/:jobId` |
| **EmployeeOnboarding.FederalTaxes** | GET | `/v1/employees/:employeeUuid/federal_taxes` |
|  | PUT | `/v1/employees/:employeeUuid/federal_taxes` |
| **EmployeeOnboarding.StateTaxes** | GET | `/v1/employees/:employeeUuid/state_taxes` |
|  | PUT | `/v1/employees/:employeeUuid/state_taxes` |
| **EmployeeOnboarding.Deductions** | GET | `/v1/employees/:employeeId/garnishments` |
|  | POST | `/v1/employees/:employeeId/garnishments` |
|  | PUT | `/v1/garnishments/:garnishmentId` |
|  | GET | `/v1/garnishments/child_support` |
| **EmployeeOnboarding.PaymentMethod** | GET | `/v1/employees/:employeeId/bank_accounts` |
|  | POST | `/v1/employees/:employeeId/bank_accounts` |
|  | DELETE | `/v1/employees/:employeeId/bank_accounts/:bankAccountUuid` |
|  | GET | `/v1/employees/:employeeId/payment_method` |
|  | PUT | `/v1/employees/:employeeId/payment_method` |

## EmployeeManagement components

| Component | Method | Path |
| --- | --- | --- |
| **EmployeeManagement.EmployeeList** | GET | `/v1/companies/:companyId/employees` |
|  | DELETE | `/v1/employees/:employeeId` |
|  | PUT | `/v1/employees/:employeeId/onboarding_status` |
| **EmployeeManagement.Documents** | GET | `/v1/employees/:employeeId/forms` |
|  | GET | `/v1/employees/:employeeId/forms/:formId` |
|  | GET | `/v1/employees/:employeeId/forms/:formId/pdf` |
| **EmployeeManagement.DashboardFlow** | GET | `/v1/employees/:employeeId` |
| **EmployeeManagement.HomeAddress** | GET | `/v1/employees/:employeeId` |
|  | GET | `/v1/employees/:employeeId/home_addresses` |
|  | DELETE | `/v1/home_addresses/:homeAddressUuid` |
| **EmployeeManagement.WorkAddress** | GET | `/v1/employees/:employeeId` |
|  | GET | `/v1/employees/:employeeId/work_addresses` |
|  | DELETE | `/v1/work_addresses/:workAddressUuid` |
| **EmployeeManagement.FederalTaxes** | GET | `/v1/employees/:employeeUuid/federal_taxes` |
|  | PUT | `/v1/employees/:employeeUuid/federal_taxes` |
| **EmployeeManagement.StateTaxes** | GET | `/v1/employees/:employeeUuid/state_taxes` |
|  | PUT | `/v1/employees/:employeeUuid/state_taxes` |
| **EmployeeManagement.Profile** | POST | `/v1/companies/:companyId/employees` |
|  | GET | `/v1/employees/:employeeId` |
|  | PUT | `/v1/employees/:employeeId` |
|  | PUT | `/v1/employees/:employeeId/onboarding_status` |
| **EmployeeManagement.PaymentMethod** | GET | `/v1/employees/:employeeId/bank_accounts` |
|  | POST | `/v1/employees/:employeeId/bank_accounts` |
|  | DELETE | `/v1/employees/:employeeId/bank_accounts/:bankAccountUuid` |
|  | GET | `/v1/employees/:employeeId/payment_method` |
|  | PUT | `/v1/employees/:employeeId/payment_method` |
| **EmployeeManagement.PaystubsCard** | GET | `/v1/employees/:employeeId/pay_stubs` |
|  | GET | `/v1/payrolls/:payrollId/employees/:employeeId/pay_stub` |
| **EmployeeManagement.Compensation** | GET | `/v1/employees/:employeeId/jobs` |
|  | DELETE | `/v1/jobs/:jobId` |
| **EmployeeManagement.TerminateEmployee** | GET | `/v1/companies/:companyId/pay_periods/unprocessed_termination_pay_periods` |
|  | GET | `/v1/companies/:companyId/payrolls` |
|  | POST | `/v1/companies/:companyId/payrolls` |
|  | GET | `/v1/employees/:employeeId` |
|  | GET | `/v1/employees/:employeeId/terminations` |
|  | POST | `/v1/employees/:employeeId/terminations` |
|  | PUT | `/v1/terminations/:employeeId` |
| **EmployeeManagement.TerminationSummary** | GET | `/v1/companies/:companyId/employees` |
|  | GET | `/v1/employees/:employeeId` |
|  | GET | `/v1/employees/:employeeId/terminations` |
|  | DELETE | `/v1/employees/:employeeId/terminations` |

## CompanyOnboarding components

| Component | Method | Path |
| --- | --- | --- |
| **CompanyOnboarding.OnboardingOverview** | GET | `/v1/companies/:companyUuid/onboarding_status` |
| **CompanyOnboarding.DocumentSigner** | GET | `/v1/companies/:companyId/forms` |
|  | GET | `/v1/companies/:companyUuid/signatories` |
|  | GET | `/v1/forms/:formId` |
|  | GET | `/v1/forms/:formId/pdf` |
|  | PUT | `/v1/forms/:formId/sign` |
| **CompanyOnboarding.DocumentList** | GET | `/v1/companies/:companyId/forms` |
|  | GET | `/v1/companies/:companyUuid/signatories` |
| **CompanyOnboarding.Industry** | GET | `/v1/companies/:companyId/industry_selection` |
|  | PUT | `/v1/companies/:companyId/industry_selection` |
| **CompanyOnboarding.BankAccount** | GET | `/v1/companies/:companyId/bank_accounts` |
|  | POST | `/v1/companies/:companyId/bank_accounts` |
|  | PUT | `/v1/companies/:companyId/bank_accounts/:bankAccountUuid/verify` |
| **CompanyOnboarding.Locations** | GET | `/v1/companies/:companyId/locations` |
|  | POST | `/v1/companies/:companyId/locations` |
|  | GET | `/v1/locations/:locationId` |
|  | PUT | `/v1/locations/:locationId` |
| **CompanyOnboarding.LocationForm** | POST | `/v1/companies/:companyId/locations` |
|  | GET | `/v1/locations/:locationId` |
|  | PUT | `/v1/locations/:locationId` |
| **CompanyOnboarding.PaySchedule** | GET | `/v1/companies/:companyId/pay_schedules` |
|  | POST | `/v1/companies/:companyId/pay_schedules` |
|  | GET | `/v1/companies/:companyId/pay_schedules/:payScheduleId` |
|  | PUT | `/v1/companies/:companyId/pay_schedules/:payScheduleId` |
|  | GET | `/v1/companies/:companyId/pay_schedules/preview` |
|  | GET | `/v1/companies/:companyUuid/payment_configs` |
| **CompanyOnboarding.FederalTaxes** | GET | `/v1/companies/:companyId/federal_tax_details` |
|  | PUT | `/v1/companies/:companyId/federal_tax_details` |
| **CompanyOnboarding.StateTaxes** | GET | `/v1/companies/:companyUuid/tax_requirements` |
|  | GET | `/v1/companies/:companyUuid/tax_requirements/:state` |
|  | PUT | `/v1/companies/:companyUuid/tax_requirements/:state` |
| **CompanyOnboarding.StateTaxesForm** | GET | `/v1/companies/:companyUuid/tax_requirements/:state` |
|  | PUT | `/v1/companies/:companyUuid/tax_requirements/:state` |
| **CompanyOnboarding.StateTaxesList** | GET | `/v1/companies/:companyUuid/tax_requirements` |
| **CompanyOnboarding.AssignSignatory** | GET | `/v1/companies/:companyUuid/signatories` |
|  | POST | `/v1/companies/:companyUuid/signatories` |
|  | PUT | `/v1/companies/:companyUuid/signatories/:signatoryUuid` |
|  | DELETE | `/v1/companies/:companyUuid/signatories/:signatoryUuid` |
|  | POST | `/v1/companies/:companyUuid/signatories/invite` |
| **CompanyOnboarding.CreateSignatory** | GET | `/v1/companies/:companyUuid/signatories` |
|  | POST | `/v1/companies/:companyUuid/signatories` |
|  | PUT | `/v1/companies/:companyUuid/signatories/:signatoryUuid` |
|  | DELETE | `/v1/companies/:companyUuid/signatories/:signatoryUuid` |
| **CompanyOnboarding.InviteSignatory** | GET | `/v1/companies/:companyUuid/signatories` |
|  | DELETE | `/v1/companies/:companyUuid/signatories/:signatoryUuid` |
|  | POST | `/v1/companies/:companyUuid/signatories/invite` |

## ContractorOnboarding components

| Component | Method | Path |
| --- | --- | --- |
| **ContractorOnboarding.ContractorList** | GET | `/v1/companies/:companyUuid/contractors` |
|  | DELETE | `/v1/contractors/:contractorUuid` |
| **ContractorOnboarding.ContractorProfile** | POST | `/v1/companies/:companyUuid/contractors` |
|  | GET | `/v1/contractors/:contractorUuid` |
|  | PUT | `/v1/contractors/:contractorUuid` |
| **ContractorOnboarding.Address** | GET | `/v1/contractors/:contractorUuid` |
|  | GET | `/v1/contractors/:contractorUuid/address` |
|  | PUT | `/v1/contractors/:contractorUuid/address` |
| **ContractorOnboarding.PaymentMethod** | GET | `/v1/contractors/:contractorUuid/bank_accounts` |
|  | POST | `/v1/contractors/:contractorUuid/bank_accounts` |
|  | GET | `/v1/contractors/:contractorUuid/payment_method` |
|  | PUT | `/v1/contractors/:contractorUuid/payment_method` |
| **ContractorOnboarding.NewHireReport** | GET | `/v1/contractors/:contractorUuid` |
|  | PUT | `/v1/contractors/:contractorUuid` |
| **ContractorOnboarding.ContractorSubmit** | GET | `/v1/contractors/:contractorUuid` |
|  | GET | `/v1/contractors/:contractorUuid/onboarding_status` |
|  | PUT | `/v1/contractors/:contractorUuid/onboarding_status` |

## ContractorManagement components

| Component | Method | Path |
| --- | --- | --- |
| **ContractorManagement.PaymentsList** | GET | `/v1/companies/:companyId/contractor_payment_groups` |
|  | GET | `/v1/companies/:companyUuid/information_requests` |
| **ContractorManagement.CreatePayment** | GET | `/v1/companies/:companyId/bank_accounts` |
|  | POST | `/v1/companies/:companyId/contractor_payment_groups` |
|  | POST | `/v1/companies/:companyId/contractor_payment_groups/preview` |
|  | GET | `/v1/companies/:companyUuid/contractors` |
|  | GET | `/v1/companies/:companyUuid/payment_configs` |
| **ContractorManagement.PaymentHistory** | DELETE | `/v1/companies/:companyId/contractor_payments/:contractorPaymentId` |
|  | GET | `/v1/companies/:companyUuid/contractors` |
|  | GET | `/v1/contractor_payment_groups/:contractorPaymentGroupUuid` |
| **ContractorManagement.PaymentSummary** | GET | `/v1/companies/:companyId/bank_accounts` |
|  | GET | `/v1/companies/:companyUuid/contractors` |
|  | GET | `/v1/contractor_payment_groups/:contractorPaymentGroupUuid` |
| **ContractorManagement.PaymentStatement** | GET | `/v1/companies/:companyUuid/contractors` |
|  | GET | `/v1/contractor_payment_groups/:contractorPaymentGroupUuid` |
|  | GET | `/v1/contractor_payments/:contractorPaymentUuid/receipt` |

## Flows

Flows compose multiple blocks into a single workflow. The endpoint list for a flow is the union of all its block endpoints.

| Flow | Blocks included |
| --- | --- |
| **CompanyOnboarding.OnboardingFlow** | CompanyOnboarding.BankAccount, CompanyOnboarding.DocumentSigner, CompanyOnboarding.FederalTaxes, CompanyOnboarding.Industry, CompanyOnboarding.Locations, CompanyOnboarding.OnboardingOverview, CompanyOnboarding.PaySchedule, CompanyOnboarding.StateTaxes, EmployeeOnboarding.OnboardingFlow |
| **ContractorManagement.PaymentFlow** | ContractorManagement.CreatePayment, ContractorManagement.PaymentHistory, ContractorManagement.PaymentStatement, ContractorManagement.PaymentSummary, ContractorManagement.PaymentsList, InformationRequests.InformationRequestsFlow |
| **ContractorOnboarding.OnboardingFlow** | ContractorOnboarding.Address, ContractorOnboarding.ContractorList, ContractorOnboarding.ContractorProfile, ContractorOnboarding.ContractorSubmit, ContractorOnboarding.NewHireReport, ContractorOnboarding.PaymentMethod |
| **EmployeeManagement.DashboardFlow** | EmployeeManagement.Compensation, EmployeeManagement.Deductions, EmployeeManagement.Documents, EmployeeManagement.FederalTaxes, EmployeeManagement.HomeAddress, EmployeeManagement.PaymentMethod, EmployeeManagement.PaystubsCard, EmployeeManagement.Profile, EmployeeManagement.StateTaxes, EmployeeManagement.WorkAddress |
| **EmployeeManagement.EmployeeListFlow** | EmployeeManagement.DashboardFlow, EmployeeManagement.EmployeeList, EmployeeManagement.TerminationFlow, EmployeeOnboarding.OnboardingExecutionFlow |
| **EmployeeManagement.TerminationFlow** | EmployeeManagement.TerminateEmployee, EmployeeManagement.TerminationSummary, Payroll.DismissalFlow, Payroll.PayrollLanding |
| **EmployeeOnboarding.OnboardingExecutionFlow** | EmployeeOnboarding.Compensation, EmployeeOnboarding.Deductions, EmployeeOnboarding.EmployeeDocuments, EmployeeOnboarding.FederalTaxes, EmployeeOnboarding.OnboardingSummary, EmployeeOnboarding.Profile, EmployeeOnboarding.StateTaxes |
| **EmployeeOnboarding.OnboardingFlow** | EmployeeOnboarding.EmployeeList, EmployeeOnboarding.OnboardingExecutionFlow |
| **EmployeeOnboarding.SelfOnboardingFlow** | EmployeeOnboarding.DocumentSigner, EmployeeOnboarding.FederalTaxes, EmployeeOnboarding.Landing, EmployeeOnboarding.OnboardingSummary, EmployeeOnboarding.Profile, EmployeeOnboarding.StateTaxes |
| **InformationRequests.InformationRequestsFlow** | InformationRequests.InformationRequestForm, InformationRequests.InformationRequestList |
| **Payroll.DismissalFlow** | Payroll.DismissalPayPeriodSelection, Payroll.PayrollExecutionFlow |
| **Payroll.OffCycleFlow** | Payroll.OffCycleCreation, Payroll.PayrollExecutionFlow |
| **Payroll.PayrollExecutionFlow** | Payroll.PayrollFlow |
| **Payroll.PayrollFlow** | Payroll.OffCycleFlow, Payroll.PayrollBlockerList, Payroll.PayrollConfiguration, Payroll.PayrollEditEmployee, Payroll.PayrollExecutionFlow, Payroll.PayrollLanding, Payroll.PayrollOverview, Payroll.PayrollReceipts, Payroll.TransitionFlow |
| **Payroll.TransitionFlow** | Payroll.PayrollExecutionFlow, Payroll.TransitionCreation |
| **TimeOff.TimeOffFlow** | TimeOff.AddEmployeesHoliday, TimeOff.AddEmployeesToPolicy, TimeOff.HolidaySelectionForm, TimeOff.PolicyConfigurationForm, TimeOff.PolicyList, TimeOff.PolicySettings, TimeOff.PolicyTypeSelector, TimeOff.TimeOffPolicyDetail, TimeOff.ViewHolidayEmployees, TimeOff.ViewHolidaySchedule |
