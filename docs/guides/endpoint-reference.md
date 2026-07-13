---
title: 'Endpoint Reference'
description: Auto-generated list of every Gusto Embedded API endpoint each SDK block and hook calls, with HTTP methods, paths, and URL parameters for proxy allowlisting.
---

<!-- AUTO-GENERATED FILE. Do not edit manually. Run "npm run endpoints:derive" to regenerate. -->

# Endpoint Reference

Every SDK component ("block") and headless hook makes a specific set of API calls. This reference lists them all, grouped by domain to match the [Reference](../reference/index.md) navigation. For a concise overview, see the [Proxy Security: Partner Guidance](../getting-started/proxy-security-partner-guidance.md).

Within each domain, **Components** and **Hooks** list the endpoints they call, and **Flows** list the blocks they compose (a flow's endpoints are the union of its blocks' endpoints).

Paths use named parameters (`:companyId`, `:employeeId`, etc.) that correspond to real IDs at runtime, and each links to its page in the API reference. This data is also available as a machine-readable JSON file at [`endpoint-inventory.json`](./endpoint-inventory.json), which includes the reference URL and the list of variables each block expects. For programmatic access, import it directly from the package:

```typescript
import inventory from '@gusto/embedded-react-sdk/endpoint-inventory.json'
```

## Companies

### Components

| Component | Method | Path |
| --- | --- | --- |
| **InformationRequests.InformationRequestsFlow** | GET | [`/v1/companies/:companyUuid/information_requests`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-information-requests) |
|  | PUT | `/v1/information_requests/:informationRequestUuid/submit` |
| **InformationRequests.InformationRequestList** | GET | [`/v1/companies/:companyUuid/information_requests`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-information-requests) |
| **InformationRequests.InformationRequestForm** | GET | [`/v1/companies/:companyUuid/information_requests`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-information-requests) |
|  | PUT | `/v1/information_requests/:informationRequestUuid/submit` |
| **CompanyOnboarding.OnboardingOverview** | GET | [`/v1/companies/:companyUuid/onboarding_status`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-company-onboarding-status) |
| **CompanyOnboarding.DocumentSigner** | GET | [`/v1/companies/:companyId/forms`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-company-forms) |
|  | GET | [`/v1/companies/:companyUuid/signatories`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_uuid-signatories) |
|  | GET | [`/v1/forms/:formId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-company-form) |
|  | GET | [`/v1/forms/:formId/pdf`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-company-form-pdf) |
|  | PUT | [`/v1/forms/:formId/sign`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-company-form-sign) |
| **CompanyOnboarding.DocumentList** | GET | [`/v1/companies/:companyId/forms`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-company-forms) |
|  | GET | [`/v1/companies/:companyUuid/signatories`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_uuid-signatories) |
| **CompanyOnboarding.Industry** | GET | [`/v1/companies/:companyId/industry_selection`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-company-industry) |
|  | PUT | [`/v1/companies/:companyId/industry_selection`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-company-industry) |
| **CompanyOnboarding.BankAccount** | GET | [`/v1/companies/:companyId/bank_accounts`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_id-bank-accounts) |
|  | POST | [`/v1/companies/:companyId/bank_accounts`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/post-v1-companies-company_id-bank-accounts) |
|  | PUT | [`/v1/companies/:companyId/bank_accounts/:bankAccountUuid/verify`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-companies-company_id-bank-accounts-verify) |
| **CompanyOnboarding.Locations** | GET | [`/v1/companies/:companyId/locations`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_id-locations) |
|  | POST | [`/v1/companies/:companyId/locations`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/post-v1-companies-company_id-locations) |
|  | GET | [`/v1/locations/:locationId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-locations-location_id) |
|  | PUT | [`/v1/locations/:locationId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-locations-location_id) |
| **CompanyOnboarding.LocationForm** | POST | [`/v1/companies/:companyId/locations`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/post-v1-companies-company_id-locations) |
|  | GET | [`/v1/locations/:locationId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-locations-location_id) |
|  | PUT | [`/v1/locations/:locationId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-locations-location_id) |
| **CompanyOnboarding.LocationsList** | GET | [`/v1/companies/:companyId/locations`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_id-locations) |
| **CompanyOnboarding.PaySchedule** | GET | [`/v1/companies/:companyId/pay_schedules`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_id-pay_schedules) |
|  | POST | [`/v1/companies/:companyId/pay_schedules`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/post-v1-companies-company_id-pay_schedules) |
|  | GET | [`/v1/companies/:companyId/pay_schedules/:payScheduleId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_id-pay_schedules-pay_schedule_id) |
|  | PUT | [`/v1/companies/:companyId/pay_schedules/:payScheduleId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-companies-company_id-pay_schedules-pay_schedule_id) |
|  | GET | [`/v1/companies/:companyId/pay_schedules/preview`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_id-pay_schedules-preview) |
|  | GET | [`/v1/companies/:companyUuid/payment_configs`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-company-payment-configs) |
| **CompanyOnboarding.FederalTaxes** | GET | [`/v1/companies/:companyId/federal_tax_details`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_id-federal_tax_details) |
|  | PUT | [`/v1/companies/:companyId/federal_tax_details`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-companies-company_id-federal_tax_details) |
| **CompanyOnboarding.StateTaxes** | GET | [`/v1/companies/:companyUuid/tax_requirements`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_uuid-tax_requirements) |
|  | GET | [`/v1/companies/:companyUuid/tax_requirements/:state`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_uuid-tax_requirements-state) |
|  | PUT | [`/v1/companies/:companyUuid/tax_requirements/:state`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-companies-company_uuid-tax_requirements-state) |
| **CompanyOnboarding.StateTaxesForm** | GET | [`/v1/companies/:companyUuid/tax_requirements/:state`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_uuid-tax_requirements-state) |
|  | PUT | [`/v1/companies/:companyUuid/tax_requirements/:state`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-companies-company_uuid-tax_requirements-state) |
| **CompanyOnboarding.StateTaxesList** | GET | [`/v1/companies/:companyUuid/tax_requirements`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_uuid-tax_requirements) |
| **CompanyOnboarding.AssignSignatory** | GET | [`/v1/companies/:companyUuid/signatories`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_uuid-signatories) |
|  | POST | [`/v1/companies/:companyUuid/signatories`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/post-v1-company-signatories) |
|  | PUT | [`/v1/companies/:companyUuid/signatories/:signatoryUuid`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-companies-company_uuid-signatories-signatory_uuid) |
|  | DELETE | [`/v1/companies/:companyUuid/signatories/:signatoryUuid`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/delete-v1-companies-company_uuid-signatories-signatory_uuid) |
|  | POST | [`/v1/companies/:companyUuid/signatories/invite`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/post-v1-companies-company_uuid-signatories-invite) |
| **CompanyOnboarding.CreateSignatory** | GET | [`/v1/companies/:companyUuid/signatories`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_uuid-signatories) |
|  | POST | [`/v1/companies/:companyUuid/signatories`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/post-v1-company-signatories) |
|  | PUT | [`/v1/companies/:companyUuid/signatories/:signatoryUuid`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-companies-company_uuid-signatories-signatory_uuid) |
|  | DELETE | [`/v1/companies/:companyUuid/signatories/:signatoryUuid`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/delete-v1-companies-company_uuid-signatories-signatory_uuid) |
| **CompanyOnboarding.InviteSignatory** | GET | [`/v1/companies/:companyUuid/signatories`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_uuid-signatories) |
|  | DELETE | [`/v1/companies/:companyUuid/signatories/:signatoryUuid`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/delete-v1-companies-company_uuid-signatories-signatory_uuid) |
|  | POST | [`/v1/companies/:companyUuid/signatories/invite`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/post-v1-companies-company_uuid-signatories-invite) |

### Flows

| Flow | Blocks included |
| --- | --- |
| **CompanyOnboarding.OnboardingFlow** | CompanyOnboarding.BankAccount, CompanyOnboarding.DocumentSigner, CompanyOnboarding.FederalTaxes, CompanyOnboarding.Industry, CompanyOnboarding.Locations, CompanyOnboarding.OnboardingOverview, CompanyOnboarding.PaySchedule, CompanyOnboarding.StateTaxes, EmployeeOnboarding.OnboardingFlow |
| **InformationRequests.InformationRequestsFlow** | InformationRequests.InformationRequestForm, InformationRequests.InformationRequestList |

### Hooks

| Hook | Method | Path |
| --- | --- | --- |
| **usePayScheduleForm** | POST | [`/v1/companies/:companyId/pay_schedules`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/post-v1-companies-company_id-pay_schedules) |
|  | GET | [`/v1/companies/:companyId/pay_schedules/:payScheduleId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_id-pay_schedules-pay_schedule_id) |
|  | PUT | [`/v1/companies/:companyId/pay_schedules/:payScheduleId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-companies-company_id-pay_schedules-pay_schedule_id) |
|  | GET | [`/v1/companies/:companyId/pay_schedules/preview`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_id-pay_schedules-preview) |
|  | GET | [`/v1/companies/:companyUuid/payment_configs`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-company-payment-configs) |
| **useSignCompanyForm** | GET | [`/v1/forms/:formId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-company-form) |
|  | GET | [`/v1/forms/:formId/pdf`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-company-form-pdf) |
|  | PUT | [`/v1/forms/:formId/sign`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-company-form-sign) |

