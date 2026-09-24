const breadcrumbLabel = "Submit";
const backCta = "Back";
const exitFlowCta = "Save and exit";
const overviewTitle = "Review payroll";
const summaryTitle = "Payroll summary";
const pageSubtitle = "{{payrollType}} payroll for <dateWrapper>{{startDate}} - {{endDate}}</dateWrapper>";
const pageSubtitleDismissal = "{{payrollType}} payroll";
const submitCta = "Submit";
const editCta = "Edit";
const cancelCta = "Cancel payroll";
const cancelDialogTitle = "Cancel {{startDate}} - {{endDate}} payroll?";
const cancelDialogTitleDismissal = "Cancel payroll?";
const cancelDialogDescription = "You may cancel this payroll and run it again later. Your changes will be saved.";
const cancelDialogDescriptionDeadline = "Run this payroll by {{deadline}} to pay your employees on time.";
const confirmCancelCta = "Yes, cancel payroll";
const declineCancelCta = "No, go back";
const payrollReceiptCta = "View payroll receipt";
const downloadPaystubLabel = "Download paystub pdf";
const downloadLoadingMessage = "Generating paystub…";
const loadingTitle = "Submitting payroll...";
const loadingDescription = "This may take a minute or two. You can navigate away while this happens.";
const dataLoadingTitle = "Loading payroll...";
const cancellingTitle = "Cancelling payroll...";
const cancelledEmptyState = "This payroll has been cancelled.";
const skippedBadge = "Skipped";
const alerts = { "payrollNotCalculated": "Payroll is not calculated", "payrollLoadFailed": "There was an issue loading this payroll. Please try again.", "directDepositDeadline": "To pay your employees with direct deposit by {{payDate}}, you'll need to run payroll by {{time}} on {{date}}.", "directDepositDeadlineText": "Make sure to submit before the deadline to ensure timely payments.", "paystubPdfError": "There was an issue generating the paystub PDF. Please try again later.", "payrollProcessedTitle": "Payroll submitted", "payrollProcessedMessage": "{{amount}} will be debited on {{date}}. Make sure you have these funds available.", "payrollProcessingFailedTitle": "There was an error submitting payroll", "payrollProcessingFailedCtaLabel": "Recalculate payroll", "wireDetailsSubmittedTitle": "Wire details submitted", "wireDetailsSubmittedMessage": "Once we receive the funds from your bank we'll pay your team on {{checkDate}}" };
const payrollSummaryTitle = "Payroll Summary";
const payrollSummaryTitleWire = "Payroll summary (Wire funds)";
const payrollSummaryTitleFourDay = "Payroll summary (4-day direct deposit)";
const payrollSummaryLabel = "Payroll summary table";
const dataViews = { "label": "Payroll details", "companyPaysTab": "Company pays", "companyPaysTable": "Company pays by employee", "hoursWorkedTab": "Hours worked", "hoursWorkedTable": "Hours worked by employee", "employeeTakeHomeTab": "Employee take home", "employeeTakeHomeTable": "Employee take home by employee", "taxesTab": "Taxed and debited", "taxesTable": "Taxes breakdown", "debitedTable": "Debited totals by company" };
const tableHeaders = { "totalPayroll": "Total payroll", "debitAmount": "Debit amount", "wireAmount": "Wire amount", "wireTransferDeadline": "Wire transfer deadline", "employees": "Employees", "grossPay": "Gross Pay", "reimbursements": "Reimbursements", "debitAccount": "Debit account", "debitDate": "Debit date", "employeePayDate": "Employee pay date", "companyTaxes": "Company taxes", "companyBenefits": "Company benefits", "companyPays": "Company pays", "compensationType": "Compensation type", "regular": "Regular", "overtime": "Overtime (1.5x)", "doubleOT": "Overtime (2x)", "timeOff": "Paid time off", "totalHours": "Total hours", "paymentType": "Payment type", "employeeTaxes": "Employee taxes", "employeeBenefits": "Employee benefits", "payment": "Payment", "deductions": "Deductions", "taxDescription": "Tax description", "byYourEmployees": "By your employees", "byYourCompany": "By your company", "debitedByGusto": "Debited by Gusto", "taxesTotal": "Total", "paystub": "Paystub", "footerTotalsLabel": "Totals", "footerTotalsDescription": "All employees in this payroll" };
const totalsLabel = "Totals";
const directDepositLabel = "Direct deposits";
const reimbursementLabel = "Reimbursements";
const garnishmentsLabel = "Garnishments";
const taxesLabel = "Taxes (Employees and Employers)";
const compensationTypeLabels = { "exempt": "Salaried / Exempt", "nonexempt": "Hourly / Nonexempt" };
const submissionBlockers = { "genericBlockerTitle": "Submission blocked", "genericBlockerMessage": "This payroll cannot be submitted. Please contact support for assistance.", "fastAchOptions": { "description": "Payroll can still be funded by selecting one of the options below. The selected funding method will only be used for this cycle and will not apply to future payroll.", "fundingOptionsLabel": "Funding options", "wireLabel": "Wire funds", "wireFastestBadge": "Fastest", "wireDescription": "Pay your employees on time by sending a wire transfer. We'll provide instructions on the next step.", "directDepositLabel": "Switch to 4-day direct deposit", "directDepositDescription": "Delay your employees pay date by four days and process using regular debits.", "employeePayDate": "Employee pay date: {{date}}" }, "fast_ach_threshold_exceeded": { "title": "You have exceeded the limit at which you can process {{days}} payroll." }, "needs_earned_access_for_fast_ach": { "title": "You have not yet earned access to faster payroll." } };
const Payroll_PayrollOverview = {
  breadcrumbLabel,
  backCta,
  exitFlowCta,
  overviewTitle,
  summaryTitle,
  pageSubtitle,
  pageSubtitleDismissal,
  submitCta,
  editCta,
  cancelCta,
  cancelDialogTitle,
  cancelDialogTitleDismissal,
  cancelDialogDescription,
  cancelDialogDescriptionDeadline,
  confirmCancelCta,
  declineCancelCta,
  payrollReceiptCta,
  downloadPaystubLabel,
  downloadLoadingMessage,
  loadingTitle,
  loadingDescription,
  dataLoadingTitle,
  cancellingTitle,
  cancelledEmptyState,
  skippedBadge,
  alerts,
  payrollSummaryTitle,
  payrollSummaryTitleWire,
  payrollSummaryTitleFourDay,
  payrollSummaryLabel,
  dataViews,
  tableHeaders,
  totalsLabel,
  directDepositLabel,
  reimbursementLabel,
  garnishmentsLabel,
  taxesLabel,
  compensationTypeLabels,
  submissionBlockers
};
export {
  alerts,
  backCta,
  breadcrumbLabel,
  cancelCta,
  cancelDialogDescription,
  cancelDialogDescriptionDeadline,
  cancelDialogTitle,
  cancelDialogTitleDismissal,
  cancelledEmptyState,
  cancellingTitle,
  compensationTypeLabels,
  confirmCancelCta,
  dataLoadingTitle,
  dataViews,
  declineCancelCta,
  Payroll_PayrollOverview as default,
  directDepositLabel,
  downloadLoadingMessage,
  downloadPaystubLabel,
  editCta,
  exitFlowCta,
  garnishmentsLabel,
  loadingDescription,
  loadingTitle,
  overviewTitle,
  pageSubtitle,
  pageSubtitleDismissal,
  payrollReceiptCta,
  payrollSummaryLabel,
  payrollSummaryTitle,
  payrollSummaryTitleFourDay,
  payrollSummaryTitleWire,
  reimbursementLabel,
  skippedBadge,
  submissionBlockers,
  submitCta,
  summaryTitle,
  tableHeaders,
  taxesLabel,
  totalsLabel
};
