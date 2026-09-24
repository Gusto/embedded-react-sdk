const title = "Recovery cases";
const description = "One or more payments couldn't be processed due to a bank error. Resolve open recovery cases to continue running payroll.";
const emptyTableTitle = "No recovery cases";
const emptyTableDescription = "There are no recovery cases that need your response at this time.";
const labels = { "noLatestErrorCode": "—", "noLatestErrorCodeAriaLabel": "No error code available" };
const columns = { "originalDebitDate": "Original debit date", "totalAmount": "Total amount", "amountOutstanding": "Amount outstanding", "latestErrorCode": "Latest error code", "status": "Status" };
const status = { "open": "Open", "redebit_initiated": "Redebit initiated", "wire_initiated": "Wire initiated", "recovered": "Recovered", "lost": "Lost" };
const cta = { "resolve": "Resolve" };
const Payroll_RecoveryCasesList = {
  title,
  description,
  emptyTableTitle,
  emptyTableDescription,
  labels,
  columns,
  status,
  cta
};
export {
  columns,
  cta,
  Payroll_RecoveryCasesList as default,
  description,
  emptyTableDescription,
  emptyTableTitle,
  labels,
  status,
  title
};
