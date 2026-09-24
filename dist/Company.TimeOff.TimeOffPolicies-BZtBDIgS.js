const pageTitle = "Time Off Policies";
const createPolicyCta = "Create policy";
const tableHeaders = { "name": "Name", "enrolled": "Enrolled" };
const tableLabel = "Time off policies";
const actions = { "viewPolicy": "View policy", "deletePolicy": "Delete policy", "menuTrigger": "Actions for {{name}}", "menuFor": "Actions for {{name}}" };
const finishSetupCta = "Finish setup";
const allEmployeesLabel = "All employees";
const enrolledDash = "–";
const employeeCount_one = "{{count}} employee";
const employeeCount_other = "{{count}} employees";
const incompleteBadge = "Incomplete";
const holidayPayPolicy = "Holiday pay policy";
const deletePolicyDialog = { "title": 'Are you sure you want to delete the policy "{{name}}"?', "description": 'This will delete the policy "{{name}}" and all associated time off requests.', "confirmCta": "Delete policy", "cancelCta": "Cancel" };
const deleteHolidayDialog = { "title": "Are you sure you want to delete the company holiday pay policy?", "description": "This will delete the company holiday pay policy." };
const emptyState = { "heading": "You don't have any time off policies", "body": "Manage employee time off by creating a policy." };
const flash = { "policyDeleted": 'Policy "{{name}}" deleted successfully', "holidayDeleted": "Holiday pay policy deleted successfully", "invalidPolicyType": "Please select a valid policy type." };
const errors = { "pendingRequestsBlockDeletion": '"{{name}}" has pending or approved time off requests. Please decline or cancel those requests before deleting this policy.', "deleteFailed": "Unable to delete this policy. Please try again." };
const Company_TimeOff_TimeOffPolicies = {
  pageTitle,
  createPolicyCta,
  tableHeaders,
  tableLabel,
  actions,
  finishSetupCta,
  allEmployeesLabel,
  enrolledDash,
  employeeCount_one,
  employeeCount_other,
  incompleteBadge,
  holidayPayPolicy,
  deletePolicyDialog,
  deleteHolidayDialog,
  emptyState,
  flash,
  errors
};
export {
  actions,
  allEmployeesLabel,
  createPolicyCta,
  Company_TimeOff_TimeOffPolicies as default,
  deleteHolidayDialog,
  deletePolicyDialog,
  employeeCount_one,
  employeeCount_other,
  emptyState,
  enrolledDash,
  errors,
  finishSetupCta,
  flash,
  holidayPayPolicy,
  incompleteBadge,
  pageTitle,
  tableHeaders,
  tableLabel
};
