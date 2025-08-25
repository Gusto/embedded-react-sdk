import { OnboardingStatus } from '@gusto/embedded-api/models/operations/putv1employeesemployeeidonboardingstatus'
import { ContractorOnboardingStatus1 } from '@gusto/embedded-api/models/components/contractor'

export const employeeEvents = {
  EMPLOYEE_CREATE: 'employee/create',
  EMPLOYEE_CREATED: 'employee/created',
  EMPLOYEE_UPDATE: 'employee/update',
  EMPLOYEE_UPDATED: 'employee/updated',
  EMPLOYEE_DELETED: 'employee/deleted',
  EMPLOYEE_ONBOARDING_DONE: 'employee/onboarding/done',
  EMPLOYEE_PROFILE_DONE: 'employee/profile/done',
  EMPLOYEE_HOME_ADDRESS: 'employee/addresses/home',
  EMPLOYEE_HOME_ADDRESS_CREATED: 'employee/addresses/home/created',
  EMPLOYEE_HOME_ADDRESS_UPDATED: 'employee/addresses/home/updated',
  EMPLOYEE_WORK_ADDRESS: 'employee/addresses/work',
  EMPLOYEE_WORK_ADDRESS_CREATED: 'employee/addresses/work/created',
  EMPLOYEE_WORK_ADDRESS_UPDATED: 'employee/addresses/work/updated',
  EMPLOYEE_DEDUCTION_ADD: 'employee/deductions/add',
  EMPLOYEE_DEDUCTION_CREATED: 'employee/deductions/created',
  EMPLOYEE_DEDUCTION_UPDATED: 'employee/deductions/updated',
  EMPLOYEE_DEDUCTION_DELETED: 'employee/deductions/deleted',
  EMPLOYEE_DEDUCTION_DONE: 'employee/deductions/done',
  EMPLOYEE_DEDUCTION_EDIT: 'employee/deductions/edit',
  EMPLOYEE_DEDUCTION_CANCEL: 'employee/deductions/cancel',
  EMPLOYEE_DEDUCTION_INCLUDE_YES: 'employee/deductions/include/yes',
  EMPLOYEE_DEDUCTION_INCLUDE_NO: 'employee/deductions/include/no',
  EMPLOYEE_COMPENSATION_CREATE: 'employee/compensations/create',
  EMPLOYEE_COMPENSATION_CREATED: 'employee/compensations/created',
  EMPLOYEE_COMPENSATION_UPDATED: 'employee/compensations/updated',
  EMPLOYEE_COMPENSATION_DONE: 'employee/compensations/done',
  EMPLOYEE_PAYMENT_METHOD_UPDATED: 'employee/paymentMethod/updated',
  EMPLOYEE_PAYMENT_METHOD_DONE: 'employee/paymentMethod/done',
  EMPLOYEE_SPLIT_PAYMENT: 'employee/paymentMethod/split',
  EMPLOYEE_BANK_ACCOUNT_CREATE: 'employee/bankAccount/create',
  EMPLOYEE_BANK_ACCOUNT_CREATED: 'employee/bankAccount/created',
  EMPLOYEE_BANK_ACCOUNT_DELETED: 'employee/bankAccount/deleted',
  EMPLOYEE_FEDERAL_TAXES_UPDATED: 'employee/federalTaxes/updated',
  EMPLOYEE_FEDERAL_TAXES_DONE: 'employee/federalTaxes/done',
  EMPLOYEE_STATE_TAXES_UPDATED: 'employee/stateTaxes/updated',
  EMPLOYEE_STATE_TAXES_DONE: 'employee/stateTaxes/done',
  EMPLOYEE_TAXES_DONE: 'employee/taxes/done',
  EMPLOYEE_SPLIT_PAYCHECK: 'employee/bankAccount/split',
  EMPLOYEE_JOB_CREATED: 'employee/job/created',
  EMPLOYEE_JOB_UPDATED: 'employee/job/updated',
  EMPLOYEE_JOB_DELETED: 'employee/job/deleted',
  EMPLOYEE_SUMMARY_VIEW: 'employee/summary',
  EMPLOYEES_LIST: 'company/employees',
  EMPLOYEE_SELF_ONBOARDING_START: 'employee/selfOnboarding/start',
  EMPLOYEE_VIEW_FORM_TO_SIGN: 'employee/forms/view',
  EMPLOYEE_SIGN_FORM: 'employee/forms/sign',
  EMPLOYEE_FORMS_DONE: 'employee/forms/done',
  EMPLOYEE_ONBOARDING_STATUS_UPDATED: 'employee/onboardingStatus/updated',
} as const

