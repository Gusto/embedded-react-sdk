export const employeeEvents = {
  EMPLOYEE_CREATE: 'employee/create',
  EMPLOYEE_CREATED: 'employee/created',
  EMPLOYEE_UPDATE: 'employee/update',
  EMPLOYEE_UPDATED: 'employee/updated',
  EMPLOYEE_DELETED: 'employee/deleted',
  EMPLOYEE_PROFILE_DONE: 'employee/profile/done',
  VIEW_EMPLOYEE_ADDRESSES: 'employee/addresses',
  EMPLOYEE_HOME_ADDRESS: 'employee/addresses/home',
  EMPLOYEE_HOME_ADDRESS_CREATED: 'employee/addresses/home/created',
  EMPLOYEE_HOME_ADDRESS_UPDATED: 'employee/addresses/home/updated',
  EMPLOYEE_WORK_ADDRESS: 'employee/addresses/work',
  EMPLOYEE_WORK_ADDRESS_CREATED: 'employee/addresses/work/created',
  EMPLOYEE_WORK_ADDRESS_UPDATED: 'employee/addresses/work/updated',
  VIEW_EMPLOYEE_DEDUCTIONS: 'employee/deductions',
  EMPLOYEE_DEDUCTION_ADD: 'employee/deductions/add',
  EMPLOYEE_DEDUCTION_CREATED: 'employee/deductions/created',
  EMPLOYEE_DEDUCTION_UPDATED: 'employee/deductions/updated',
  EMPLOYEE_DEDUCTION_DELETED: 'employee/deductions/deleted',
  EMPLOYEE_DEDUCTION_DONE: 'employee/deductions/done',
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
  EMPLOYEE_FEDERAL_TAXES_VIEW: 'employee/federalTaxes/view',
  EMPLOYEE_FEDERAL_TAXES_UPDATED: 'employee/federalTaxes/updated',
  EMPLOYEE_STATE_TAXES_UPDATED: 'employee/stateTaxes/updated',
  EMPLOYEE_TAXES_DONE: 'employee/taxes/done',
  EMPLOYEE_SPLIT_PAYCHECK: 'employee/bankAccount/split',
  EMPLOYEE_JOB_CREATED: 'employee/job/created',
  EMPLOYEE_JOB_UPDATED: 'employee/job/updated',
  EMPLOYEE_SUMMARY_VIEW: 'employee/summary',
  EMPLOYEE_FILE_NEW_HIRE_REPORT: 'employee/newHireReport',
  EMPLOYEES_LIST: 'company/employees',
  EMPLOYEE_SELF_ONBOARDING_START: 'employee/selfOnboarding/start',
} as const

export const companyEvents = {
  COMPANY_ADDRESSES: 'company/addresses',
  COMPANY_ADDRESSE_EDIT: 'company/address/edit',
  COMPANY_INDUSTRY: 'company/industry',
  COMPANY_FEDERAL_TAXES_UPDATED: 'company/federalTaxes/updated',
} as const

export const componentEvents = {
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
  CANCEL: 'CANCEL',
  SUBMIT: 'SUBMIT',
  LOAD_COMPONENT: 'LOAD_COMPONENT',
  NAVIGATE: 'NAVIGATE',
  ...employeeEvents,
  ...companyEvents,
} as const

export type EventType = (typeof componentEvents)[keyof typeof componentEvents]

export const EmployeeOnboardingStatus = {
  ADMIN_ONBOARDING_INCOMPLETE: 'admin_onboarding_incomplete',
  SELF_ONBOARDING_PENDING_INVITE: 'self_onboarding_pending_invite',
  SELF_ONBOARDING_INVITED: 'self_onboarding_invited',
  SELF_ONBOARDING_INVITED_STARTED: 'self_onboarding_invited_started',
  SELF_ONBOARDING_INVITED_OVERDUE: 'self_onboarding_invited_overdue',
  SELF_ONBOARDING_COMPLETED_BY_EMPLOYEE: 'self_onboarding_completed_by_employee',
  SELF_ONBOARDING_AWAITING_ADMIN_REVIEW: 'self_onboarding_awaiting_admin_review',
  ONBOARDING_COMPLETED: 'onboarding_completed',
}
/**Map of API response flsa statuses */
export const FlsaStatus = {
  EXEMPT: 'Exempt',
  SALARIED_NONEXEMPT: 'Salaried Nonexempt',
  NONEXEMPT: 'Nonexempt',
  OWNER: 'Owner',
  COMMISSION_ONLY_EXEMPT: 'Commission Only Exempt',
  COMISSION_ONLY_NONEXEMPT: 'Commission Only Nonexempt',
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
