const tabs = { "runPayroll": "Run payroll", "payrollHistory": "Payroll history" };
const aria = { "tabNavigation": "Payroll navigation" };
const labels = { "loading": "Loading payroll data..." };
const breadcrumbs = { "landing": "Run payroll", "overview": "Summary for {{startDate}}-{{endDate}}", "receipt": "Payroll receipt for {{startDate}}-{{endDate}}" };
const alerts = { "payrollCancelled": "Payroll cancelled" };
const Payroll_PayrollLanding = {
  tabs,
  aria,
  labels,
  breadcrumbs,
  alerts
};
export {
  alerts,
  aria,
  breadcrumbs,
  Payroll_PayrollLanding as default,
  labels,
  tabs
};
