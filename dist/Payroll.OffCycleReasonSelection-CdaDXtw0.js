const title = "Reason";
const options = { "correction": { "label": "Correction payment", "description": "Run a payroll outside of your regular pay schedule" }, "bonus": { "label": "Bonus", "description": "Pay a bonus, gift, or commission." } };
const aria = { "reasonSelection": "Select off-cycle payroll reason" };
const Payroll_OffCycleReasonSelection = {
  title,
  options,
  aria
};
export {
  aria,
  Payroll_OffCycleReasonSelection as default,
  options,
  title
};
