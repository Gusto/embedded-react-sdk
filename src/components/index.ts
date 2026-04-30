/** @deprecated Use `CompanyOnboarding` (or future `CompanyManagement`) instead. Will be removed in a future major version. */
export * as Company from './Company'
/** @deprecated Use `ContractorOnboarding` (or future `ContractorManagement`) instead. Will be removed in a future major version. */
export * as Contractor from './Contractor'
/** @deprecated Use `EmployeeOnboarding` or `EmployeeManagement` instead. Will be removed in a future major version. */
export * as Employee from './Employee'
export * as InformationRequests from './InformationRequests'
export * as Payroll from './Payroll'
export * as UNSTABLE_TimeOff from './UNSTABLE_TimeOff'

// Journey-based namespaces (preferred)
export * as EmployeeOnboarding from './Employee/exports/employeeOnboarding'
export * as EmployeeManagement from './Employee/exports/employeeManagement'
export * as CompanyOnboarding from './Company/exports/companyOnboarding'
export * as ContractorOnboarding from './Contractor/exports/contractorOnboarding'
