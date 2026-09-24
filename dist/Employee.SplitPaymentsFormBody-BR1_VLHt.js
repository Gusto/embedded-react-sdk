const title = "Split employee paycheck";
const splitDescription = "You can split your paycheck into different accounts by percentage or flat dollar amounts. When splitting by amount, you can reorder the priority of the bank accounts by clicking and dragging the list icon to the left of the bank account field. We’ll pay the amounts in the order specified until your salary has been fully distributed to the last “remainder” account.";
const splitByLabel = "Split by";
const percentageLabel = "Percentage";
const amountLabel = "Fixed amount";
const splitAmountLabel = "{{name}} ({{account_number}})";
const draggableListLabel = "Reorderable list of bank accounts";
const remainderLabel = "Remainder";
const cancelCta = "Cancel";
const saveCta = "Save";
const validations = { "percentageErrorWithTotal": "Splits must total 100%. Currently {{total}}%.", "amountError": "Please enter valid amount", "percentageAmountError": "Percentage should be a whole number between 0 and 100" };
const Employee_SplitPaymentsFormBody = {
  title,
  splitDescription,
  splitByLabel,
  percentageLabel,
  amountLabel,
  splitAmountLabel,
  draggableListLabel,
  remainderLabel,
  cancelCta,
  saveCta,
  validations
};
export {
  amountLabel,
  cancelCta,
  Employee_SplitPaymentsFormBody as default,
  draggableListLabel,
  percentageLabel,
  remainderLabel,
  saveCta,
  splitAmountLabel,
  splitByLabel,
  splitDescription,
  title,
  validations
};
