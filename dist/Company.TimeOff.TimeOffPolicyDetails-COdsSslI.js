const breadcrumb = "Time off policies";
const addEmployeeCta = "Add employee";
const subtitle = { "vacation": "Paid time off policy", "sick": "Sick leave policy" };
const tabs = { "employees": "Employees", "policyDetails": "Policy details" };
const details = "Details";
const editPolicyCta = "Edit policy";
const policyType = { "label": "Policy type", "vacation": "Paid time off", "sick": "Sick leave", "custom": "Custom policy", "parentalLeave": "Parental leave", "weather": "Weather policy", "volunteer": "Volunteer policy", "personalDay": "Personal day", "learningAndDevelopment": "Learning and development", "juryDuty": "Jury duty", "floatingHoliday": "Floating holiday", "bereavement": "Bereavement" };
const policyName = "Policy name";
const accrualRateTitle = "Accrual rate";
const accrualMethod = { "label": "Accrual type", "unlimited": "Unlimited", "perPayPeriod": "Fixed", "perCalendarYear": "Fixed", "perAnniversaryYear": "Fixed", "perHourWorked": "Based on hours worked", "perHourWorkedNoOvertime": "Based on hours worked", "perHourPaid": "Based on hours worked", "perHourPaidNoOvertime": "Based on hours worked" };
const accrualRate = { "label": "Accrual rate", "unlimited": "-", "perPayPeriod": "{{accrualRate}} hour(s) per pay period", "perCalendarYear": "{{accrualRate}} hour(s) per calendar year", "perAnniversaryYear": "{{accrualRate}} hour(s) per anniversary year", "perHourWorked": "{{accrualRate}} hour(s) for every {{accrualRateUnit}} hour(s) worked, including overtime", "perHourWorkedNoOvertime": "{{accrualRate}} hour(s) for every {{accrualRateUnit}} hour(s) worked, excluding overtime", "perHourPaid": "{{accrualRate}} hour(s) for every {{accrualRateUnit}} hour(s) including overtime and all paid hours", "perHourPaidNoOvertime": "{{accrualRate}} hour(s) for every {{accrualRateUnit}} hour(s) worked and all paid hours, excluding overtime" };
const resetDate = "Reset date";
const policySettingsTitle = "Policy settings";
const changeSettingsCta = "Change";
const maxAccrualHoursPerYear = { "label": "Accrual maximum", "noMaximum": "No maximum", "withMaximum": "{{count}} hour(s) per year" };
const maxHours = { "label": "Balance maximum", "noMaximum": "No maximum", "withMaximum": "{{count}} hour(s)" };
const carryoverLimitHours = { "label": "Carry over limit", "noLimit": "No carry over limit", "withLimit": "{{count}} hour(s)" };
const accrualWaitingPeriodDays = { "label": "Waiting period", "noPeriod": "No waiting period", "withPeriod": "{{count}} day(s)" };
const paidOutOnTermination = { "label": "Paid out on termination", "yes": "Yes, remaining time off balances for this policy are paid out when an employee is dismissed.", "no": "No, remaining time off balances for this policy are not paid out when an employee is dismissed." };
const employeeTable = { "balance": "Balance (hrs)", "actions": "Actions", "editBalance": "Edit balance", "removeEmployee": "Remove employee" };
const addEmployeeModal = { "title": "Add employee to this policy", "description": "Select the employees to add to this policy. Employees not shown are either already included or not eligible." };
const editBalanceModal = { "title": "Edit {{name}} time off balance", "balanceLabel": "Balance (hrs)", "currentBalance": "Current balance", "hoursUnit": "hours", "cancelCta": "Cancel", "updateCta": "Update balance", "errors": { "balanceExceedsMax": "Balance cannot exceed the policy maximum of {{max}} hours. Reduce the balance or increase the policy's balance maximum.", "updateFailed": "Unable to update balance. Please try again." } };
const removeEmployeeModal = { "title": "Remove {{name}} from policy?", "alert": "When you remove an employee from a policy, any existing balance is removed.", "removeCta": "Remove employee" };
const removeEmployeesModal = { "title": "Remove {{count}} employee(s) from policy?", "alert": "When you remove an employee from a policy, any existing balance is removed.", "removeCta": "Remove employees" };
const flash = { "employeeRemoved": "{{name}} has been removed from the policy.", "employeesAdded_one": "{{count}} employee has been added to this policy.", "employeesAdded_other": "{{count}} employees have been added to this policy.", "balanceUpdated": "{{name}}'s time off balance has been updated." };
const Company_TimeOff_TimeOffPolicyDetails = {
  breadcrumb,
  addEmployeeCta,
  subtitle,
  tabs,
  details,
  editPolicyCta,
  policyType,
  policyName,
  accrualRateTitle,
  accrualMethod,
  accrualRate,
  resetDate,
  policySettingsTitle,
  changeSettingsCta,
  maxAccrualHoursPerYear,
  maxHours,
  carryoverLimitHours,
  accrualWaitingPeriodDays,
  paidOutOnTermination,
  employeeTable,
  addEmployeeModal,
  editBalanceModal,
  removeEmployeeModal,
  removeEmployeesModal,
  flash
};
export {
  accrualMethod,
  accrualRate,
  accrualRateTitle,
  accrualWaitingPeriodDays,
  addEmployeeCta,
  addEmployeeModal,
  breadcrumb,
  carryoverLimitHours,
  changeSettingsCta,
  Company_TimeOff_TimeOffPolicyDetails as default,
  details,
  editBalanceModal,
  editPolicyCta,
  employeeTable,
  flash,
  maxAccrualHoursPerYear,
  maxHours,
  paidOutOnTermination,
  policyName,
  policySettingsTitle,
  policyType,
  removeEmployeeModal,
  removeEmployeesModal,
  resetDate,
  subtitle,
  tabs
};
