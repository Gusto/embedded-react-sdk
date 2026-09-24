const tabs = { "employees": "Employees" };
const backLabel = "Back to policies";
const employeeActions = "Actions for {{name}}";
const emptyEmployees = { "title": "No employees have been added to this policy", "addEmployeeCta": "Add employee" };
const removeEmployeeDialog = { "title": "Remove {{name}}", "description": "Are you sure you want to remove {{name}} from this policy?", "confirmCta": "Remove", "cancelCta": "Cancel" };
const Company_TimeOff_PolicyDetail = {
  tabs,
  backLabel,
  employeeActions,
  emptyEmployees,
  removeEmployeeDialog
};
export {
  backLabel,
  Company_TimeOff_PolicyDetail as default,
  employeeActions,
  emptyEmployees,
  removeEmployeeDialog,
  tabs
};
