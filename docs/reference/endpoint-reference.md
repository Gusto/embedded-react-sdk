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

| Component | Method | Path |
| --- | --- | --- |
| **Company.Industry** | GET | `/v1/companies/:companyId/industry_selection` |
|  | PUT | `/v1/companies/:companyId/industry_selection` |
| **Company.AssignSignatory** | GET | `/v1/companies/:companyUuid/signatories` |
|  | POST | `/v1/companies/:companyUuid/signatories` |
|  | PUT | `/v1/companies/:companyUuid/signatories/:signatoryUuid` |
|  | DELETE | `/v1/companies/:companyUuid/signatories/:signatoryUuid` |
|  | POST | `/v1/companies/:companyUuid/signatories/invite` |
| **Company.CreateSignatory** | GET | `/v1/companies/:companyUuid/signatories` |
|  | POST | `/v1/companies/:companyUuid/signatories` |
|  | PUT | `/v1/companies/:companyUuid/signatories/:signatoryUuid` |
|  | DELETE | `/v1/companies/:companyUuid/signatories/:signatoryUuid` |
| **Company.InviteSignatory** | GET | `/v1/companies/:companyUuid/signatories` |
|  | POST | `/v1/companies/:companyUuid/signatories/invite` |
|  | DELETE | `/v1/companies/:companyUuid/signatories/:signatoryUuid` |
| **Company.DocumentList** | GET | `/v1/companies/:companyId/forms` |
|  | GET | `/v1/companies/:companyUuid/signatories` |
| **Company.SignatureForm** | GET | `/v1/forms/:formId` |
|  | PUT | `/v1/forms/:formId/sign` |
|  | GET | `/v1/forms/:formId/pdf` |
| **Company.DocumentSigner** | GET | `/v1/companies/:companyId/forms` |
|  | GET | `/v1/companies/:companyUuid/signatories` |
|  | GET | `/v1/forms/:formId` |
|  | PUT | `/v1/forms/:formId/sign` |
|  | GET | `/v1/forms/:formId/pdf` |
| **Company.OnboardingOverview** | GET | `/v1/companies/:companyUuid/onboarding_status` |
| **Company.Locations** | PUT | `/v1/locations/:locationId` |
|  | GET | `/v1/locations/:locationId` |
|  | POST | `/v1/companies/:companyId/locations` |
|  | GET | `/v1/companies/:companyId/locations` |
| **Company.PaySchedule** | GET | `/v1/companies/:companyId/pay_schedules/preview` |
|  | PUT | `/v1/companies/:companyId/pay_schedules/:payScheduleId` |
|  | GET | `/v1/companies/:companyId/pay_schedules` |
|  | POST | `/v1/companies/:companyId/pay_schedules` |
|  | GET | `/v1/companies/:companyId/pay_schedules/:payScheduleId` |
|  | GET | `/v1/companies/:companyUuid/payment_configs` |
| **Company.FederalTaxes** | PUT | `/v1/companies/:companyId/federal_tax_details` |
|  | GET | `/v1/companies/:companyId/federal_tax_details` |
| **Company.BankAccount** | GET | `/v1/companies/:companyId/bank_accounts` |
|  | POST | `/v1/companies/:companyId/bank_accounts` |
|  | PUT | `/v1/companies/:companyId/bank_accounts/:bankAccountUuid/verify` |
| **Company.StateTaxesList** | GET | `/v1/companies/:companyUuid/tax_requirements` |
| **Company.StateTaxesForm** | PUT | `/v1/companies/:companyUuid/tax_requirements/:state` |
|  | GET | `/v1/companies/:companyUuid/tax_requirements/:state` |
| **Company.StateTaxes** | PUT | `/v1/companies/:companyUuid/tax_requirements/:state` |
|  | GET | `/v1/companies/:companyUuid/tax_requirements/:state` |
|  | GET | `/v1/companies/:companyUuid/tax_requirements` |

## Contractor components