## Employees

### Components

| Component | Method | Path |
| --- | --- | --- |
| **EmployeeOnboarding.EmployeeList** | GET | [`/v1/companies/:companyId/employees`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_id-employees) |
|  | DELETE | [`/v1/employees/:employeeId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/delete-v1-employee) |
|  | PUT | [`/v1/employees/:employeeId/onboarding_status`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-employees-employee_id-onboarding_status) |
| **EmployeeOnboarding.OnboardingSummary** | GET | [`/v1/employees/:employeeId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employees) |
|  | GET | [`/v1/employees/:employeeId/onboarding_status`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employees-employee_id-onboarding_status) |
| **EmployeeOnboarding.Landing** | GET | [`/v1/companies/:companyId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies) |
|  | GET | [`/v1/employees/:employeeId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employees) |
| **EmployeeOnboarding.DocumentSigner** | GET | [`/v1/employees/:employeeId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employees) |
|  | GET | [`/v1/employees/:employeeId/forms`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employee-forms) |
|  | GET | [`/v1/employees/:employeeId/forms/:formId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employee-form) |
|  | GET | [`/v1/employees/:employeeId/forms/:formId/pdf`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employee-form-pdf) |
|  | PUT | [`/v1/employees/:employeeId/forms/:formId/sign`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-employee-form-sign) |
|  | GET | [`/v1/employees/:employeeId/i9_authorization`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employees-employee_id-i9_authorization) |
|  | PUT | [`/v1/employees/:employeeId/i9_authorization`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-employees-employee_id-i9_authorization) |
| **EmployeeOnboarding.EmploymentEligibility** | GET | [`/v1/employees/:employeeId/i9_authorization`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employees-employee_id-i9_authorization) |
|  | PUT | [`/v1/employees/:employeeId/i9_authorization`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-employees-employee_id-i9_authorization) |
| **EmployeeOnboarding.DocumentList** | GET | [`/v1/employees/:employeeId/forms`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employee-forms) |
| **EmployeeOnboarding.SignatureForm** | GET | [`/v1/employees/:employeeId/forms/:formId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employee-form) |
|  | GET | [`/v1/employees/:employeeId/forms/:formId/pdf`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employee-form-pdf) |
|  | PUT | [`/v1/employees/:employeeId/forms/:formId/sign`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-employee-form-sign) |
| **EmployeeOnboarding.I9SignatureForm** | GET | [`/v1/employees/:employeeId/forms/:formId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employee-form) |
|  | GET | [`/v1/employees/:employeeId/forms/:formId/pdf`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employee-form-pdf) |
|  | PUT | [`/v1/employees/:employeeId/forms/:formId/sign`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-employee-form-sign) |
|  | GET | [`/v1/employees/:employeeId/i9_authorization`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employees-employee_id-i9_authorization) |
| **EmployeeOnboarding.EmployeeDocuments** | GET | [`/v1/employees/:employeeId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employees) |
|  | PUT | [`/v1/employees/:employeeId/onboarding_documents_config`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-employees-employee_id-onboarding_documents_config) |
| **EmployeeOnboarding.Profile** | POST | [`/v1/companies/:companyId/employees`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/post-v1-employees) |
|  | GET | [`/v1/companies/:companyId/locations`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_id-locations) |
|  | GET | [`/v1/employees/:employeeId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employees) |
|  | PUT | [`/v1/employees/:employeeId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-employees) |
|  | GET | [`/v1/employees/:employeeId/home_addresses`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employees-employee_id-home_addresses) |
|  | POST | [`/v1/employees/:employeeId/home_addresses`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/post-v1-employees-employee_id-home_addresses) |
|  | PUT | [`/v1/employees/:employeeId/onboarding_status`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-employees-employee_id-onboarding_status) |
|  | GET | [`/v1/employees/:employeeId/work_addresses`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employees-employee_id-work_addresses) |
|  | POST | [`/v1/employees/:employeeId/work_addresses`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/post-v1-employees-employee_id-work_addresses) |
|  | GET | [`/v1/home_addresses/:homeAddressUuid`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-home_addresses-home_address_uuid) |
|  | PUT | [`/v1/home_addresses/:homeAddressUuid`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-home_addresses-home_address_uuid) |
|  | GET | [`/v1/work_addresses/:workAddressUuid`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-work_addresses-work_address_uuid) |
|  | PUT | [`/v1/work_addresses/:workAddressUuid`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-work_addresses-work_address_uuid) |
| **EmployeeOnboarding.Compensation** | GET | [`/v1/companies/:companyId/federal_tax_details`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_id-federal_tax_details) |
|  | PUT | [`/v1/compensations/:compensationId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-compensations-compensation_id) |
|  | DELETE | [`/v1/compensations/:compensationId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/delete-v1-compensations-compensation_id) |
|  | GET | [`/v1/employees/:employeeId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employees) |
|  | GET | [`/v1/employees/:employeeId/jobs`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employees-employee_id-jobs) |
|  | POST | [`/v1/employees/:employeeId/jobs`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/post-v1-employees-employee_id-jobs) |
|  | GET | [`/v1/employees/:employeeId/work_addresses`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employees-employee_id-work_addresses) |
|  | PUT | [`/v1/jobs/:jobId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-jobs-job_id) |
|  | DELETE | [`/v1/jobs/:jobId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/delete-v1-jobs-job_id) |
|  | POST | [`/v1/jobs/:jobId/compensations`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/post-v1-compensations-compensation_id) |
|  | GET | [`/v1/locations/:locationUuid/minimum_wages`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-locations-location_uuid-minimum_wages) |
| **EmployeeOnboarding.JobsList** | GET | [`/v1/employees/:employeeId/jobs`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employees-employee_id-jobs) |
|  | DELETE | [`/v1/jobs/:jobId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/delete-v1-jobs-job_id) |
| **EmployeeOnboarding.FederalTaxes** | GET | [`/v1/employees/:employeeUuid/federal_taxes`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employees-employee_id-federal_taxes) |
|  | PUT | [`/v1/employees/:employeeUuid/federal_taxes`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-employees-employee_id-federal_taxes) |
| **EmployeeOnboarding.StateTaxes** | GET | [`/v1/employees/:employeeUuid/state_taxes`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employees-employee_id-state_taxes) |
|  | PUT | [`/v1/employees/:employeeUuid/state_taxes`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-employees-employee_id-state_taxes) |
| **EmployeeOnboarding.Deductions** | GET | [`/v1/employees/:employeeId/garnishments`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employees-employee_id-garnishments) |
|  | POST | [`/v1/employees/:employeeId/garnishments`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/post-v1-employees-employee_id-garnishments) |
|  | PUT | [`/v1/garnishments/:garnishmentId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-garnishments-garnishment_id) |
|  | GET | [`/v1/garnishments/child_support`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-garnishments-child_support) |
| **EmployeeOnboarding.PaymentMethod** | GET | [`/v1/employees/:employeeId/bank_accounts`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employees-employee_id-bank_accounts) |
|  | POST | [`/v1/employees/:employeeId/bank_accounts`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/post-v1-employees-employee_id-bank_accounts) |
|  | DELETE | [`/v1/employees/:employeeId/bank_accounts/:bankAccountUuid`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/delete-v1-employees-employee_id-bank_accounts-bank_account_id) |
|  | GET | [`/v1/employees/:employeeId/payment_method`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employees-employee_id-payment_method) |
|  | PUT | [`/v1/employees/:employeeId/payment_method`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-employees-employee_id-payment_method) |
| **EmployeeManagement.EmployeeList** | GET | [`/v1/companies/:companyId/employees`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_id-employees) |
|  | DELETE | [`/v1/employees/:employeeId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/delete-v1-employee) |
|  | PUT | [`/v1/employees/:employeeId/onboarding_status`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-employees-employee_id-onboarding_status) |
| **EmployeeManagement.Documents** | GET | [`/v1/employees/:employeeId/forms`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employee-forms) |
|  | GET | [`/v1/employees/:employeeId/forms/:formId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employee-form) |
|  | GET | [`/v1/employees/:employeeId/forms/:formId/pdf`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employee-form-pdf) |
| **EmployeeManagement.DashboardFlow** | GET | [`/v1/employees/:employeeId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employees) |
| **EmployeeManagement.HomeAddress** | GET | [`/v1/employees/:employeeId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employees) |
|  | GET | [`/v1/employees/:employeeId/home_addresses`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employees-employee_id-home_addresses) |
|  | DELETE | [`/v1/home_addresses/:homeAddressUuid`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/delete-v1-home_addresses-home_address_uuid) |
| **EmployeeManagement.WorkAddress** | GET | [`/v1/employees/:employeeId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employees) |
|  | GET | [`/v1/employees/:employeeId/work_addresses`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employees-employee_id-work_addresses) |
|  | DELETE | [`/v1/work_addresses/:workAddressUuid`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/delete-v1-work_addresses-work_address_uuid) |
| **EmployeeManagement.FederalTaxes** | GET | [`/v1/employees/:employeeUuid/federal_taxes`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employees-employee_id-federal_taxes) |
|  | PUT | [`/v1/employees/:employeeUuid/federal_taxes`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-employees-employee_id-federal_taxes) |
| **EmployeeManagement.StateTaxes** | GET | [`/v1/employees/:employeeUuid/state_taxes`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employees-employee_id-state_taxes) |
|  | PUT | [`/v1/employees/:employeeUuid/state_taxes`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-employees-employee_id-state_taxes) |
| **EmployeeManagement.Profile** | POST | [`/v1/companies/:companyId/employees`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/post-v1-employees) |
|  | GET | [`/v1/employees/:employeeId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employees) |
|  | PUT | [`/v1/employees/:employeeId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-employees) |
|  | PUT | [`/v1/employees/:employeeId/onboarding_status`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-employees-employee_id-onboarding_status) |
| **EmployeeManagement.PaymentMethod** | GET | [`/v1/employees/:employeeId/bank_accounts`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employees-employee_id-bank_accounts) |
|  | POST | [`/v1/employees/:employeeId/bank_accounts`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/post-v1-employees-employee_id-bank_accounts) |
|  | DELETE | [`/v1/employees/:employeeId/bank_accounts/:bankAccountUuid`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/delete-v1-employees-employee_id-bank_accounts-bank_account_id) |
|  | GET | [`/v1/employees/:employeeId/payment_method`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employees-employee_id-payment_method) |
|  | PUT | [`/v1/employees/:employeeId/payment_method`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-employees-employee_id-payment_method) |
| **EmployeeManagement.PaystubsCard** | GET | [`/v1/employees/:employeeId/pay_stubs`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employees-employee_uuid-pay_stubs) |
|  | GET | [`/v1/payrolls/:payrollId/employees/:employeeId/pay_stub`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-payrolls-payroll_uuid-employees-employee_uuid-pay_stub) |
| **EmployeeManagement.Compensation** | GET | [`/v1/employees/:employeeId/jobs`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employees-employee_id-jobs) |
|  | DELETE | [`/v1/jobs/:jobId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/delete-v1-jobs-job_id) |
| **EmployeeManagement.TerminateEmployee** | GET | [`/v1/companies/:companyId/pay_periods/unprocessed_termination_pay_periods`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_id-unprocessed_termination_pay_periods) |
|  | GET | [`/v1/companies/:companyId/payrolls`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_id-payrolls) |
|  | POST | [`/v1/companies/:companyId/payrolls`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/post-v1-companies-company_id-payrolls) |
|  | GET | [`/v1/employees/:employeeId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employees) |
|  | GET | [`/v1/employees/:employeeId/terminations`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employees-employee_id-terminations) |
|  | POST | [`/v1/employees/:employeeId/terminations`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/post-v1-employees-employee_id-terminations) |
|  | PUT | [`/v1/terminations/:employeeId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-terminations-employee_id) |
| **EmployeeManagement.TerminationSummary** | GET | [`/v1/companies/:companyId/employees`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_id-employees) |
|  | GET | [`/v1/employees/:employeeId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employees) |
|  | GET | [`/v1/employees/:employeeId/terminations`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employees-employee_id-terminations) |
|  | DELETE | [`/v1/employees/:employeeId/terminations`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/delete-v1-employees-employee_id-terminations) |

### Flows

| Flow | Blocks included |
| --- | --- |
| **EmployeeManagement.DashboardFlow** | EmployeeManagement.Compensation, EmployeeManagement.Deductions, EmployeeManagement.Documents, EmployeeManagement.FederalTaxes, EmployeeManagement.HomeAddress, EmployeeManagement.PaymentMethod, EmployeeManagement.PaystubsCard, EmployeeManagement.Profile, EmployeeManagement.StateTaxes, EmployeeManagement.WorkAddress |
| **EmployeeManagement.EmployeeListFlow** | EmployeeManagement.DashboardFlow, EmployeeManagement.EmployeeList, EmployeeManagement.TerminationFlow, EmployeeOnboarding.OnboardingExecutionFlow |
| **EmployeeManagement.TerminationFlow** | EmployeeManagement.TerminateEmployee, EmployeeManagement.TerminationSummary, Payroll.DismissalFlow, Payroll.PayrollLanding |
| **EmployeeOnboarding.OnboardingExecutionFlow** | EmployeeOnboarding.Compensation, EmployeeOnboarding.Deductions, EmployeeOnboarding.EmployeeDocuments, EmployeeOnboarding.FederalTaxes, EmployeeOnboarding.OnboardingSummary, EmployeeOnboarding.Profile, EmployeeOnboarding.StateTaxes |
| **EmployeeOnboarding.OnboardingFlow** | EmployeeOnboarding.EmployeeList, EmployeeOnboarding.OnboardingExecutionFlow |
| **EmployeeOnboarding.SelfOnboardingFlow** | EmployeeOnboarding.DocumentSigner, EmployeeOnboarding.FederalTaxes, EmployeeOnboarding.Landing, EmployeeOnboarding.OnboardingSummary, EmployeeOnboarding.Profile, EmployeeOnboarding.StateTaxes |

### Hooks

| Hook | Method | Path |
| --- | --- | --- |
| **useBankForm** | POST | [`/v1/employees/:employeeId/bank_accounts`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/post-v1-employees-employee_id-bank_accounts) |
| **useChildSupportGarnishmentForm** | GET | [`/v1/employees/:employeeId/garnishments`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employees-employee_id-garnishments) |
|  | POST | [`/v1/employees/:employeeId/garnishments`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/post-v1-employees-employee_id-garnishments) |
|  | PUT | [`/v1/garnishments/:garnishmentId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-garnishments-garnishment_id) |
|  | GET | [`/v1/garnishments/child_support`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-garnishments-child_support) |
| **useCompensationForm** | PUT | [`/v1/compensations/:compensationId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-compensations-compensation_id) |
|  | GET | [`/v1/employees/:employeeId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employees) |
|  | GET | [`/v1/employees/:employeeId/jobs`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employees-employee_id-jobs) |
|  | GET | [`/v1/employees/:employeeId/work_addresses`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employees-employee_id-work_addresses) |
|  | POST | [`/v1/jobs/:jobId/compensations`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/post-v1-compensations-compensation_id) |
|  | GET | [`/v1/locations/:locationUuid/minimum_wages`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-locations-location_uuid-minimum_wages) |
| **useCurrentHomeAddressForm** | GET | [`/v1/employees/:employeeId/home_addresses`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employees-employee_id-home_addresses) |
|  | POST | [`/v1/employees/:employeeId/home_addresses`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/post-v1-employees-employee_id-home_addresses) |
|  | GET | [`/v1/home_addresses/:homeAddressUuid`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-home_addresses-home_address_uuid) |
|  | PUT | [`/v1/home_addresses/:homeAddressUuid`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-home_addresses-home_address_uuid) |
| **useCurrentWorkAddressForm** | GET | [`/v1/companies/:companyId/locations`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_id-locations) |
|  | GET | [`/v1/employees/:employeeId/work_addresses`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employees-employee_id-work_addresses) |
|  | POST | [`/v1/employees/:employeeId/work_addresses`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/post-v1-employees-employee_id-work_addresses) |
|  | GET | [`/v1/work_addresses/:workAddressUuid`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-work_addresses-work_address_uuid) |
|  | PUT | [`/v1/work_addresses/:workAddressUuid`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-work_addresses-work_address_uuid) |
| **useDeductionForm** | GET | [`/v1/employees/:employeeId/garnishments`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employees-employee_id-garnishments) |
|  | POST | [`/v1/employees/:employeeId/garnishments`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/post-v1-employees-employee_id-garnishments) |
|  | PUT | [`/v1/garnishments/:garnishmentId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-garnishments-garnishment_id) |
| **useEmployeeDetailsForm** | POST | [`/v1/companies/:companyId/employees`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/post-v1-employees) |
|  | GET | [`/v1/employees/:employeeId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employees) |
|  | PUT | [`/v1/employees/:employeeId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-employees) |
|  | PUT | [`/v1/employees/:employeeId/onboarding_status`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-employees-employee_id-onboarding_status) |
| **useEmployeeList** | GET | [`/v1/companies/:companyId/employees`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_id-employees) |
|  | DELETE | [`/v1/employees/:employeeId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/delete-v1-employee) |
|  | PUT | [`/v1/employees/:employeeId/onboarding_status`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-employees-employee_id-onboarding_status) |
| **useEmployeeStateTaxesForm** | GET | [`/v1/employees/:employeeUuid/state_taxes`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employees-employee_id-state_taxes) |
|  | PUT | [`/v1/employees/:employeeUuid/state_taxes`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-employees-employee_id-state_taxes) |
| **useFederalTaxesForm** | GET | [`/v1/employees/:employeeUuid/federal_taxes`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employees-employee_id-federal_taxes) |
|  | PUT | [`/v1/employees/:employeeUuid/federal_taxes`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-employees-employee_id-federal_taxes) |
| **useHomeAddressForm** | GET | [`/v1/employees/:employeeId/home_addresses`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employees-employee_id-home_addresses) |
|  | POST | [`/v1/employees/:employeeId/home_addresses`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/post-v1-employees-employee_id-home_addresses) |
|  | GET | [`/v1/home_addresses/:homeAddressUuid`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-home_addresses-home_address_uuid) |
|  | PUT | [`/v1/home_addresses/:homeAddressUuid`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-home_addresses-home_address_uuid) |
| **useJobForm** | GET | [`/v1/companies/:companyId/federal_tax_details`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_id-federal_tax_details) |
|  | PUT | [`/v1/compensations/:compensationId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-compensations-compensation_id) |
|  | GET | [`/v1/employees/:employeeId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employees) |
|  | GET | [`/v1/employees/:employeeId/jobs`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employees-employee_id-jobs) |
|  | POST | [`/v1/employees/:employeeId/jobs`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/post-v1-employees-employee_id-jobs) |
|  | GET | [`/v1/employees/:employeeId/work_addresses`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employees-employee_id-work_addresses) |
|  | PUT | [`/v1/jobs/:jobId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-jobs-job_id) |
| **usePaymentMethodForm** | GET | [`/v1/employees/:employeeId/payment_method`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employees-employee_id-payment_method) |
|  | PUT | [`/v1/employees/:employeeId/payment_method`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-employees-employee_id-payment_method) |
| **useSignEmployeeForm** | GET | [`/v1/employees/:employeeId/forms/:formId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employee-form) |
|  | GET | [`/v1/employees/:employeeId/forms/:formId/pdf`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employee-form-pdf) |
|  | PUT | [`/v1/employees/:employeeId/forms/:formId/sign`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-employee-form-sign) |
| **useSplitPaymentsForm** | GET | [`/v1/employees/:employeeId/bank_accounts`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employees-employee_id-bank_accounts) |
|  | GET | [`/v1/employees/:employeeId/payment_method`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employees-employee_id-payment_method) |
|  | PUT | [`/v1/employees/:employeeId/payment_method`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-employees-employee_id-payment_method) |
| **useStateFields** | GET | [`/v1/employees/:employeeUuid/state_taxes`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employees-employee_id-state_taxes) |
|  | PUT | [`/v1/employees/:employeeUuid/state_taxes`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-employees-employee_id-state_taxes) |
| **useWorkAddressForm** | GET | [`/v1/companies/:companyId/locations`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_id-locations) |
|  | GET | [`/v1/employees/:employeeId/work_addresses`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employees-employee_id-work_addresses) |
|  | POST | [`/v1/employees/:employeeId/work_addresses`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/post-v1-employees-employee_id-work_addresses) |
|  | GET | [`/v1/work_addresses/:workAddressUuid`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-work_addresses-work_address_uuid) |
|  | PUT | [`/v1/work_addresses/:workAddressUuid`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-work_addresses-work_address_uuid) |

