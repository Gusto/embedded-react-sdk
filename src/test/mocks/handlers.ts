import EmployeeHandlers, {
  getEmployeeOnboardingStatus,
  updateEmployeeOnboardingStatus,
  getEmployeeGarnishments,
} from './apis/employees'
import HomeAddressHandlers from './apis/employee_home_addresses'
import WorkAddressHandlers from './apis/employee_work_addresses'
import CompanyLocationHandlers from './apis/company_locations'
import CompanyBankAccountHandlers from './apis/company_bank_accounts'
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
import ContractorHandlers from './apis/contractors'
import ContractorPaymentGroupsHandlers from './apis/contractor_payment_groups'
import WireInRequestsHandlers from './apis/wire_in_requests'
import InformationRequestsHandlers from './apis/information_requests'
import I9AuthorizationHandlers from './apis/i9_authorization'
import EmployeeFormHandlers from './apis/employee_forms'
import {
  getCompany,
  getCompanyOnboardingStatus,
  getIndustrySelection,
  updateIndustrySelection,
} from './apis/company'
import { getEmployeeFederalTaxes, updateEmployeeFederalTaxes } from './apis/employee_federal_taxes'
import { getEmployeeStateTaxes, updateEmployeeStateTaxes } from './apis/employee_state_taxes'

export const handlers = [
  getCompany,
  getCompanyOnboardingStatus,
  getIndustrySelection,
  updateIndustrySelection,
  ...EmployeeHandlers,
  getEmployeeOnboardingStatus,
  updateEmployeeOnboardingStatus,
  getEmployeeGarnishments,
  ...TokenHandlers,
  ...HomeAddressHandlers,
  ...CompanyLocationHandlers,
  ...WorkAddressHandlers,
  ...CompensationHandlers,
  ...EmployeeBankAccountsHandlers,
  ...CompanyBankAccountHandlers,
  ...CompanyFederalTaxHandlers,
  getEmployeeFederalTaxes,
  updateEmployeeFederalTaxes,
  getEmployeeStateTaxes,
  updateEmployeeStateTaxes,
  ...PayrollsHandler,
  ...CompanySignatoryHandlers,
  ...CompanyForms,
  ...PayScheduleHandlers,
  ...CompanyStateTaxesHandlers,
  ...ContractorPaymentMethodHandlers,
  ...ContractorNewHireReportHandlers,
  ...contractorAddressHandlers,
  ...ContractorHandlers,
  ...ContractorPaymentGroupsHandlers,
  ...WireInRequestsHandlers,
  ...InformationRequestsHandlers,
  ...I9AuthorizationHandlers,
  ...EmployeeFormHandlers,
]
