const title = "Payment";
const splitCta = "Split paycheck";
const addBankAccountCta = "Add bank account";
const addAnotherCta = "Add another bank account";
const bankAccountsListLabel = "List of employee bank accounts";
const nicknameColumn = "Nickname";
const routingNumberColumn = "Routing number";
const accountTypeColumn = "Account type";
const deleteBankAccountCta = "Delete";
const deleteBankAccountDialog = { "title": "Delete bank account", "description": "Are you sure you want to delete the bank account {{account}}?", "confirmCta": "Delete", "cancelCta": "Cancel" };
const hamburgerTitle = "Bank account actions";
const paymentMethodLabel = "Payment method";
const directDepositLabel = "Direct Deposit";
const checkLabel = "Check";
const alerts = { "bankAccountAdded": "Bank account successfully added.", "bankAccountDeleted": "Bank account successfully deleted.", "splitUpdated": "Split payment successfully updated." };
const Employee_Management_PaymentMethod = {
  title,
  splitCta,
  addBankAccountCta,
  addAnotherCta,
  bankAccountsListLabel,
  nicknameColumn,
  routingNumberColumn,
  accountTypeColumn,
  deleteBankAccountCta,
  deleteBankAccountDialog,
  hamburgerTitle,
  paymentMethodLabel,
  directDepositLabel,
  checkLabel,
  alerts
};
export {
  accountTypeColumn,
  addAnotherCta,
  addBankAccountCta,
  alerts,
  bankAccountsListLabel,
  checkLabel,
  Employee_Management_PaymentMethod as default,
  deleteBankAccountCta,
  deleteBankAccountDialog,
  directDepositLabel,
  hamburgerTitle,
  nicknameColumn,
  paymentMethodLabel,
  routingNumberColumn,
  splitCta,
  title
};
