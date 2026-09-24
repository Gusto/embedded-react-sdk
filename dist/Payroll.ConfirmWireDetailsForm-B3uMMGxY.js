const title = "Confirm wire details for {{payrollRange}}";
const description = "Enter the details of your wire transfer submitted through your bank.";
const amountLabel = "Total amount sent";
const dateLabel = "Date sent";
const bankNameLabel = "Initiating bank";
const bankNameDescription = "The bank where you initiated the wire transfer";
const bankNamePlaceholder = "Enter a financial institution";
const notesLabel = "Additional notes";
const cancelCta = "Cancel";
const submitCta = "Submit";
const validations = { "amount": "Total amount sent is required", "date": "Date sent is required", "bankName": "Initiating bank is required" };
const confirmationAlert = { "title": "Wire details submitted for {{payrollRange}} payroll", "emptyTitle": "Wire details submitted", "content": "Once we receive the funds from your bank we'll pay your team on {{checkDate}}." };
const Payroll_ConfirmWireDetailsForm = {
  title,
  description,
  amountLabel,
  dateLabel,
  bankNameLabel,
  bankNameDescription,
  bankNamePlaceholder,
  notesLabel,
  cancelCta,
  submitCta,
  validations,
  confirmationAlert
};
export {
  amountLabel,
  bankNameDescription,
  bankNameLabel,
  bankNamePlaceholder,
  cancelCta,
  confirmationAlert,
  dateLabel,
  Payroll_ConfirmWireDetailsForm as default,
  description,
  notesLabel,
  submitCta,
  title,
  validations
};
