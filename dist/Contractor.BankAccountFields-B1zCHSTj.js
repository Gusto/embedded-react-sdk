const nameLabel = "Account nickname";
const routingNumberLabel = "Routing number";
const routingNumberDescription = "9 digits, on the bottom left of a check";
const accountNumberLabel = "Account number";
const accountTypeLabel = "Account type";
const accountTypeChecking = "Checking";
const accountTypeSavings = "Savings";
const cancelCta = "Cancel";
const saveCta = "Save";
const validations = { "accountName": "Account nickname is required", "routingNumber": "Enter a valid 9-digit routing number", "accountNumber": "Enter a valid account number", "accountNumberFormat": "Enter a valid account number" };
const Contractor_BankAccountFields = {
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
  Contractor_BankAccountFields as default,
  nameLabel,
  routingNumberDescription,
  routingNumberLabel,
  saveCta,
  validations
};