## Contractors

### Components

| Component | Method | Path |
| --- | --- | --- |
| **ContractorOnboarding.Landing** | GET | [`/v1/companies/:companyId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies) |
|  | GET | [`/v1/contractors/:contractorUuid`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-contractors-contractor_uuid) |
| **ContractorOnboarding.ContractorList** | GET | [`/v1/companies/:companyUuid/contractors`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_uuid-contractors) |
|  | DELETE | [`/v1/contractors/:contractorUuid`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/delete-v1-contractors-contractor_uuid) |
|  | PUT | [`/v1/contractors/:contractorUuid/onboarding_status`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-contractors-contractor_uuid-onboarding_status) |
| **ContractorOnboarding.ContractorProfile** | POST | [`/v1/companies/:companyUuid/contractors`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/post-v1-companies-company_uuid-contractors) |
|  | GET | [`/v1/contractors/:contractorUuid`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-contractors-contractor_uuid) |
|  | PUT | [`/v1/contractors/:contractorUuid`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-contractors-contractor_uuid) |
| **ContractorOnboarding.Address** | GET | [`/v1/contractors/:contractorUuid`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-contractors-contractor_uuid) |
|  | GET | [`/v1/contractors/:contractorUuid/address`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-contractors-contractor_uuid-address) |
|  | PUT | [`/v1/contractors/:contractorUuid/address`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-contractors-contractor_uuid-address) |
| **ContractorOnboarding.PaymentMethod** | GET | [`/v1/contractors/:contractorUuid/bank_accounts`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-contractors-contractor_uuid-bank_accounts) |
|  | POST | [`/v1/contractors/:contractorUuid/bank_accounts`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/post-v1-contractors-contractor_uuid-bank_accounts) |
|  | GET | [`/v1/contractors/:contractorUuid/payment_method`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-contractors-contractor_uuid-payment_method) |
|  | PUT | [`/v1/contractors/:contractorUuid/payment_method`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-contractors-contractor_id-payment_method) |
| **ContractorOnboarding.NewHireReport** | GET | [`/v1/contractors/:contractorUuid`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-contractors-contractor_uuid) |
|  | PUT | [`/v1/contractors/:contractorUuid`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-contractors-contractor_uuid) |
| **ContractorOnboarding.ContractorSubmit** | GET | [`/v1/contractors/:contractorUuid`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-contractors-contractor_uuid) |
|  | GET | [`/v1/contractors/:contractorUuid/onboarding_status`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-contractors-contractor_uuid-onboarding_status) |
|  | PUT | [`/v1/contractors/:contractorUuid/onboarding_status`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-contractors-contractor_uuid-onboarding_status) |
| **ContractorOnboarding.DocumentsList** | GET | [`/v1/contractors/:contractorUuid/documents`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-contractor-documents) |
| **ContractorOnboarding.SignatureForm** | GET | [`/v1/documents/:documentUuid`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-contractor-document) |
|  | GET | [`/v1/documents/:documentUuid/pdf`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-contractor-document-pdf) |
|  | PUT | [`/v1/documents/:documentUuid/sign`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-contractor-document-sign) |
| **ContractorManagement.PaymentsList** | GET | [`/v1/companies/:companyId/contractor_payment_groups`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_id-contractor_payment_groups) |
|  | GET | [`/v1/companies/:companyUuid/information_requests`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-information-requests) |
| **ContractorManagement.CreatePayment** | GET | [`/v1/companies/:companyId/bank_accounts`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_id-bank-accounts) |
|  | POST | [`/v1/companies/:companyId/contractor_payment_groups`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/post-v1-companies-company_id-contractor_payment_groups) |
|  | POST | [`/v1/companies/:companyId/contractor_payment_groups/preview`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/post-v1-companies-company_id-contractor_payment_groups-preview) |
|  | GET | [`/v1/companies/:companyUuid/contractors`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_uuid-contractors) |
|  | GET | [`/v1/companies/:companyUuid/payment_configs`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-company-payment-configs) |
| **ContractorManagement.PaymentHistory** | DELETE | [`/v1/companies/:companyId/contractor_payments/:contractorPaymentId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/delete-v1-companies-company_id-contractor_payment-contractor-payment) |
|  | GET | [`/v1/companies/:companyUuid/contractors`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_uuid-contractors) |
|  | GET | [`/v1/contractor_payment_groups/:contractorPaymentGroupUuid`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-contractor_payment_groups-contractor_payment_group_id) |
| **ContractorManagement.PaymentSummary** | GET | [`/v1/companies/:companyId/bank_accounts`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_id-bank-accounts) |
|  | GET | [`/v1/companies/:companyUuid/contractors`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_uuid-contractors) |
|  | GET | [`/v1/contractor_payment_groups/:contractorPaymentGroupUuid`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-contractor_payment_groups-contractor_payment_group_id) |
| **ContractorManagement.PaymentStatement** | GET | [`/v1/companies/:companyUuid/contractors`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_uuid-contractors) |
|  | GET | [`/v1/contractor_payment_groups/:contractorPaymentGroupUuid`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-contractor_payment_groups-contractor_payment_group_id) |
|  | GET | [`/v1/contractor_payments/:contractorPaymentUuid/receipt`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-contractor_payments-contractor_payment_uuid-receipt) |