export const companyEvents = {
  COMPANY_INDUSTRY: 'company/industry',
  COMPANY_INDUSTRY_SELECTED: 'company/industry/selected',
  COMPANY_FEDERAL_TAXES_UPDATED: 'company/federalTaxes/updated',
  COMPANY_FEDERAL_TAXES_DONE: 'company/federalTaxes/done',
  COMPANY_SIGNATORY_CREATED: 'company/signatory/created',
  COMPANY_SIGNATORY_INVITED: 'company/signatory/invited',
  COMPANY_SIGNATORY_UPDATED: 'company/signatory/updated',
  COMPANY_CREATE_SIGNATORY_DONE: 'company/signatory/createSignatory/done',
  COMPANY_INVITE_SIGNATORY_DONE: 'company/signatory/inviteSignatory/done',
  COMPANY_ASSIGN_SIGNATORY_MODE_UPDATED: 'company/signatory/assignSignatory/modeUpdated',
  COMPANY_ASSIGN_SIGNATORY_DONE: 'company/signatory/assignSignatory/done',
  COMPANY_FORM_EDIT_SIGNATORY: 'company/forms/editSignatory',
  COMPANY_FORMS_DONE: 'company/forms/done',
  COMPANY_VIEW_FORM_TO_SIGN: 'company/forms/view',
  COMPANY_SIGN_FORM: 'company/forms/sign/signForm',
  COMPANY_SIGN_FORM_DONE: 'company/forms/sign/done',
  COMPANY_SIGN_FORM_BACK: 'company/forms/sign/back',
  COMPANY_LOCATION_CREATE: 'company/location/add',
  COMPANY_LOCATION_CREATED: 'company/location/add/done',
  COMPANY_LOCATION_EDIT: 'company/location/edit',
  COMPANY_LOCATION_UPDATED: 'company/location/edit/done',
  COMPANY_LOCATION_DONE: 'company/location/done',
  COMPANY_BANK_ACCOUNT_CHANGE: 'company/bankAccount/change',
  COMPANY_BANK_ACCOUNT_CANCEL: 'company/bankAccount/cancel',
  COMPANY_BANK_ACCOUNT_CREATED: 'company/bankAccount/created',
  COMPANY_BANK_ACCOUNT_VERIFY: 'company/bankAccount/verify',
  COMPANY_BANK_ACCOUNT_DONE: 'company/bankAccount/done',
  COMPANY_BANK_ACCOUNT_VERIFIED: 'company/bankAccount/verified',
  COMPANY_STATE_TAX_UPDATED: 'company/stateTaxes/updated',
  COMPANY_STATE_TAX_DONE: 'company/stateTaxes/done',
  COMPANY_STATE_TAX_EDIT: 'company/stateTaxes/edit',
  COMPANY_OVERVIEW_DONE: 'company/overview/done',
  COMPANY_OVERVIEW_CONTINUE: 'company/overview/continue',
} as const

export const contractorEvents = {
  CONTRACTOR_ADDRESS_UPDATED: 'contractor/address/updated',
  CONTRACTOR_ADDRESS_DONE: 'contractor/address/done',
  CONTRACTOR_PAYMENT_METHOD_UPDATED: 'contractor/paymentMethod/updated',
  CONTRACTOR_BANK_ACCOUNT_CREATED: 'contractor/bankAccount/created',
  CONTRACTOR_PAYMENT_METHOD_DONE: 'contractor/paymentMethod/done',
  CONTRACTOR_CREATE: 'contractor/create',
  CONTRACTOR_CREATED: 'contractor/created',
  CONTRACTOR_UPDATE: 'contractor/update',
  CONTRACTOR_UPDATED: 'contractor/updated',
  CONTRACTOR_DELETED: 'contractor/deleted',
  CONTRACTOR_PROFILE_DONE: 'contractor/profile/done',
  CONTRACTOR_NEW_HIRE_REPORT_UPDATED: 'contractor/newHireReport/updated',
  CONTRACTOR_NEW_HIRE_REPORT_DONE: 'contractor/newHireReport/done',
  CONTRACTOR_SUBMIT_DONE: 'contractor/submit/done',
  CONTRACTOR_ONBOARDING_STATUS_UPDATED: 'contractor/onboardingStatus/updated',
  CONTRACTOR_INVITE_CONTRACTOR: 'contractor/invite/selfOnboarding',
  CONTRACTOR_ONBOARDING_CONTINUE: 'contractor/onboarding/continue',
} as const

