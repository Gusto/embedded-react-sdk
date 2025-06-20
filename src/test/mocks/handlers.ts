import EmployeeHandlers from './apis/employees'
import HomeAddressHandlers from './apis/employee_home_addresses'
import WorkAddressHandlers from './apis/employee_work_addresses'
import CompanyLocationHandlers from './apis/company_locations'
import CompanyFederalTaxHandlers from './apis/company_federal_taxes'
import TokenHandlers from './apis/tokens'
import CompensationHandlers from './apis/compensations'
import EmployeeBankAccountsHandlers from './apis/employeesBankAccounts'
import PayrollsHandler from './apis/payrolls'
import CompanySignatoryHandlers from './apis/company_signatories'
import CompanyForms from './apis/company_forms'
import PayScheduleHandlers from './apis/payschedule'
import CompanyStateTaxesHandlers from './apis/company_state_taxes'
import ContractorPaymentMethodHandlers from './apis/contractor_payment_method'
import ContractorNewHireReportHandlers from './apis/contractor_new_hire_report'
import contractorAddressHandlers from './apis/contractor_address'

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
  ...CompanySignatoryHandlers,
  ...CompanyForms,
  ...PayScheduleHandlers,
  ...CompanyStateTaxesHandlers,
  ...ContractorPaymentMethodHandlers,
  ...ContractorNewHireReportHandlers,
  ...contractorAddressHandlers,
]