### Flows

| Flow | Blocks included |
| --- | --- |
| **ContractorManagement.PaymentFlow** | ContractorManagement.CreatePayment, ContractorManagement.PaymentHistory, ContractorManagement.PaymentStatement, ContractorManagement.PaymentSummary, ContractorManagement.PaymentsList, InformationRequests.InformationRequestsFlow |
| **ContractorOnboarding.OnboardingFlow** | ContractorOnboarding.Address, ContractorOnboarding.ContractorList, ContractorOnboarding.ContractorProfile, ContractorOnboarding.ContractorSubmit, ContractorOnboarding.NewHireReport, ContractorOnboarding.PaymentMethod |
| **ContractorOnboarding.SelfOnboardingFlow** | ContractorOnboarding.Address, ContractorOnboarding.ContractorProfile, ContractorOnboarding.DocumentSigner, ContractorOnboarding.Landing, ContractorOnboarding.OnboardingSummary, ContractorOnboarding.PaymentMethod |

### Hooks

| Hook | Method | Path |
| --- | --- | --- |
| **useContractorAddressForm** | GET | [`/v1/contractors/:contractorUuid`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-contractors-contractor_uuid) |
|  | GET | [`/v1/contractors/:contractorUuid/address`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-contractors-contractor_uuid-address) |
|  | PUT | [`/v1/contractors/:contractorUuid/address`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-contractors-contractor_uuid-address) |
| **useContractorBankAccountForm** | GET | [`/v1/contractors/:contractorUuid/bank_accounts`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-contractors-contractor_uuid-bank_accounts) |
|  | POST | [`/v1/contractors/:contractorUuid/bank_accounts`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/post-v1-contractors-contractor_uuid-bank_accounts) |
| **useContractorDetailsForm** | POST | [`/v1/companies/:companyUuid/contractors`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/post-v1-companies-company_uuid-contractors) |
|  | GET | [`/v1/contractors/:contractorUuid`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-contractors-contractor_uuid) |
|  | PUT | [`/v1/contractors/:contractorUuid`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-contractors-contractor_uuid) |
| **useContractorDocumentsList** | GET | [`/v1/contractors/:contractorUuid/documents`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-contractor-documents) |
| **useContractorPaymentMethodForm** | GET | [`/v1/contractors/:contractorUuid/payment_method`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-contractors-contractor_uuid-payment_method) |
|  | PUT | [`/v1/contractors/:contractorUuid/payment_method`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-contractors-contractor_id-payment_method) |
| **useContractorSignatureForm** | GET | [`/v1/documents/:documentUuid`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-contractor-document) |
|  | GET | [`/v1/documents/:documentUuid/pdf`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-contractor-document-pdf) |
|  | PUT | [`/v1/documents/:documentUuid/sign`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-contractor-document-sign) |

