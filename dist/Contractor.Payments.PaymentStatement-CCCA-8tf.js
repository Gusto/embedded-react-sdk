const title = "Payment statement for {{contractorName}}";
const breadcrumbLabel = "Payment statement for {{contractorName}}";
const debitedColumn = "Debited";
const amountColumn = "Amount";
const hoursLabel = "Hours";
const hoursAmount = "{{hours}} hours at {{rate}}/hr";
const wageLabel = "Wage";
const bonus = "Bonus";
const reimbursement = "Reimbursement";
const receipt = { "totalLabel": "Total", "detailsLabel": "Receipt Details", "from": "From", "to": "To", "debitDate": "Debit date", "disclaimer": "This receipt confirms funds have been electronically transferred to the recipient's bank account. Money transmission services are provided by Gusto, Inc. pursuant to its <licensesLink>licenses</licensesLink>." };
const errors = { "paymentGroupNotFound": "Contractor payment group not found", "paymentNotFound": "Payment not found", "contractorNotFound": "Contractor not found" };
const Contractor_Payments_PaymentStatement = {
  title,
  breadcrumbLabel,
  debitedColumn,
  amountColumn,
  hoursLabel,
  hoursAmount,
  wageLabel,
  bonus,
  reimbursement,
  receipt,
  errors
};
export {
  amountColumn,
  bonus,
  breadcrumbLabel,
  debitedColumn,
  Contractor_Payments_PaymentStatement as default,
  errors,
  hoursAmount,
  hoursLabel,
  receipt,
  reimbursement,
  title,
  wageLabel
};
