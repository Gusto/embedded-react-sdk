const breadcrumbLabel = "Confirm Wire Details";
const banner = { "title": "To make payroll, wire funds by {{time}} on {{date}}", "titleWithPayroll": "Wire transfer details required for {{payrollRange}} payroll", "titleMultiple": "Wire transfer details required for {{count}} payrolls or payments", "description": "We can't pay your team until we get your wire. It may take time to get from your bank to ours, so we recommend sending it as soon as you can.", "requestLabelPayroll": "Payroll for {{payrollRange}}", "requestLabelContractorPaymentGroup": "Contractor payment for {{requestedAmount}}" };
const cta = { "startWireTransfer": "Start your wire transfer" };
const modal = { "title": "Wire instructions", "close": "Close", "submitCta": "I've made a wire transfer" };
const Payroll_ConfirmWireDetailsBanner = {
  breadcrumbLabel,
  banner,
  cta,
  modal
};
export {
  banner,
  breadcrumbLabel,
  cta,
  Payroll_ConfirmWireDetailsBanner as default,
  modal
};
