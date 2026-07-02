/**
 * Flows and blocks for viewing and responding to information requests from Gusto.
 *
 * @group Component namespaces
 */
export * as InformationRequests from './InformationRequests'

/**
 * Flows and blocks for running and managing payroll across a company's pay schedules.
 *
 * @group Component namespaces
 */
export * as Payroll from './Payroll'

/**
 * Flows and blocks for creating and managing time-off policies — sick, vacation, and holiday.
 *
 * @group Component namespaces
 */
export * as TimeOff from './TimeOff'

// Journey-based namespaces (preferred)

/**
 * Flows and blocks for onboarding employees.
 *
 * @group Component namespaces
 */
export * as EmployeeOnboarding from './Employee/exports/employeeOnboarding'

/**
 * Flows and blocks for managing an employee after onboarding.
 *
 * @group Component namespaces
 */
export * as EmployeeManagement from './Employee/exports/employeeManagement'

/**
 * Flows and blocks for onboarding a company.
 *
 * @group Component namespaces
 */
export * as CompanyOnboarding from './Company/exports/companyOnboarding'

/**
 * Flows and blocks for onboarding contractors.
 *
 * @group Component namespaces
 */
export * as ContractorOnboarding from './Contractor/exports/contractorOnboarding'

/**
 * Flows and blocks for managing contractors after onboarding — payments, payment methods, and profile details.
 *
 * @group Component namespaces
 */
export * as ContractorManagement from './Contractor/exports/contractorManagement'