| Component | Method | Path |
| --- | --- | --- |
| **Contractor.PaymentMethod** | GET | `/v1/contractors/:contractorUuid/payment_method` |
|  | GET | `/v1/contractors/:contractorUuid/bank_accounts` |
|  | POST | `/v1/contractors/:contractorUuid/bank_accounts` |
|  | PUT | `/v1/contractors/:contractorUuid/payment_method` |
| **Contractor.Address** | GET | `/v1/contractors/:contractorUuid` |
|  | GET | `/v1/contractors/:contractorUuid/address` |
|  | PUT | `/v1/contractors/:contractorUuid/address` |
| **Contractor.ContractorList** | DELETE | `/v1/contractors/:contractorUuid` |
|  | GET | `/v1/companies/:companyUuid/contractors` |
| **Contractor.NewHireReport** | GET | `/v1/contractors/:contractorUuid` |
|  | PUT | `/v1/contractors/:contractorUuid` |
| **Contractor.ContractorSubmit** | PUT | `/v1/contractors/:contractorUuid/onboarding_status` |
|  | GET | `/v1/contractors/:contractorUuid/onboarding_status` |
|  | GET | `/v1/contractors/:contractorUuid` |
| **Contractor.ContractorProfile** | GET | `/v1/contractors/:contractorUuid` |
|  | POST | `/v1/companies/:companyUuid/contractors` |
|  | PUT | `/v1/contractors/:contractorUuid` |
| **Contractor.PaymentsList** | GET | `/v1/companies/:companyId/contractor_payment_groups` |
|  | GET | `/v1/companies/:companyUuid/information_requests` |
| **Contractor.CreatePayment** | GET | `/v1/companies/:companyUuid/contractors` |
|  | POST | `/v1/companies/:companyId/contractor_payment_groups` |
|  | POST | `/v1/companies/:companyId/contractor_payment_groups/preview` |
|  | GET | `/v1/companies/:companyId/bank_accounts` |
| **Contractor.PaymentHistory** | GET | `/v1/contractor_payment_groups/:contractorPaymentGroupUuid` |
|  | GET | `/v1/companies/:companyUuid/contractors` |
|  | DELETE | `/v1/companies/:companyId/contractor_payments/:contractorPaymentId` |
| **Contractor.PaymentSummary** | GET | `/v1/contractor_payment_groups/:contractorPaymentGroupUuid` |
|  | GET | `/v1/companies/:companyUuid/contractors` |
|  | GET | `/v1/companies/:companyId/bank_accounts` |
| **Contractor.PaymentStatement** | GET | `/v1/contractor_payment_groups/:contractorPaymentGroupUuid` |
|  | GET | `/v1/companies/:companyUuid/contractors` |
|  | GET | `/v1/contractor_payments/:contractorPaymentUuid/receipt` |

## Employee components

