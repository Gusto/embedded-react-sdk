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
| **TimeOff.TimeOffFlow** | TimeOff.PolicyConfigurationForm, TimeOff.TimeOffPolicyDetailPresentation |
