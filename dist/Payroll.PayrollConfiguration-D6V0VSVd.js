const pageTitle = "Edit Payroll";
const description = "{{payrollType}} payroll for <dateWrapper>{{startDate}} - {{endDate}}</dateWrapper>";
const descriptionDismissal = "{{payrollType}} payroll";
const breadcrumbLabel = "Edit Payroll for {{startDate}} - {{endDate}}";
const breadcrumbLabelDismissal = "Edit Dismissal Payroll";
const exitFlowCta = "Save and exit";
const calculatePayroll = "Calculate and review";
const calculatePayrollTitle = "Calculate and review";
const hoursAndEarningsTitle = "Hours and additional earnings";
const hoursAndEarningsDescription = "Review and update your employee's hours, reimbursements, and additional earnings below.";
const employeeCompensationsTitle = "Employee compensations";
const tableColumns = { "employees": "Employees", "hours": "Hours", "timeOff": "Time off", "additionalEarnings": "Additional earnings", "reimbursements": "Reimbursements", "totalPay": "Total pay" };
const skippedBadge = "Skipped";
const unknownEmployeeFallback = "Unknown employee";
const editMenu = { "edit": "Edit", "skip": "Skip employee", "unskip": "Unskip employee", "setNetEarnings": "Set employee net earnings" };
const alerts = { "alreadyProcessed": "This payroll is already processed. If you'd like to make changes, please cancel and re-run it.", "progressSaved": "Your progress has been saved", "directDepositDeadline": "To pay your employees with direct deposit by {{payDate}}, you'll need to run payroll by {{time}} on {{date}}.", "directDepositDeadlineText": "Make sure to submit before the deadline to ensure timely payments.", "payrollLate": "Your original pay date was {{initialCheckDate}}", "payrollLateText": "Run payroll before {{time}} on {{date}} to pay your employees on {{newCheckDate}}.", "payrollDeadline": { "label": "Payroll Deadline", "message": "To pay your employees with direct deposit by the check date, you'll need to run payroll by the deadline." }, "skippedEmployees": { "label": "Skipped Employees", "employeeAddressNotVerified": "Employee address not verified" }, "employeeUpdated": { "label": "{{employeeName}} updated successfully" }, "processingFailed": { "label": "This payroll couldn't be calculated", "message": "Please try calculating again." } };
const loadingTitle = "Preparing payroll...";
const loadingDescription = "This may take a minute or two. You can navigate away while this happens.";
const calculatingTitle = "Calculating payroll...";
const calculatingDescription = "This may take a minute or two. You can navigate away while this happens.";
const calculatingPayroll = "Calculating payroll...";
const Payroll_PayrollConfiguration = {
  pageTitle,
  description,
  descriptionDismissal,
  breadcrumbLabel,
  breadcrumbLabelDismissal,
  exitFlowCta,
  calculatePayroll,
  calculatePayrollTitle,
  hoursAndEarningsTitle,
  hoursAndEarningsDescription,
  employeeCompensationsTitle,
  tableColumns,
  skippedBadge,
  unknownEmployeeFallback,
  editMenu,
  alerts,
  loadingTitle,
  loadingDescription,
  calculatingTitle,
  calculatingDescription,
  calculatingPayroll
};
export {
  alerts,
  breadcrumbLabel,
  breadcrumbLabelDismissal,
  calculatePayroll,
  calculatePayrollTitle,
  calculatingDescription,
  calculatingPayroll,
  calculatingTitle,
  Payroll_PayrollConfiguration as default,
  description,
  descriptionDismissal,
  editMenu,
  employeeCompensationsTitle,
  exitFlowCta,
  hoursAndEarningsDescription,
  hoursAndEarningsTitle,
  loadingDescription,
  loadingTitle,
  pageTitle,
  skippedBadge,
  tableColumns,
  unknownEmployeeFallback
};
