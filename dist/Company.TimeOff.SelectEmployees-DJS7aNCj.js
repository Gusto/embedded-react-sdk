const title = "Add employees to policy";
const description = "Select the employees you want to add to this policy.";
const holidayDescription = "Select the employees you want to add to this holiday pay policy.";
const reassignmentWarning = "Any employees currently assigned to another paid time off policy will be moved to this policy.";
const departmentColumn = "Department";
const startingBalanceColumn = "Starting balance (hrs)";
const backCta = "Back";
const continueCta = "Continue";
const emptyState = "All eligible employees have already been added to this policy.";
const errors = { "completePolicyFailed": "Unable to complete this policy. {{details}}" };
const Company_TimeOff_SelectEmployees = {
  title,
  description,
  holidayDescription,
  reassignmentWarning,
  departmentColumn,
  startingBalanceColumn,
  backCta,
  continueCta,
  emptyState,
  errors
};
export {
  backCta,
  continueCta,
  Company_TimeOff_SelectEmployees as default,
  departmentColumn,
  description,
  emptyState,
  errors,
  holidayDescription,
  reassignmentWarning,
  startingBalanceColumn,
  title
};