export const payScheduleEvents = {
  PAY_SCHEDULE_CREATE: 'paySchedule/create',
  PAY_SCHEDULE_CREATED: 'paySchedule/created',
  PAY_SCHEDULE_UPDATE: 'paySchedule/update',
  PAY_SCHEDULE_UPDATED: 'paySchedule/updated',
  PAY_SCHEDULE_DELETE: 'paySchedule/delete',
  PAY_SCHEDULE_DELETED: 'paySchedule/deleted',
  PAY_SCHEDULE_DONE: 'paySchedule/done',
} as const

export const runPayrollEvents = {
  RUN_PAYROLL_BACK: 'runPayroll/back',
  RUN_PAYROLL_CALCULATED: 'runPayroll/calculated',
  RUN_PAYROLL_EDITED: 'runPayroll/edited',
  RUN_PAYROLL_EMPLOYEE_EDITED: 'runPayroll/employee/edited',
  RUN_PAYROLL_EMPLOYEE_SAVED: 'runPayroll/employee/saved',
  RUN_PAYROLL_SELECTED: 'runPayroll/selected',
  RUN_PAYROLL_SUBMITTED: 'runPayroll/submitted',
} as const

export const componentEvents = {
  ROBOT_MACHINE_DONE: 'done', //This is internal Robot event thrown when machine transitions to final state
  ERROR: 'ERROR',
  CANCEL: 'CANCEL',
  ...employeeEvents,
  ...companyEvents,
  ...payScheduleEvents,
  ...contractorEvents,
  ...runPayrollEvents,
} as const

export type EventType = (typeof componentEvents)[keyof typeof componentEvents]

export const EmployeeOnboardingStatus = {
  ADMIN_ONBOARDING_INCOMPLETE: OnboardingStatus.AdminOnboardingIncomplete,
  SELF_ONBOARDING_PENDING_INVITE: OnboardingStatus.SelfOnboardingPendingInvite,
  SELF_ONBOARDING_INVITED: OnboardingStatus.SelfOnboardingInvited,
  SELF_ONBOARDING_INVITED_STARTED: OnboardingStatus.SelfOnboardingInvitedStarted,
  SELF_ONBOARDING_INVITED_OVERDUE: OnboardingStatus.SelfOnboardingInvitedOverdue,
  SELF_ONBOARDING_COMPLETED_BY_EMPLOYEE: OnboardingStatus.SelfOnboardingCompletedByEmployee,
  SELF_ONBOARDING_AWAITING_ADMIN_REVIEW: OnboardingStatus.SelfOnboardingAwaitingAdminReview,
  ONBOARDING_COMPLETED: OnboardingStatus.OnboardingCompleted,
} as const

export const EmployeeSelfOnboardingStatuses = new Set([
  EmployeeOnboardingStatus.SELF_ONBOARDING_INVITED,
  EmployeeOnboardingStatus.SELF_ONBOARDING_INVITED_STARTED,
  EmployeeOnboardingStatus.SELF_ONBOARDING_INVITED_OVERDUE,
])

export const ContractorOnboardingStatus = {
  ADMIN_ONBOARDING_INCOMPLETE: ContractorOnboardingStatus1.AdminOnboardingIncomplete,
  ADMIN_ONBOARDING_REVIEW: ContractorOnboardingStatus1.AdminOnboardingReview,
  SELF_ONBOARDING_NOT_INVITED: ContractorOnboardingStatus1.SelfOnboardingNotInvited,
  SELF_ONBOARDING_INVITED: ContractorOnboardingStatus1.SelfOnboardingInvited,
  SELF_ONBOARDING_STARTED: ContractorOnboardingStatus1.SelfOnboardingStarted,
  SELF_ONBOARDING_REVIEW: ContractorOnboardingStatus1.SelfOnboardingReview,
  ONBOARDING_COMPLETED: ContractorOnboardingStatus1.OnboardingCompleted,
} as const

