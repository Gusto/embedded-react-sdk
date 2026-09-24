const title = "Payment";
const addBankAccountCta = "Add bank account";
const editCta = "Edit";
const removeBankAccountCta = "Remove account";
const hamburgerTitle = "Bank account actions";
const bankAccountListLabel = "Contractor bank account";
const nicknameColumn = "Nickname";
const routingNumberColumn = "Routing number";
const accountTypeColumn = "Account type";
const paymentMethodLabel = "Payment method";
const checkLabel = "Check";
const removeBankAccountDialog = { "title": "Remove bank account", "description": "Are you sure you want to remove the bank account {{account}}? The contractor's payment method will revert to Check.", "confirmCta": "Remove", "cancelCta": "Cancel" };
const alerts = { "bankAccountAdded": "Bank account added", "bankAccountRemoved": "Bank account removed" };
const form = { "title": "Add bank account", "nameLabel": "Account nickname", "routingNumberLabel": "Routing number", "routingNumberDescription": "9 digits, on the bottom left of a check", "accountNumberLabel": "Account number", "accountTypeLabel": "Account type", "accountTypeChecking": "Checking", "accountTypeSavings": "Savings", "cancelCta": "Cancel", "saveCta": "Save", "validations": { "name": "Account nickname is required", "routingNumber": "Enter a valid 9-digit routing number", "accountNumber": "Enter a valid account number" } };
const Contractor_Management_PaymentMethod = {
  title,
  addBankAccountCta,
  editCta,
  removeBankAccountCta,
  hamburgerTitle,
  bankAccountListLabel,
  nicknameColumn,
  routingNumberColumn,
  accountTypeColumn,
  paymentMethodLabel,
  checkLabel,
  removeBankAccountDialog,
  alerts,
  form
};
export {
  accountTypeColumn,
  addBankAccountCta,
  alerts,
  bankAccountListLabel,
  checkLabel,
  Contractor_Management_PaymentMethod as default,
  editCta,
  form,
  hamburgerTitle,
  nicknameColumn,
  paymentMethodLabel,
  removeBankAccountCta,
  removeBankAccountDialog,
  routingNumberColumn,
  title
};
