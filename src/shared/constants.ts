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
} as const

export const payScheduleEvents = {
  PAY_SCHEDULE_CREATE: 'paySchedule/create',
  PAY_SCHEDULE_CREATED: 'paySchedule/created',
  PAY_SCHEDULE_UPDATE: 'paySchedule/update',
  PAY_SCHEDULE_UPDATED: 'paySchedule/updated',
  PAY_SCHEDULE_DELETE: 'paySchedule/delete',
  PAY_SCHEDULE_DELETED: 'paySchedule/deleted',
} as const

export const componentEvents = {
  ROBOT_MACHINE_DONE: 'done', //This is internal Robot event thrown when machine transitions to final state
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
  CANCEL: 'CANCEL',
  SUBMIT: 'SUBMIT',
  LOAD_COMPONENT: 'LOAD_COMPONENT',
  NAVIGATE: 'NAVIGATE',
  ...employeeEvents,
  ...companyEvents,
  ...payScheduleEvents,
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
} as const

export const EmployeeSelfOnboardingStatuses = new Set([
  EmployeeOnboardingStatus.SELF_ONBOARDING_INVITED,
  EmployeeOnboardingStatus.SELF_ONBOARDING_INVITED_STARTED,
  EmployeeOnboardingStatus.SELF_ONBOARDING_INVITED_OVERDUE,
])
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