## Payrolls

### Components

| Component | Method | Path |
| --- | --- | --- |
| **Payroll.PayrollConfiguration** | GET | [`/v1/companies/:companyId/employees`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_id-employees) |
|  | GET | [`/v1/companies/:companyId/pay_schedules/:payScheduleId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_id-pay_schedules-pay_schedule_id) |
|  | GET | [`/v1/companies/:companyId/payrolls/:payrollId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_id-payrolls-payroll_id) |
|  | PUT | [`/v1/companies/:companyId/payrolls/:payrollId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-companies-company_id-payrolls) |
|  | PUT | [`/v1/companies/:companyId/payrolls/:payrollId/calculate`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-companies-company_id-payrolls-payroll_id-calculate) |
|  | PUT | [`/v1/companies/:companyId/payrolls/:payrollId/prepare`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-companies-company_id-payrolls-payroll_id-prepare) |
|  | GET | [`/v1/companies/:companyUuid/payrolls/blockers`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-payroll-blockers-company_uuid) |
|  | GET | [`/v1/employees/:employeeId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employees) |
|  | POST | [`/v1/payrolls/:payrollUuid/gross_up`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/post-payrolls-gross-up-payroll_uuid) |
| **Payroll.PayrollEditEmployee** | GET | [`/v1/companies/:companyId/pay_schedules/:payScheduleId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_id-pay_schedules-pay_schedule_id) |
|  | PUT | [`/v1/companies/:companyId/payrolls/:payrollId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-companies-company_id-payrolls) |
|  | PUT | [`/v1/companies/:companyId/payrolls/:payrollId/prepare`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-companies-company_id-payrolls-payroll_id-prepare) |
|  | GET | [`/v1/employees/:employeeId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employees) |
|  | GET | [`/v1/employees/:employeeId/bank_accounts`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-employees-employee_id-bank_accounts) |
| **Payroll.PayrollHistory** | GET | [`/v1/companies/:companyId/payrolls`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_id-payrolls) |
|  | PUT | [`/v1/companies/:companyId/payrolls/:payrollId/cancel`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-api-v1-companies-company_id-payrolls-payroll_id-cancel) |
|  | GET | [`/v1/companies/:companyUuid/wire_in_requests`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-companies-company_uuid-wire_in_request_uuid) |
| **Payroll.PayrollLanding** | GET | [`/v1/companies/:companyId/pay_periods`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_id-pay_periods) |
|  | GET | [`/v1/companies/:companyId/pay_schedules`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_id-pay_schedules) |
|  | GET | [`/v1/companies/:companyUuid/payrolls/blockers`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-payroll-blockers-company_uuid) |
|  | POST | [`/v1/companies/:companyUuid/payrolls/skip`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/post-companies-payroll-skip-company_uuid) |
|  | GET | [`/v1/companies/:companyUuid/wire_in_requests`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-companies-company_uuid-wire_in_request_uuid) |
| **Payroll.PayrollList** | GET | [`/v1/companies/:companyId/pay_periods`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_id-pay_periods) |
|  | GET | [`/v1/companies/:companyId/pay_schedules`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_id-pay_schedules) |
|  | GET | [`/v1/companies/:companyId/payrolls`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_id-payrolls) |
|  | DELETE | [`/v1/companies/:companyId/payrolls/:payrollId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/delete-v1-companies-company_id-payrolls) |
|  | GET | [`/v1/companies/:companyUuid/payrolls/blockers`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-payroll-blockers-company_uuid) |
|  | POST | [`/v1/companies/:companyUuid/payrolls/skip`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/post-companies-payroll-skip-company_uuid) |
|  | GET | [`/v1/companies/:companyUuid/wire_in_requests`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-companies-company_uuid-wire_in_request_uuid) |
| **Payroll.PayrollOverview** | GET | [`/v1/companies/:companyId/bank_accounts`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_id-bank-accounts) |
|  | GET | [`/v1/companies/:companyId/payrolls/:payrollId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_id-payrolls-payroll_id) |
|  | PUT | [`/v1/companies/:companyId/payrolls/:payrollId/cancel`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-api-v1-companies-company_id-payrolls-payroll_id-cancel) |
|  | PUT | [`/v1/companies/:companyId/payrolls/:payrollId/submit`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-companies-company_id-payrolls-payroll_id-submit) |
|  | GET | [`/v1/companies/:companyUuid/payment_configs`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-company-payment-configs) |
|  | GET | [`/v1/payrolls/:payrollId/employees/:employeeId/pay_stub`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-payrolls-payroll_uuid-employees-employee_uuid-pay_stub) |
|  | GET | [`/v1/wire_in_requests/:wireInRequestUuid`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-wire_in_requests-wire_in_request_uuid) |
| **Payroll.PayrollFlow** | GET | [`/v1/companies/:companyId/payrolls`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_id-payrolls) |
|  | GET | [`/v1/companies/:companyId/payrolls/:payrollId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_id-payrolls-payroll_id) |
| **Payroll.PayrollReceipts** | GET | [`/v1/payrolls/:payrollUuid/receipt`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-payment-receipts-payrolls-payroll_uuid) |
| **Payroll.ConfirmWireDetails** | GET | [`/v1/companies/:companyId/payrolls`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_id-payrolls) |
|  | GET | [`/v1/companies/:companyUuid/wire_in_requests`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-companies-company_uuid-wire_in_request_uuid) |
|  | GET | [`/v1/wire_in_requests/:wireInRequestUuid`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-wire_in_requests-wire_in_request_uuid) |
|  | PUT | [`/v1/wire_in_requests/:wireInRequestUuid`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-wire_in_requests-wire_in_request_uuid) |
| **Payroll.PayrollBlockerList** | GET | [`/v1/companies/:companyUuid/information_requests`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-information-requests) |
|  | GET | [`/v1/companies/:companyUuid/payrolls/blockers`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-payroll-blockers-company_uuid) |
|  | GET | [`/v1/companies/:companyUuid/recovery_cases`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-recovery-cases) |
| **Payroll.RecoveryCases** | GET | [`/v1/companies/:companyUuid/recovery_cases`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-recovery-cases) |
|  | PUT | [`/v1/recovery_cases/:recoveryCaseUuid/redebit`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/redebit-recovery-case) |
| **Payroll.OffCycleCreation** | GET | [`/v1/companies/:companyId/employees`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_id-employees) |
|  | POST | [`/v1/companies/:companyId/payrolls`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/post-v1-companies-company_id-payrolls) |
|  | GET | [`/v1/companies/:companyUuid/payment_configs`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-company-payment-configs) |
| **Payroll.OffCycleFlow** | GET | [`/v1/companies/:companyId/payrolls/:payrollId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_id-payrolls-payroll_id) |
| **Payroll.DismissalFlow** | GET | [`/v1/companies/:companyId/pay_periods/unprocessed_termination_pay_periods`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_id-unprocessed_termination_pay_periods) |
|  | POST | [`/v1/companies/:companyId/payrolls`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/post-v1-companies-company_id-payrolls) |
|  | GET | [`/v1/companies/:companyId/payrolls/:payrollId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_id-payrolls-payroll_id) |
| **Payroll.DismissalPayPeriodSelection** | GET | [`/v1/companies/:companyId/pay_periods/unprocessed_termination_pay_periods`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_id-unprocessed_termination_pay_periods) |
|  | POST | [`/v1/companies/:companyId/payrolls`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/post-v1-companies-company_id-payrolls) |
|  | GET | [`/v1/companies/:companyId/payrolls/:payrollId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_id-payrolls-payroll_id) |
| **Payroll.TransitionFlow** | GET | [`/v1/companies/:companyId/payrolls/:payrollId`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_id-payrolls-payroll_id) |
| **Payroll.TransitionCreation** | GET | [`/v1/companies/:companyId/pay_schedules`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_id-pay_schedules) |
|  | POST | [`/v1/companies/:companyId/payrolls`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/post-v1-companies-company_id-payrolls) |
|  | GET | [`/v1/companies/:companyUuid/payment_configs`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-company-payment-configs) |

### Flows

| Flow | Blocks included |
| --- | --- |
| **Payroll.DismissalFlow** | Payroll.DismissalPayPeriodSelection, Payroll.PayrollExecutionFlow |
| **Payroll.OffCycleFlow** | Payroll.OffCycleCreation, Payroll.PayrollExecutionFlow |
| **Payroll.PayrollExecutionFlow** | Payroll.PayrollFlow |
| **Payroll.PayrollFlow** | Payroll.OffCycleFlow, Payroll.PayrollBlockerList, Payroll.PayrollConfiguration, Payroll.PayrollEditEmployee, Payroll.PayrollExecutionFlow, Payroll.PayrollLanding, Payroll.PayrollOverview, Payroll.PayrollReceipts, Payroll.TransitionFlow |
| **Payroll.TransitionFlow** | Payroll.PayrollExecutionFlow, Payroll.TransitionCreation |

## Time off policies

### Components

| Component | Method | Path |
| --- | --- | --- |
| **TimeOff.PolicyList** | GET | [`/v1/companies/:companyId/employees`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_id-employees) |
|  | GET | [`/v1/companies/:companyUuid/holiday_pay_policy`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_uuid-holiday_pay_policy) |
|  | DELETE | [`/v1/companies/:companyUuid/holiday_pay_policy`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/delete-v1-companies-company_uuid-holiday_pay_policy) |
|  | GET | [`/v1/companies/:companyUuid/time_off_policies`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_uuid-time_off_policies) |
|  | PUT | [`/v1/time_off_policies/:timeOffPolicyUuid/deactivate`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-time_off_policies-time_off_policy_uuid-deactivate) |
| **TimeOff.PolicyTypeSelector** | GET | [`/v1/companies/:companyUuid/holiday_pay_policy`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_uuid-holiday_pay_policy) |
| **TimeOff.PolicyConfigurationForm** | POST | [`/v1/companies/:companyUuid/time_off_policies`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/post-v1-companies-company_uuid-time_off_policies) |
|  | GET | [`/v1/time_off_policies/:timeOffPolicyUuid`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-time_off_policies-time_off_policy_uuid) |
|  | PUT | [`/v1/time_off_policies/:timeOffPolicyUuid`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-time_off_policies-time_off_policy_uuid) |
| **TimeOff.PolicySettings** | GET | [`/v1/time_off_policies/:timeOffPolicyUuid`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-time_off_policies-time_off_policy_uuid) |
|  | PUT | [`/v1/time_off_policies/:timeOffPolicyUuid`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-time_off_policies-time_off_policy_uuid) |
| **TimeOff.PolicySettingsPresentation** | GET | [`/v1/time_off_policies/:timeOffPolicyUuid`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-time_off_policies-time_off_policy_uuid) |
|  | PUT | [`/v1/time_off_policies/:timeOffPolicyUuid`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-time_off_policies-time_off_policy_uuid) |
| **TimeOff.AddEmployeesToPolicy** | GET | [`/v1/companies/:companyId/employees`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_id-employees) |
|  | GET | [`/v1/time_off_policies/:timeOffPolicyUuid`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-time_off_policies-time_off_policy_uuid) |
|  | PUT | [`/v1/time_off_policies/:timeOffPolicyUuid`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-time_off_policies-time_off_policy_uuid) |
|  | PUT | [`/v1/time_off_policies/:timeOffPolicyUuid/add_employees`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-time_off_policies-time_off_policy_uuid-add_employees) |
| **TimeOff.HolidaySelectionForm** | GET | [`/v1/companies/:companyUuid/holiday_pay_policy`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_uuid-holiday_pay_policy) |
|  | POST | [`/v1/companies/:companyUuid/holiday_pay_policy`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/post-v1-companies-company_uuid-holiday_pay_policy) |
|  | PUT | [`/v1/companies/:companyUuid/holiday_pay_policy`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-companies-company_uuid-holiday_pay_policy) |
| **TimeOff.AddEmployeesHoliday** | GET | [`/v1/companies/:companyId/employees`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_id-employees) |
|  | GET | [`/v1/companies/:companyUuid/holiday_pay_policy`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_uuid-holiday_pay_policy) |
|  | PUT | [`/v1/companies/:companyUuid/holiday_pay_policy/add`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-companies-company_uuid-holiday_pay_policy-add) |
| **TimeOff.ViewHolidayEmployees** | GET | [`/v1/companies/:companyId/employees`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_id-employees) |
|  | GET | [`/v1/companies/:companyUuid/holiday_pay_policy`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_uuid-holiday_pay_policy) |
|  | PUT | [`/v1/companies/:companyUuid/holiday_pay_policy/remove`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-companies-company_uuid-holiday_pay_policy-remove) |
| **TimeOff.ViewHolidayPolicyDetails** | GET | [`/v1/companies/:companyId/employees`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_id-employees) |
|  | GET | [`/v1/companies/:companyUuid/holiday_pay_policy`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_uuid-holiday_pay_policy) |
|  | PUT | [`/v1/companies/:companyUuid/holiday_pay_policy/remove`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-companies-company_uuid-holiday_pay_policy-remove) |
| **TimeOff.ViewHolidaySchedule** | GET | [`/v1/companies/:companyId/employees`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_id-employees) |
|  | GET | [`/v1/companies/:companyUuid/holiday_pay_policy`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_uuid-holiday_pay_policy) |
|  | PUT | [`/v1/companies/:companyUuid/holiday_pay_policy/remove`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-companies-company_uuid-holiday_pay_policy-remove) |
| **TimeOff.TimeOffPolicyDetail** | GET | [`/v1/companies/:companyId/employees`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_id-employees) |
|  | GET | [`/v1/time_off_policies/:timeOffPolicyUuid`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-time_off_policies-time_off_policy_uuid) |
|  | PUT | [`/v1/time_off_policies/:timeOffPolicyUuid/balance`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-time_off_policies-time_off_policy_uuid-balance) |
|  | PUT | [`/v1/time_off_policies/:timeOffPolicyUuid/remove_employees`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-time_off_policies-time_off_policy_uuid-remove_employees) |
| **TimeOff.TimeOffPolicyDetailPresentation** | GET | [`/v1/companies/:companyId/employees`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-companies-company_id-employees) |
|  | GET | [`/v1/time_off_policies/:timeOffPolicyUuid`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/get-v1-time_off_policies-time_off_policy_uuid) |
|  | PUT | [`/v1/time_off_policies/:timeOffPolicyUuid/balance`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-time_off_policies-time_off_policy_uuid-balance) |
|  | PUT | [`/v1/time_off_policies/:timeOffPolicyUuid/remove_employees`](https://docs.gusto.com/embedded-payroll/v2026-06-15/reference/put-v1-time_off_policies-time_off_policy_uuid-remove_employees) |

### Flows

| Flow | Blocks included |
| --- | --- |
| **TimeOff.TimeOffFlow** | TimeOff.AddEmployeesHoliday, TimeOff.AddEmployeesToPolicy, TimeOff.HolidaySelectionForm, TimeOff.PolicyConfigurationForm, TimeOff.PolicyList, TimeOff.PolicySettings, TimeOff.PolicyTypeSelector, TimeOff.TimeOffPolicyDetail, TimeOff.ViewHolidayEmployees, TimeOff.ViewHolidaySchedule |
