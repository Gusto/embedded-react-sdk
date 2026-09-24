const addBankAccountTitle = "Company bank account";
const addBankAccountDescription = "We’ll use your checking account info to debit for wages and taxes. Your account must be linked to a checking bank account. Credit payments, credit cards, and savings accounts are not accepted.";
const routingNumberLabel = "Routing number";
const accountNumberLabel = "Account";
const verificationAlert = { "awaiting_deposits": { "label": "Verification pending", "description": "We're sending two test deposits to the bank account below. You should expect to see them in 1-2 business days. After receiving the deposits, please add them on the Bank verification step." }, "ready_for_verification": { "label": "Verify your bank account", "description": "Two test deposits were successfully sent to account ending in {{number}}." }, "verified": { "label": "Your bank account has been verified!" } };
const continueCta = "Continue";
const changeBankAccountCta = "Change bank account";
const verifyBankAccountCta = "Verify bank account";
const cancelCta = "Cancel";
const form = { "routingNumberLabel": "Routing number", "routingNumberDescription": "Enter your 9-digit routing number", "accountNumberLabel": "Account number" };
const validations = { "routingNumber": "Routing number is required", "accountNumber": "Account number is required", "deposit1": "Deposit 1 is required", "deposit2": "Deposit 2 is required" };
const verifyBankAccountTitle = "Verify bank account";
const verifyBankAccountDescription = "Find the two small deposits Gusto made into your company bank account. Input the values below and click “Verify deposits” to continue setup.";
const deposit1Label = "Test deposit #1";
const deposit1Description = "Enter first deposit amount in dollars, e.g. 0.02 for 2 cents";
const deposit2Label = "Test deposit #2";
const deposit2Description = "Enter second deposit amount in dollars, e.g. 0.02 for 2 cents";
const verifyCta = "Verify deposits";
const Company_BankAccount = {
  addBankAccountTitle,
  addBankAccountDescription,
  routingNumberLabel,
  accountNumberLabel,
  verificationAlert,
  continueCta,
  changeBankAccountCta,
  verifyBankAccountCta,
  cancelCta,
  form,
  validations,
  verifyBankAccountTitle,
  verifyBankAccountDescription,
  deposit1Label,
  deposit1Description,
  deposit2Label,
  deposit2Description,
  verifyCta
};
export {
  accountNumberLabel,
  addBankAccountDescription,
  addBankAccountTitle,
  cancelCta,
  changeBankAccountCta,
  continueCta,
  Company_BankAccount as default,
  deposit1Description,
  deposit1Label,
  deposit2Description,
  deposit2Label,
  form,
  routingNumberLabel,
  validations,
  verificationAlert,
  verifyBankAccountCta,
  verifyBankAccountDescription,
  verifyBankAccountTitle,
  verifyCta
};
