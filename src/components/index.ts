export * as InformationRequests from './InformationRequests'
/**
 * The Payroll namespace.
 */
export * as Payroll from './Payroll'
export * as TimeOff from './TimeOff'

// Journey-based namespaces (preferred)

/**
 * Flows and blocks for onboarding employees.
 */
export * as EmployeeOnboarding from './Employee/exports/employeeOnboarding'

/**
 * Flows and blocks for managing an employee after onboarding.
 */
export * as EmployeeManagement from './Employee/exports/employeeManagement'
export * as CompanyOnboarding from './Company/exports/companyOnboarding'
export * as ContractorOnboarding from './Contractor/exports/contractorOnboarding'
export * as ContractorManagement from './Contractor/exports/contractorManagement'
