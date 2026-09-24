const checkOnlyLabel = "Check-only payroll";
const checkOnlyDescription = "Select this option if all employees will be paid by check only. This allows you to set the check date to today or any future date.";
const startDateLabel = "Start date";
const endDateLabel = "End date";
const checkDateLabel = "Payment date";
const checkDateDescription = "Enter the date you'd like your employees to receive payment.";
const validations = { "startDateRequired": "Start date is required", "endDateRequired": "End date is required", "checkDateRequired": "Payment date is required", "endDateAfterStart": "End date must be on or after start date", "checkDateAchLeadTime_one": "Payment date must be at least {{count}} business day from today for direct deposit", "checkDateAchLeadTime_other": "Payment date must be at least {{count}} business days from today for direct deposit", "checkDateNotPast": "Payment date must be today or a future date" };
const Payroll_OffCyclePayPeriodDateForm = {
  checkOnlyLabel,
  checkOnlyDescription,
  startDateLabel,
  endDateLabel,
  checkDateLabel,
  checkDateDescription,
  validations
};
export {
  checkDateDescription,
  checkDateLabel,
  checkOnlyDescription,
  checkOnlyLabel,
  Payroll_OffCyclePayPeriodDateForm as default,
  endDateLabel,
  startDateLabel,
  validations
};
