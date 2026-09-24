const breadcrumbLabel = "Pay Period";
const pageTitle = "Run dismissal payroll";
const pageDescription = "Select the pay period for the terminated employee's final payroll.";
const selectLabel = "Pay period";
const selectPlaceholder = "Select a pay period";
const continueCta = "Continue";
const emptyState = "There are no unprocessed termination pay periods available.";
const errors = { "missingPayrollId": "Dismissal payroll was created but no payroll ID was returned", "noPayPeriodSelected": "Please select a pay period before continuing", "invalidPayPeriod": "The selected pay period is no longer available" };
const Payroll_Dismissal = {
  breadcrumbLabel,
  pageTitle,
  pageDescription,
  selectLabel,
  selectPlaceholder,
  continueCta,
  emptyState,
  errors
};
export {
  breadcrumbLabel,
  continueCta,
  Payroll_Dismissal as default,
  emptyState,
  errors,
  pageDescription,
  pageTitle,
  selectLabel,
  selectPlaceholder
};
