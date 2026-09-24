const pageTitle = "Edit payroll for {{employeeName}}";
const breadcrumbLabel = "{{firstName}} {{lastName}}";
const grossPayLabel = "Gross pay (excluding reimbursements)";
const grossPayLabelMobile = "Gross pay: {{grossPay}} (excluding reimbursements)";
const regularHoursTitle = "Regular hours";
const hoursUnit = "Hours";
const saveCta = "Save";
const cancelCta = "Cancel";
const compensationNames = { "regularHours": "Regular Hours", "overtime": "Overtime", "doubleOvertime": "Double overtime" };
const timeOffTitle = "Time off";
const timeOffTitleDismissal = "Time off hours used this pay period";
const finalPayoutTitle = "Unused time off payout";
const finalPayoutDescription = "Enter the unused hours to pay out on the final paycheck. This is separate from time off hours used during the pay period.";
const timeOffBalance = { "remaining": "{{balance}} remaining" };
const additionalEarningsTitle = "Additional earnings";
const reimbursementTitle = "Reimbursements";
const reimbursementDescriptionLabel = "Description";
const reimbursementDescriptionPlaceholder = "e.g., Office supplies";
const reimbursementAmountLabel = "Amount";
const reimbursementUnnamedFallback = "Reimbursement";
const reimbursementsTableLabel = "Reimbursements";
const reimbursementDescriptionColumn = "Description";
const reimbursementAmountColumn = "Amount";
const reimbursementTypeColumn = "Type";
const reimbursementTypeRecurring = "Recurring";
const reimbursementTypeOneTime = "One-time";
const reimbursementEmptyTitle = "No reimbursements";
const addReimbursementCta = "Add one-time reimbursement";
const addReimbursementLink = "Add one-time reimbursement";
const saveReimbursementCta = "Save reimbursement";
const cancelReimbursementCta = "Cancel reimbursement";
const removeReimbursementLabel = "Remove {{description}} reimbursement";
const recurringReimbursementLabel = "{{description}} (recurring reimbursement)";
const recurringReimbursementTooltip = "Recurring reimbursements are managed outside of payroll.";
const fixedCompensationNames = { "bonus": "Bonus", "paycheckTips": "Paycheck tips", "correctionPayment": "Correction payment", "commission": "Commission", "cashTips": "Cash tips", "reimbursement": "Reimbursement" };
const paymentMethodTitle = "Payment";
const paymentMethodLabel = "Payment method";
const paymentMethodDescription = "Changing the default payment method will only apply to this payroll.";
const paymentMethodOptions = { "directDeposit": "Direct deposit", "check": "Check" };
const validations = { "reimbursementAmount": "Amount must be greater than zero", "negativeAmount": "Amount cannot be negative" };
const Payroll_PayrollEditEmployee = {
  pageTitle,
  breadcrumbLabel,
  grossPayLabel,
  grossPayLabelMobile,
  regularHoursTitle,
  hoursUnit,
  saveCta,
  cancelCta,
  compensationNames,
  timeOffTitle,
  timeOffTitleDismissal,
  finalPayoutTitle,
  finalPayoutDescription,
  timeOffBalance,
  additionalEarningsTitle,
  reimbursementTitle,
  reimbursementDescriptionLabel,
  reimbursementDescriptionPlaceholder,
  reimbursementAmountLabel,
  reimbursementUnnamedFallback,
  reimbursementsTableLabel,
  reimbursementDescriptionColumn,
  reimbursementAmountColumn,
  reimbursementTypeColumn,
  reimbursementTypeRecurring,
  reimbursementTypeOneTime,
  reimbursementEmptyTitle,
  addReimbursementCta,
  addReimbursementLink,
  saveReimbursementCta,
  cancelReimbursementCta,
  removeReimbursementLabel,
  recurringReimbursementLabel,
  recurringReimbursementTooltip,
  fixedCompensationNames,
  paymentMethodTitle,
  paymentMethodLabel,
  paymentMethodDescription,
  paymentMethodOptions,
  validations
};
export {
  addReimbursementCta,
  addReimbursementLink,
  additionalEarningsTitle,
  breadcrumbLabel,
  cancelCta,
  cancelReimbursementCta,
  compensationNames,
  Payroll_PayrollEditEmployee as default,
  finalPayoutDescription,
  finalPayoutTitle,
  fixedCompensationNames,
  grossPayLabel,
  grossPayLabelMobile,
  hoursUnit,
  pageTitle,
  paymentMethodDescription,
  paymentMethodLabel,
  paymentMethodOptions,
  paymentMethodTitle,
  recurringReimbursementLabel,
  recurringReimbursementTooltip,
  regularHoursTitle,
  reimbursementAmountColumn,
  reimbursementAmountLabel,
  reimbursementDescriptionColumn,
  reimbursementDescriptionLabel,
  reimbursementDescriptionPlaceholder,
  reimbursementEmptyTitle,
  reimbursementTitle,
  reimbursementTypeColumn,
  reimbursementTypeOneTime,
  reimbursementTypeRecurring,
  reimbursementUnnamedFallback,
  reimbursementsTableLabel,
  removeReimbursementLabel,
  saveCta,
  saveReimbursementCta,
  timeOffBalance,
  timeOffTitle,
  timeOffTitleDismissal,
  validations
};
