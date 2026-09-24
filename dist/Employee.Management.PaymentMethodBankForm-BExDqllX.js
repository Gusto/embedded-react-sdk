const title = "Add bank account";
const nameLabel = "Account nickname";
const routingNumberLabel = "Routing number";
const routingNumberDescription = "(9 digits)";
const accountNumberLabel = "Account number";
const accountTypeLabel = "Account type";
const accountTypeChecking = "Checking";
const accountTypeSavings = "Savings";
const cancelCta = "Cancel";
const saveCta = "Save";
const validations = { "accountName": "Account name is required", "routingNumber": "Routing number should be a number (9 digits)", "accountNumber": "Account number is a required field", "accountNumberFormat": "Account number should contain only digits (up to 17)" };
const Employee_Management_PaymentMethodBankForm = {
  title,
  nameLabel,
  routingNumberLabel,
  routingNumberDescription,
  accountNumberLabel,
  accountTypeLabel,
  accountTypeChecking,
  accountTypeSavings,
  cancelCta,
  saveCta,
  validations
};
export {
  accountNumberLabel,
  accountTypeChecking,
  accountTypeLabel,
  accountTypeSavings,
  cancelCta,
  Employee_Management_PaymentMethodBankForm as default,
  nameLabel,
  routingNumberDescription,
  routingNumberLabel,
  saveCta,
  title,
  validations
};
