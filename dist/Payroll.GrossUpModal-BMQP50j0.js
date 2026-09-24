const title = "Enter a net amount";
const description = "Please enter the net amount you want this employee to receive. We'll then automatically calculate the gross amount you need to pay, including taxes and deductions.";
const warning = "This will override any previously entered amounts.";
const netPayLabel = "Net amount";
const calculateCta = "Calculate";
const calculatingCta = "Calculating...";
const applyCta = "Apply";
const applyHint = "Calculate a gross amount first to apply it.";
const cancelCta = "Cancel";
const grossPayResult = "Calculated gross pay";
const errorMessage = "Unable to calculate gross up. Please try again.";
const validations = { "netPay": "Net amount must be greater than zero cents" };
const Payroll_GrossUpModal = {
  title,
  description,
  warning,
  netPayLabel,
  calculateCta,
  calculatingCta,
  applyCta,
  applyHint,
  cancelCta,
  grossPayResult,
  errorMessage,
  validations
};
export {
  applyCta,
  applyHint,
  calculateCta,
  calculatingCta,
  cancelCta,
  Payroll_GrossUpModal as default,
  description,
  errorMessage,
  grossPayResult,
  netPayLabel,
  title,
  validations,
  warning
};
