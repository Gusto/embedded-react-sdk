const backButton = "Back";
const select = { "heading": "Record a historical payment", "subtitle": "Log a contractor payment that already happened outside Gusto. Pick a paid date and the contractors you paid.", "dateLabel": "Payment date", "dateInFutureError": "You cannot issue historical payments for the future. Please choose a date in the past.", "dateTooEarlyError": "You cannot create a payment in {{year}}. Please select a {{allowedYear}} date.", "continueButton": "Continue" };
const amounts = { "heading": "Enter payment amounts", "subtitle": "Enter the hours or wage paid to each contractor along with any bonuses and reimbursements.", "continueButton": "Continue" };
const hoursAndPaymentsLabel = "Hours and payments";
const contractorTableHeaders = { "contractor": "Contractor", "wageType": "Wage", "paymentMethod": "Payment method", "hours": "Hours", "wage": "Fixed amount", "bonus": "Bonus", "reimbursement": "Reimbursement", "total": "Total" };
const emptyTableTitle = "No contractors selected";
const emptyTableDescription = "Select at least one contractor to record a payment.";
const na = "N/A";
const totalsLabel = "Totals";
const editContractor = "Edit contractor payment";
const perHour = "/hr";
const wageTypes = { "fixed": "Fixed", "hourly": "Hourly" };
const paymentMethods = { "directDeposit": "Direct Deposit", "check": "Check", "historicalPayment": "Historical Payment" };
const alerts = { "contractorPaymentUpdated": "Pay updated for {{contractorName}}" };
const editContractorPayment = { "title": "Edit contractor pay", "subtitle": `Edit contractor's hours, additional earnings, and reimbursements. Inputs not applicable to this contractor are disabled. Please click "Done" to apply the change.`, "hoursLabel": "Hours", "hoursAdornment": "hrs", "hoursPayDescription": "{{rate}}/hr × hours = {{total}}", "wageLabel": "Fixed amount", "bonusLabel": "Bonus", "reimbursementLabel": "Reimbursement", "paymentMethodLabel": "Payment Method", "cancelCta": "Cancel", "saveCta": "Done", "paymentMethods": { "check": "Check", "directDeposit": "Direct deposit", "historicalPayment": "Historical payment" }, "errors": { "directDepositNotAvailable": "Direct Deposit is not available for contractors set up for Check payments", "unsupportedPaymentMethod": "This payment method is not supported. Please select Check or Direct Deposit." } };
const review = { "title": "Review and submit", "subtitle": "Historical payment for {{checkDate}}", "submitButton": "Submit historical payment", "successTitle": "Historical payment recorded successfully", "successMessage": "This payment has been recorded. View it from the payments list to see its full details.", "paymentSummaryTitle": "Payment Summary", "totalAmount": "Total Amount", "contractorPayDate": "Contractor Pay Date", "contractorPaymentsTitle": "Contractor Payments", "contractor": "Contractor", "wageType": "Wage Type", "paymentMethod": "Payment Method", "paymentMethods": { "directDeposit": "Direct Deposit", "check": "Check", "historicalPayment": "Historical Payment" }, "hours": "Hours", "wage": "Wage", "bonus": "Bonus", "reimbursement": "Reimbursement", "total": "Total", "totalsLabel": "Totals", "notAvailable": "N/A" };
const Contractor_Payments_CreateHistoricalPayment = {
  backButton,
  select,
  amounts,
  hoursAndPaymentsLabel,
  contractorTableHeaders,
  emptyTableTitle,
  emptyTableDescription,
  na,
  totalsLabel,
  editContractor,
  perHour,
  wageTypes,
  paymentMethods,
  alerts,
  editContractorPayment,
  review
};
export {
  alerts,
  amounts,
  backButton,
  contractorTableHeaders,
  Contractor_Payments_CreateHistoricalPayment as default,
  editContractor,
  editContractorPayment,
  emptyTableDescription,
  emptyTableTitle,
  hoursAndPaymentsLabel,
  na,
  paymentMethods,
  perHour,
  review,
  select,
  totalsLabel,
  wageTypes
};