| Component | Method | Path |
| --- | --- | --- |
| **Employee.EmployeeList** | GET | `/v1/companies/:companyId/employees` |
|  | DELETE | `/v1/employees/:employeeId` |
|  | PUT | `/v1/employees/:employeeId/onboarding_status` |
| **Employee.Deductions** | GET | `/v1/employees/:employeeId/garnishments` |
|  | POST | `/v1/employees/:employeeId/garnishments` |
|  | PUT | `/v1/garnishments/:garnishmentId` |
|  | GET | `/v1/garnishments/child_support` |
| **Employee.OnboardingSummary** | GET | `/v1/employees/:employeeId` |
|  | GET | `/v1/employees/:employeeId/onboarding_status` |
| **Employee.Profile** | GET | `/v1/employees/:employeeId/work_addresses` |
|  | GET | `/v1/employees/:employeeId` |
|  | GET | `/v1/employees/:employeeId/home_addresses` |
|  | POST | `/v1/companies/:companyId/employees` |
|  | PUT | `/v1/employees/:employeeId` |
|  | PUT | `/v1/employees/:employeeId/onboarding_status` |
|  | POST | `/v1/employees/:employeeId/home_addresses` |
|  | PUT | `/v1/home_addresses/:homeAddressUuid` |
|  | GET | `/v1/companies/:companyId/locations` |
|  | POST | `/v1/employees/:employeeId/work_addresses` |
|  | PUT | `/v1/work_addresses/:workAddressUuid` |
| **Employee.Compensation** | GET | `/v1/employees/:employeeId/jobs` |
|  | POST | `/v1/employees/:employeeId/jobs` |
|  | PUT | `/v1/jobs/:jobId` |
|  | DELETE | `/v1/jobs/:jobId` |
|  | PUT | `/v1/compensations/:compensationId` |
|  | GET | `/v1/locations/:locationUuid/minimum_wages` |
|  | GET | `/v1/employees/:employeeId/work_addresses` |
|  | GET | `/v1/companies/:companyId/federal_tax_details` |
|  | GET | `/v1/employees/:employeeId` |
| **Employee.FederalTaxes** | GET | `/v1/employees/:employeeUuid/federal_taxes` |
|  | PUT | `/v1/employees/:employeeUuid/federal_taxes` |
| **Employee.StateTaxes** | GET | `/v1/employees/:employeeUuid/state_taxes` |
|  | PUT | `/v1/employees/:employeeUuid/state_taxes` |
| **Employee.PaymentMethod** | POST | `/v1/employees/:employeeId/bank_accounts` |
|  | DELETE | `/v1/employees/:employeeId/bank_accounts/:bankAccountUuid` |
|  | GET | `/v1/employees/:employeeId/bank_accounts` |
|  | GET | `/v1/employees/:employeeId/payment_method` |
|  | PUT | `/v1/employees/:employeeId/bank_accounts/:bankAccountUuid` |
|  | PUT | `/v1/employees/:employeeId/payment_method` |
| **Employee.Landing** | GET | `/v1/employees/:employeeId` |
|  | GET | `/v1/companies/:companyId` |
| **Employee.DocumentSigner** | GET | `/v1/employees/:employeeId/forms` |
|  | GET | `/v1/employees/:employeeId` |
|  | GET | `/v1/employees/:employeeId/i9_authorization` |
|  | PUT | `/v1/employees/:employeeId/i9_authorization` |
|  | GET | `/v1/employees/:employeeId/forms/:formId/pdf` |
|  | PUT | `/v1/employees/:employeeId/forms/:formId/sign` |
|  | GET | `/v1/employees/:employeeId/forms/:formId` |
| **Employee.EmployeeDocuments** | GET | `/v1/employees/:employeeId` |
|  | PUT | `/v1/employees/:employeeId/onboarding_documents_config` |
| **Employee.DashboardFlow** | GET | `/v1/employees/:employeeId` |
|  | GET | `/v1/employees/:employeeId/home_addresses` |
|  | GET | `/v1/employees/:employeeId/work_addresses` |
|  | GET | `/v1/employees/:employeeId/payment_method` |
|  | GET | `/v1/employees/:employeeId/bank_accounts` |
|  | GET | `/v1/employees/:employeeId/garnishments` |
|  | GET | `/v1/employees/:employeeId/pay_stubs` |
|  | GET | `/v1/employees/:employeeId/forms` |
|  | GET | `/v1/employees/:employeeUuid/federal_taxes` |
|  | GET | `/v1/employees/:employeeUuid/state_taxes` |
| **Employee.EmploymentEligibility** | GET | `/v1/employees/:employeeId/i9_authorization` |
|  | PUT | `/v1/employees/:employeeId/i9_authorization` |
| **Employee.TerminateEmployee** | GET | `/v1/employees/:employeeId` |
|  | GET | `/v1/employees/:employeeId/terminations` |
|  | POST | `/v1/employees/:employeeId/terminations` |
|  | PUT | `/v1/terminations/:employeeId` |
|  | POST | `/v1/companies/:companyId/payrolls` |
|  | GET | `/v1/companies/:companyId/pay_periods/unprocessed_termination_pay_periods` |
|  | GET | `/v1/companies/:companyId/payrolls` |
| **Employee.TerminationSummary** | GET | `/v1/employees/:employeeId` |
|  | GET | `/v1/employees/:employeeId/terminations` |
|  | DELETE | `/v1/employees/:employeeId/terminations` |
|  | GET | `/v1/companies/:companyId/employees` |
| **Employee.Taxes** | GET | `/v1/employees/:employeeUuid/federal_taxes` |
|  | PUT | `/v1/employees/:employeeUuid/federal_taxes` |
|  | GET | `/v1/employees/:employeeUuid/state_taxes` |
|  | PUT | `/v1/employees/:employeeUuid/state_taxes` |

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
| **Payroll.PayrollConfiguration** | GET | `/v1/companies/:companyId/payrolls/:payrollId` |
|  | PUT | `/v1/companies/:companyId/payrolls/:payrollId` |
|  | POST | `/v1/payrolls/:payrollUuid/gross_up` |
|  | GET | `/v1/companies/:companyUuid/payrolls/blockers` |
|  | PUT | `/v1/companies/:companyId/payrolls/:payrollId/calculate` |
|  | GET | `/v1/companies/:companyId/employees` |
|  | GET | `/v1/companies/:companyId/pay_schedules/:payScheduleId` |
|  | PUT | `/v1/companies/:companyId/payrolls/:payrollId/prepare` |
|  | GET | `/v1/employees/:employeeId` |
| **Payroll.PayrollEditEmployee** | GET | `/v1/employees/:employeeId` |
|  | GET | `/v1/employees/:employeeId/bank_accounts` |
|  | PUT | `/v1/companies/:companyId/payrolls/:payrollId` |
| **Payroll.PayrollHistory** | GET | `/v1/companies/:companyId/payrolls` |
|  | PUT | `/v1/companies/:companyId/payrolls/:payrollId/cancel` |
|  | GET | `/v1/companies/:companyUuid/wire_in_requests` |
| **Payroll.PayrollLanding** | GET | `/v1/companies/:companyUuid/wire_in_requests` |
|  | GET | `/v1/companies/:companyUuid/payrolls/blockers` |
| **Payroll.PayrollList** | GET | `/v1/companies/:companyId/payrolls` |
|  | GET | `/v1/companies/:companyId/pay_schedules` |
|  | POST | `/v1/companies/:companyUuid/payrolls/skip` |
|  | DELETE | `/v1/companies/:companyId/payrolls/:payrollId` |
|  | GET | `/v1/companies/:companyUuid/payrolls/blockers` |
|  | GET | `/v1/companies/:companyUuid/wire_in_requests` |
| **Payroll.PayrollOverview** | PUT | `/v1/companies/:companyId/payrolls/:payrollId/submit` |
|  | PUT | `/v1/companies/:companyId/payrolls/:payrollId/cancel` |
|  | GET | `/v1/companies/:companyId/payrolls/:payrollId` |
|  | GET | `/v1/companies/:companyId/bank_accounts` |
|  | GET | `/v1/companies/:companyId/employees` |
|  | GET | `/v1/wire_in_requests/:wireInRequestUuid` |
|  | GET | `/v1/payrolls/:payrollId/employees/:employeeId/pay_stub` |
| **Payroll.PayrollFlow** | GET | `/v1/companies/:companyId/payrolls/:payrollId` |
|  | GET | `/v1/companies/:companyId/payrolls` |
| **Payroll.PayrollReceipts** | GET | `/v1/payrolls/:payrollUuid/receipt` |
| **Payroll.ConfirmWireDetails** | GET | `/v1/companies/:companyUuid/wire_in_requests` |
|  | GET | `/v1/companies/:companyId/payrolls` |
|  | PUT | `/v1/wire_in_requests/:wireInRequestUuid` |
|  | GET | `/v1/wire_in_requests/:wireInRequestUuid` |
| **Payroll.PayrollBlockerList** | GET | `/v1/companies/:companyUuid/payrolls/blockers` |
|  | GET | `/v1/companies/:companyUuid/recovery_cases` |
|  | GET | `/v1/companies/:companyUuid/information_requests` |
| **Payroll.RecoveryCases** | GET | `/v1/companies/:companyUuid/recovery_cases` |
|  | PUT | `/v1/recovery_cases/:recoveryCaseUuid/redebit` |
| **Payroll.OffCycleCreation** | POST | `/v1/companies/:companyId/payrolls` |
|  | GET | `/v1/companies/:companyId/employees` |
| **Payroll.OffCycleFlow** | GET | `/v1/companies/:companyId/payrolls/:payrollId` |
| **Payroll.DismissalFlow** | GET | `/v1/companies/:companyId/payrolls/:payrollId` |
|  | GET | `/v1/companies/:companyId/pay_periods/unprocessed_termination_pay_periods` |
|  | POST | `/v1/companies/:companyId/payrolls` |
| **Payroll.TransitionFlow** | GET | `/v1/companies/:companyId/payrolls/:payrollId` |
| **Payroll.TransitionCreation** | POST | `/v1/companies/:companyId/payrolls` |
|  | GET | `/v1/companies/:companyId/pay_schedules` |

