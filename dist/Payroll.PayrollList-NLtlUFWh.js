const emptyState = { "default": { "title": "All payrolls have been processed" }, "filtered": { "title": "No payrolls in this date range", "description": "Try adjusting the date filter to see more payrolls." } };
const title = "Upcoming payroll";
const dateFilter = { "startDate": "From", "endDate": "To", "apply": "Apply", "cancel": "Cancel", "reset": "Reset", "selectDates": "Select dates", "trigger": "Filter by date" };
const payrollsListLabel = "Payrolls";
const runPayrollTitle = "Run Payroll";
const submitPayrollCta = "Review and submit";
const skipPayrollCta = "Skip payroll";
const payrollMenuLabel = "Payroll actions";
const skipPayrollDialog = { "title": "Skip payroll for {{payPeriod}}?", "body": "Before skipping this payroll, check your state's pay frequency laws. If you don't pay the team on time, it could lead to penalties or fines.", "confirmCta": "Yes, skip payroll", "cancelCta": "No, go back" };
const skipSuccessAlert = "Payroll skipped";
const deletePayrollCta = "Cancel payroll";
const deletePayrollDialog = { "title": "Cancel {{payPeriod}} payroll?", "body": "This will permanently remove this off-cycle payroll. Any changes you've made will be lost.", "confirmCta": "Yes, cancel payroll", "cancelCta": "No, go back" };
const deleteSuccessAlert = "Payroll cancelled";
const type = { "External": "External", "Off-Cycle": "Off-Cycle", "Regular": "Regular" };
const tableHeaders = ["Pay period", "Type", "Pay date", "Run by", "Status"];
const offCycleCta = { "title": "Run an off-cycle payroll", "description": "You can pay an employee outside of your normal payroll schedule by running an off-cycle payroll.", "button": "Run off-cycle payroll" };
const Payroll_PayrollList = {
  emptyState,
  title,
  dateFilter,
  payrollsListLabel,
  runPayrollTitle,
  submitPayrollCta,
  skipPayrollCta,
  payrollMenuLabel,
  skipPayrollDialog,
  skipSuccessAlert,
  deletePayrollCta,
  deletePayrollDialog,
  deleteSuccessAlert,
  type,
  tableHeaders,
  offCycleCta
};
export {
  dateFilter,
  Payroll_PayrollList as default,
  deletePayrollCta,
  deletePayrollDialog,
  deleteSuccessAlert,
  emptyState,
  offCycleCta,
  payrollMenuLabel,
  payrollsListLabel,
  runPayrollTitle,
  skipPayrollCta,
  skipPayrollDialog,
  skipSuccessAlert,
  submitPayrollCta,
  tableHeaders,
  title,
  type
};