export const ContractorSelfOnboardingStatuses = new Set([
  ContractorOnboardingStatus.SELF_ONBOARDING_NOT_INVITED,
  ContractorOnboardingStatus.SELF_ONBOARDING_INVITED,
  ContractorOnboardingStatus.SELF_ONBOARDING_STARTED,
  ContractorOnboardingStatus.SELF_ONBOARDING_REVIEW,
  ContractorOnboardingStatus.ADMIN_ONBOARDING_REVIEW,
])

/**Map of API response flsa statuses */
export const FlsaStatus = {
  EXEMPT: 'Exempt',
  SALARIED_NONEXEMPT: 'Salaried Nonexempt',
  NONEXEMPT: 'Nonexempt',
  OWNER: 'Owner',
  COMMISSION_ONLY_EXEMPT: 'Commission Only Exempt',
  COMMISSION_ONLY_NONEXEMPT: 'Commission Only Nonexempt',
} as const

//ZP: https://github.com/Gusto/zenpayroll/blob/main/config/initializers/constants/pay_period_constants.rb#L56
export const FLSA_OVERTIME_SALARY_LIMIT = 43888
export const HOURS_PER_PAY_PERIOD_DAILY = 5.69863
export const HOURS_PER_PAY_PERIOD_WEEKLY = 40
export const HOURS_PER_PAY_PERIOD_BIWEEKLY = 80
export const HOURS_PER_PAY_PERIOD_SEMIMONTHLY = 86.666667
export const HOURS_PER_PAY_PERIOD_MONTHLY = 173.333333
export const HOURS_PER_PAY_PERIOD_QUARTERLY = 520
export const HOURS_PER_PAY_PERIOD_SEMIANNUALLY = 1040
export const HOURS_PER_PAY_PERIOD_ANNUALLY = 2080

export const STATES_ABBR = [
  'AL',
  'AK',
  'AZ',
  'AR',
  'CA',
  'CO',
  'CT',
  'DE',
  'FL',
  'GA',
  'HI',
  'ID',
  'IL',
  'IN',
  'IA',
  'KS',
  'KY',
  'LA',
  'ME',
  'MD',
  'MA',
  'MI',
  'MN',
  'MS',
  'MO',
  'MT',
  'NE',
  'NV',
  'NH',
  'NJ',
  'NM',
  'NY',
  'NC',
  'ND',
  'OH',
  'OK',
  'OR',
  'PA',
  'RI',
  'SC',
  'SD',
  'TN',
  'TX',
  'UT',
  'VT',
  'VA',
  'WA',
  'WV',
  'WI',
  'WY',
] as const

export const SIGNATORY_TITLES = {
  OWNER: 'owner',
  PRESIDENT: 'president',
  VICE_PRESIDENT: 'vice_president',
  TREASURER: 'treasurer',
  CORPORATE_OFFICER: 'corporate_officer',
  PARTNER: 'partner',
  MEMBER: 'member',
} as const

export const PAY_PERIODS = {
  HOUR: 'Hour',
  WEEK: 'Week',
  MONTH: 'Month',
  YEAR: 'Year',
  PAYCHECK: 'Paycheck',
} as const

export const BREAKPOINTS = {
  BASE: 'base',
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
} as const

export const BREAKPOINTS_VALUES = {
  [BREAKPOINTS.BASE]: '0rem',
  [BREAKPOINTS.SMALL]: '40rem',
  [BREAKPOINTS.MEDIUM]: '48rem',
  [BREAKPOINTS.LARGE]: '64rem',
} as const

export const PAYMENT_METHODS = {
  check: 'Check',
  directDeposit: 'Direct Deposit',
} as const

export const SPLIT_BY = {
  percentage: 'Percentage',
  amount: 'Amount',
} as const

export const CONTRACTOR_TYPE = {
  BUSINESS: 'Business',
  INDIVIDUAL: 'Individual',
} as const
