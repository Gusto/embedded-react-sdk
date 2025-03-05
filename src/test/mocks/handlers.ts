import EmployeeHandlers from './apis/employees.js'
import HomeAddressHandlers from './apis/homeAddresses'
import WorkAddressHandlers from './apis/workAddresses'
import CompanyLocationHandlers from './apis/company_locations'
import CompanyFederalTaxHandlers from './apis/company_federal_taxes'
import TokenHandlers from './apis/tokens.js'
import CompensationHandlers from './apis/compensations'
import EmployeeBankAccountsHandlers from './apis/employeesBankAccounts.js'
import PayrollsHandler from './apis/payrolls'
import PayScheduleHandlers from './apis/payschedule'
import CompanySignatoryHandlers from './apis/company_signatories'
import CompanyForms from './apis/company_forms'

export const handlers = [
  ...EmployeeHandlers,
  ...TokenHandlers,
  ...HomeAddressHandlers,
  ...CompanyLocationHandlers,
  ...WorkAddressHandlers,
  ...CompensationHandlers,
  ...EmployeeBankAccountsHandlers,
  ...CompanyFederalTaxHandlers,
  ...PayrollsHandler,
  ...PayScheduleHandlers,
  ...CompanySignatoryHandlers,
  ...CompanyForms,
  ...PayScheduleHandlers,
]
