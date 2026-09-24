const title = "Contractor payment details";
const paymentFieldsetLegend = "Select payment method";
const directDepositLabel = "Direct deposit";
const directDepositDescription = "We recommend direct deposit – we’ll deposit paychecks directly into your employee’s bank account.";
const checkLabel = "Check";
const checkDescription = "If you select check as the payment method, you’ll need to write a physical check to this employee each payday.";
const continueCta = "Continue";
const submittingCta = "Saving…";
const bankAccountForm = { "nameLabel": "Account nickname", "routingNumberLabel": "Routing number", "routingNumberDescription": "9-digits", "accountNumberLabel": "Account number", "accountTypeLabel": "Account type", "accountTypeChecking": "Checking", "accountTypeSavings": "Savings", "validations": { "accountName": "Account nickname is required", "routingNumber": "Routing number is required (9-digits)", "accountNumber": "Please enter valid account number" } };
const Contractor_PaymentMethod = {
  title,
  paymentFieldsetLegend,
  directDepositLabel,
  directDepositDescription,
  checkLabel,
  checkDescription,
  continueCta,
  submittingCta,
  bankAccountForm
};
export {
  bankAccountForm,
  checkDescription,
  checkLabel,
  continueCta,
  Contractor_PaymentMethod as default,
  directDepositDescription,
  directDepositLabel,
  paymentFieldsetLegend,
  submittingCta,
  title
};
