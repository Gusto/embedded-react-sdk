const title = "Wire instructions";
const subtitle = "This info tells your bank how much and where to send the wire transfer. Make sure to send a wire transfer—we will not accept ACH transfers. Afterwards, confirm below that you have completed this step.";
const selectLabel = "Wire transfer for payroll";
const selectLabelPayroll = "Payroll for {{payrollRange}}";
const selectLabelContractorPaymentGroup = "Contractor payment for {{requestedAmount}}";
const selectFallback = "Wire Transfer";
const requirementsTitle = "What to know when wiring funds";
const requirements = { "trackingCode": "You must include the unique tracking code from the wire instructions", "amountMatch": "The amount you send must exactly match the amount in the wire instructions", "usBank": "The originating bank account must be based in the US", "authorized": "You must be authorized to use the bank account on the company's behalf" };
const fields = { "trackingCode": "Unique tracking code", "amount": "Amount to wire", "bankName": "Bank name", "bankAddress": "Bank address", "recipientName": "Recipient name", "recipientAddress": "Recipient address", "accountNumber": "Recipient account number", "routingNumber": "Recipient routing number" };
const ariaLabels = { "copyTrackingCode": "Copy tracking code" };
const messages = { "copied": "Copied to clipboard!", "noInstructions": "No wire instructions available at this time.", "unableToLoad": "Unable to load wire instruction details." };
const cta = { "close": "Close", "confirm": "I've made a wire transfer" };
const Payroll_WireInstructions = {
  title,
  subtitle,
  selectLabel,
  selectLabelPayroll,
  selectLabelContractorPaymentGroup,
  selectFallback,
  requirementsTitle,
  requirements,
  fields,
  ariaLabels,
  messages,
  cta
};
export {
  ariaLabels,
  cta,
  Payroll_WireInstructions as default,
  fields,
  messages,
  requirements,
  requirementsTitle,
  selectFallback,
  selectLabel,
  selectLabelContractorPaymentGroup,
  selectLabelPayroll,
  subtitle,
  title
};
