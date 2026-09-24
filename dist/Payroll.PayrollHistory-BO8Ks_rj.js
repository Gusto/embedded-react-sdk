const title = "Payroll history";
const dateFilter = { "startDate": "From", "endDate": "To", "apply": "Apply", "cancel": "Cancel", "reset": "Reset", "selectDates": "Select dates", "trigger": "Filter by date" };
const dataView = { "label": "Payroll history" };
const columns = { "payPeriod": "Pay period", "type": "Type", "payDate": "Pay date", "status": "Status", "totalPayroll": "Total payroll" };
const menu = { "viewSummary": "View payroll summary", "viewReceipt": "View payroll receipt", "cancelPayroll": "Cancel payroll" };
const emptyState = { "default": { "title": "No payroll history", "description": "When you run payrolls, they'll appear here for easy reference." }, "filtered": { "title": "No payrolls in this date range", "description": "Try adjusting the date filter to see more payrolls." } };
const labels = { "noAmount": "—" };
const cancelDialog = { "title": "Cancel {{payPeriod}} payroll?", "body": "You may cancel this payroll and run it again later. Your changes will be saved.", "deadline": "Run this payroll by {{deadline}} to pay your employees on time.", "primaryAction": "Yes, cancel payroll", "secondaryAction": "No, go back" };
const Payroll_PayrollHistory = {
  title,
  dateFilter,
  dataView,
  columns,
  menu,
  emptyState,
  labels,
  cancelDialog
};
export {
  cancelDialog,
  columns,
  dataView,
  dateFilter,
  Payroll_PayrollHistory as default,
  emptyState,
  labels,
  menu,
  title
};