## UNSTABLE_TimeOff components

| Component | Method | Path |
| --- | --- | --- |
| **UNSTABLE_TimeOff.PolicyList** | POST | `/v1/companies/:companyUuid/holiday_pay_policy` |
|  | GET | `/v1/companies/:companyUuid/time_off_policies` |
|  | PUT | `/v1/time_off_policies/:timeOffPolicyUuid/deactivate` |
|  | GET | `/v1/companies/:companyId/employees` |
|  | GET | `/v1/companies/:companyUuid/holiday_pay_policy` |
|  | DELETE | `/v1/companies/:companyUuid/holiday_pay_policy` |
|  | POST | `/v1/companies/:companyUuid/time_off_policies` |
| **UNSTABLE_TimeOff.PolicyTypeSelector** | POST | `/v1/companies/:companyUuid/holiday_pay_policy` |
|  | GET | `/v1/companies/:companyUuid/time_off_policies` |
|  | PUT | `/v1/time_off_policies/:timeOffPolicyUuid/deactivate` |
|  | GET | `/v1/companies/:companyId/employees` |
|  | GET | `/v1/companies/:companyUuid/holiday_pay_policy` |
|  | DELETE | `/v1/companies/:companyUuid/holiday_pay_policy` |
|  | POST | `/v1/companies/:companyUuid/time_off_policies` |
| **UNSTABLE_TimeOff.PolicyConfigurationForm** | POST | `/v1/companies/:companyUuid/time_off_policies` |
| **UNSTABLE_TimeOff.PolicySettings** | POST | `/v1/companies/:companyUuid/holiday_pay_policy` |
|  | GET | `/v1/companies/:companyUuid/time_off_policies` |
|  | PUT | `/v1/time_off_policies/:timeOffPolicyUuid/deactivate` |
|  | GET | `/v1/companies/:companyId/employees` |
|  | GET | `/v1/companies/:companyUuid/holiday_pay_policy` |
|  | DELETE | `/v1/companies/:companyUuid/holiday_pay_policy` |
|  | POST | `/v1/companies/:companyUuid/time_off_policies` |
| **UNSTABLE_TimeOff.AddEmployeesToPolicy** | POST | `/v1/companies/:companyUuid/holiday_pay_policy` |
|  | GET | `/v1/companies/:companyUuid/time_off_policies` |
|  | PUT | `/v1/time_off_policies/:timeOffPolicyUuid/deactivate` |
|  | GET | `/v1/companies/:companyId/employees` |
|  | GET | `/v1/companies/:companyUuid/holiday_pay_policy` |
|  | DELETE | `/v1/companies/:companyUuid/holiday_pay_policy` |
|  | POST | `/v1/companies/:companyUuid/time_off_policies` |
| **UNSTABLE_TimeOff.ViewPolicyDetails** | POST | `/v1/companies/:companyUuid/holiday_pay_policy` |
|  | GET | `/v1/companies/:companyUuid/time_off_policies` |
|  | PUT | `/v1/time_off_policies/:timeOffPolicyUuid/deactivate` |
|  | GET | `/v1/companies/:companyId/employees` |
|  | GET | `/v1/companies/:companyUuid/holiday_pay_policy` |
|  | DELETE | `/v1/companies/:companyUuid/holiday_pay_policy` |
|  | POST | `/v1/companies/:companyUuid/time_off_policies` |
| **UNSTABLE_TimeOff.ViewPolicyEmployees** | POST | `/v1/companies/:companyUuid/holiday_pay_policy` |
|  | GET | `/v1/companies/:companyUuid/time_off_policies` |
|  | PUT | `/v1/time_off_policies/:timeOffPolicyUuid/deactivate` |
|  | GET | `/v1/companies/:companyId/employees` |
|  | GET | `/v1/companies/:companyUuid/holiday_pay_policy` |
|  | DELETE | `/v1/companies/:companyUuid/holiday_pay_policy` |
|  | POST | `/v1/companies/:companyUuid/time_off_policies` |
| **UNSTABLE_TimeOff.HolidaySelectionForm** | POST | `/v1/companies/:companyUuid/holiday_pay_policy` |
|  | GET | `/v1/companies/:companyUuid/time_off_policies` |
|  | PUT | `/v1/time_off_policies/:timeOffPolicyUuid/deactivate` |
|  | GET | `/v1/companies/:companyId/employees` |
|  | GET | `/v1/companies/:companyUuid/holiday_pay_policy` |
|  | DELETE | `/v1/companies/:companyUuid/holiday_pay_policy` |
|  | POST | `/v1/companies/:companyUuid/time_off_policies` |
| **UNSTABLE_TimeOff.AddEmployeesHoliday** | POST | `/v1/companies/:companyUuid/holiday_pay_policy` |
|  | GET | `/v1/companies/:companyUuid/time_off_policies` |
|  | PUT | `/v1/time_off_policies/:timeOffPolicyUuid/deactivate` |
|  | GET | `/v1/companies/:companyId/employees` |
|  | GET | `/v1/companies/:companyUuid/holiday_pay_policy` |
|  | DELETE | `/v1/companies/:companyUuid/holiday_pay_policy` |
|  | POST | `/v1/companies/:companyUuid/time_off_policies` |
| **UNSTABLE_TimeOff.ViewHolidayEmployees** | POST | `/v1/companies/:companyUuid/holiday_pay_policy` |
|  | GET | `/v1/companies/:companyUuid/time_off_policies` |
|  | PUT | `/v1/time_off_policies/:timeOffPolicyUuid/deactivate` |
|  | GET | `/v1/companies/:companyId/employees` |
|  | GET | `/v1/companies/:companyUuid/holiday_pay_policy` |
|  | DELETE | `/v1/companies/:companyUuid/holiday_pay_policy` |
|  | POST | `/v1/companies/:companyUuid/time_off_policies` |
| **UNSTABLE_TimeOff.ViewHolidaySchedule** | POST | `/v1/companies/:companyUuid/holiday_pay_policy` |
|  | GET | `/v1/companies/:companyUuid/time_off_policies` |
|  | PUT | `/v1/time_off_policies/:timeOffPolicyUuid/deactivate` |
|  | GET | `/v1/companies/:companyId/employees` |
|  | GET | `/v1/companies/:companyUuid/holiday_pay_policy` |
|  | DELETE | `/v1/companies/:companyUuid/holiday_pay_policy` |
|  | POST | `/v1/companies/:companyUuid/time_off_policies` |
| **UNSTABLE_TimeOff.TimeOffFlow** | POST | `/v1/companies/:companyUuid/holiday_pay_policy` |
|  | GET | `/v1/companies/:companyUuid/time_off_policies` |
|  | PUT | `/v1/time_off_policies/:timeOffPolicyUuid/deactivate` |
|  | GET | `/v1/companies/:companyId/employees` |
|  | GET | `/v1/companies/:companyUuid/holiday_pay_policy` |
|  | DELETE | `/v1/companies/:companyUuid/holiday_pay_policy` |
|  | POST | `/v1/companies/:companyUuid/time_off_policies` |

