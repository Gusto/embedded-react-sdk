const accountNumberLabel = "Account number";
const accountTypeColumn = "Account type";
const accountTypeLabel = "Account type";
const accountTypeChecking = "Checking";
const accountTypeSavings = "Savings";
const allocationColumn = "Allocation";
const actionColumn = "Bank account actions";
const addAnotherCta = "+ Add another bank account";
const addBankAccountCta = "Add bank account";
const addBankAccountFormTitle = "Add bank account";
const bankAccountsListLabel = "List of employee bank accounts";
const cancelCta = "Back";
const saveCta = "Save";
const cancelAddCta = "Cancel";
const checkDescription = "If you select check as the payment method, you'll need to write a physical check to this employee each payday.";
const checkDescriptionSelf = "If you select check as the payment method, you'll receive a physical check.";
const checkLabel = "Check";
const deleteBankAccountCta = "Delete";
const deleteBankAccountDialog = { "title": "Delete bank account", "description": "Are you sure you want to delete the bank account {{account}}?", "confirmCta": "Delete", "cancelCta": "Cancel" };
const deleteBankAccountSuccessAlert = "Bank account {{account}} was removed";
const directDepositDescription = "We recommend direct deposit — we can deposit paychecks directly into your employees' bank accounts.";
const directDepositDescriptionSelf = "We recommend direct deposit — we can deposit paychecks directly into your account.";
const directDepositLabel = "Direct Deposit";
const hamburgerTitle = "Bank account actions";
const nameLabel = "Account nickname";
const nicknameColumn = "Nickname";
const paymentFieldsetLegend = "Select payment method";
const routingNumberColumn = "Routing number";
const routingNumberLabel = "Routing number";
const routingNumberDescription = "(9 digits)";
const splitCta = "Split paycheck";
const submitCta = "Continue";
const title = "Payment method";
const amountLabel = "Fixed amount";
const splitDescription = "You can split your paycheck into different accounts by percentage or flat dollar amounts. When splitting by amount, you can reorder the priority of the bank accounts by clicking and dragging the list icon to the left of the bank account field. We’ll pay the amounts in the order specified until your salary has been fully distributed to the last “remainder” account.";
const draggableListLabel = "Reorderable list of bank accounts";
const percentageLabel = "Percentage";
const splitAmountLabel = "{{name}} ({{account_number}})";
const splitByLabel = "Split by";
const priorityLabel = "Priority";
const remainderLabel = "Remainder";
const splitTitle = "Split employee paycheck";
const priority_one = "{{count}}st";
const priority_two = "{{count}}nd";
const priority_few = "{{count}}rd";
const priority_other = "{{count}}th";
const managementTitle = "Payment";
const paymentMethodLabel = "Payment method";
const bankFormSuccessAlert = "Bank account was successfully added";
const splitViewSuccessAlert = "Payment split was successfully updated";
const validations = { "percentageError": "If payment method amount is split by Percentage, all split amounts must add up to exactly 100.", "percentageErrorWithTotal": "Splits must total 100%. Currently {{total}}%.", "percentageAmountError": "Percentage should be a whole number between 0 and 100", "amountError": "Please enter valid amount", "accountName": "Account name is required", "routingNumber": "Routing number should be a number (9 digits)", "accountNumber": "Account number is a required field", "accountNumberFormat": "Account number should contain only digits (up to 17)" };
const Employee_PaymentMethod = {
  accountNumberLabel,
  accountTypeColumn,
  accountTypeLabel,
  accountTypeChecking,
  accountTypeSavings,
  allocationColumn,
  actionColumn,
  addAnotherCta,
  addBankAccountCta,
  addBankAccountFormTitle,
  bankAccountsListLabel,
  cancelCta,
  saveCta,
  cancelAddCta,
  checkDescription,
  checkDescriptionSelf,
  checkLabel,
  deleteBankAccountCta,
  deleteBankAccountDialog,
  deleteBankAccountSuccessAlert,
  directDepositDescription,
  directDepositDescriptionSelf,
  directDepositLabel,
  hamburgerTitle,
  nameLabel,
  nicknameColumn,
  paymentFieldsetLegend,
  routingNumberColumn,
  routingNumberLabel,
  routingNumberDescription,
  splitCta,
  submitCta,
  title,
  amountLabel,
  splitDescription,
  draggableListLabel,
  percentageLabel,
  splitAmountLabel,
  splitByLabel,
  priorityLabel,
  remainderLabel,
  splitTitle,
  priority_one,
  priority_two,
  priority_few,
  priority_other,
  managementTitle,
  paymentMethodLabel,
  bankFormSuccessAlert,
  splitViewSuccessAlert,
  validations
};
export {
  accountNumberLabel,
  accountTypeChecking,
  accountTypeColumn,
  accountTypeLabel,
  accountTypeSavings,
  actionColumn,
  addAnotherCta,
  addBankAccountCta,
  addBankAccountFormTitle,
  allocationColumn,
  amountLabel,
  bankAccountsListLabel,
  bankFormSuccessAlert,
  cancelAddCta,
  cancelCta,
  checkDescription,
  checkDescriptionSelf,
  checkLabel,
  Employee_PaymentMethod as default,
  deleteBankAccountCta,
  deleteBankAccountDialog,
  deleteBankAccountSuccessAlert,
  directDepositDescription,
  directDepositDescriptionSelf,
  directDepositLabel,
  draggableListLabel,
  hamburgerTitle,
  managementTitle,
  nameLabel,
  nicknameColumn,
  paymentFieldsetLegend,
  paymentMethodLabel,
  percentageLabel,
  priorityLabel,
  priority_few,
  priority_one,
  priority_other,
  priority_two,
  remainderLabel,
  routingNumberColumn,
  routingNumberDescription,
  routingNumberLabel,
  saveCta,
  splitAmountLabel,
  splitByLabel,
  splitCta,
  splitDescription,
  splitTitle,
  splitViewSuccessAlert,
  submitCta,
  title,
  validations
};
