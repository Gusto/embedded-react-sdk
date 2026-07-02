/**
 * Flows and blocks for viewing and responding to information requests from Gusto.
 */
export * as InformationRequests from './InformationRequests'

/**
 * Flows and blocks for running and managing payroll across a company's pay schedules.
 */
export * as Payroll from './Payroll'

/**
 * Flows and blocks for creating and managing time-off policies — sick, vacation, and holiday.
 */
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
/**
 * Flows and blocks for onboarding a company.
 */
export * as CompanyOnboarding from './Company/exports/companyOnboarding'

/**
 * Flows and blocks for onboarding contractors.
 */
export * as ContractorOnboarding from './Contractor/exports/contractorOnboarding'

/**
 * Flows and blocks for managing contractors after onboarding — payments, payment methods, and profile details.
 */
export * as ContractorManagement from './Contractor/exports/contractorManagement'