## Flows

Flows compose multiple blocks into a single workflow. The endpoint list for a flow is the union of all its block endpoints.

| Flow | Blocks included |
| --- | --- |
| **Company.OnboardingFlow** | Company.BankAccount, Company.DocumentSigner, Company.FederalTaxes, Company.Industry, Company.Locations, Company.OnboardingFlow, Company.OnboardingOverview, Company.PaySchedule, Company.StateTaxes, Employee.OnboardingFlow |
| **Contractor.OnboardingFlow** | Contractor.Address, Contractor.ContractorList, Contractor.ContractorProfile, Contractor.ContractorSubmit, Contractor.NewHireReport, Contractor.OnboardingFlow, Contractor.PaymentMethod |
| **Contractor.Payments.PaymentFlow** | Contractor.CreatePayment, Contractor.PaymentFlow, Contractor.PaymentHistory, Contractor.PaymentStatement, Contractor.PaymentSummary, Contractor.PaymentsList, InformationRequests.InformationRequestsFlow |
| **Employee.OnboardingFlow** | Employee.Compensation, Employee.Deductions, Employee.EmployeeDocuments, Employee.EmployeeList, Employee.FederalTaxes, Employee.OnboardingFlow, Employee.OnboardingSummary, Employee.PaymentMethod, Employee.Profile, Employee.StateTaxes |
| **Employee.SelfOnboardingFlow** | Employee.DocumentSigner, Employee.FederalTaxes, Employee.Landing, Employee.OnboardingSummary, Employee.PaymentMethod, Employee.Profile, Employee.SelfOnboardingFlow, Employee.StateTaxes |
| **Employee.Terminations.TerminationFlow** | Employee.TerminateEmployee, Employee.TerminationFlow, Employee.TerminationSummary, Payroll.DismissalFlow, Payroll.PayrollLanding |
| **Payroll.PayrollExecutionFlow** | Payroll.PayrollFlow |
| **Payroll.PayrollFlow** | Payroll.OffCycleFlow, Payroll.PayrollBlockerList, Payroll.PayrollConfiguration, Payroll.PayrollEditEmployee, Payroll.PayrollFlow, Payroll.PayrollLanding, Payroll.PayrollOverview, Payroll.PayrollReceipts, Payroll.TransitionFlow |
| **UNSTABLE_TimeOff.TimeOffFlow** | UNSTABLE_TimeOff.PolicyConfigurationForm |
