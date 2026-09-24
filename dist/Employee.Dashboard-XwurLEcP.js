const employeeRoleLabel = "Employee";
const tabsLabel = "Employee dashboard tabs";
const tabs = { "basicDetails": "Basic details", "jobAndPay": "Job and pay", "taxes": "Taxes", "documents": "Documents" };
const alerts = { "bankAccountAdded": "Bank account successfully added.", "bankAccountDeleted": "Bank account successfully deleted.", "splitUpdated": "Split payment successfully updated.", "deductionAdded": "Deduction successfully added.", "deductionUpdated": "Deduction successfully updated.", "deductionDeleted": "Deduction successfully deleted.", "jobAdded": "Job successfully added.", "profileUpdated": "Profile updated", "federalTaxesUpdated": "Federal tax settings successfully updated.", "stateTaxesUpdated": "Successfully updated state tax settings." };
const Employee_Dashboard = {
  employeeRoleLabel,
  tabsLabel,
  tabs,
  alerts
};
export {
  alerts,
  Employee_Dashboard as default,
  employeeRoleLabel,
  tabs,
  tabsLabel
};
