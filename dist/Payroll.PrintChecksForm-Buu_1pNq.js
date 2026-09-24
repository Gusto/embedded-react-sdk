const modalTitle = "Choose check stock";
const customStockLabel = "Custom check stock";
const customStockDescription = "Use this check stock if you have check stock that is pre-printed with your company and bank information. The physical check will appear on the top of the check PDF. Check numbers should already be pre-printed on the check stock you purchased.";
const blankStockLabel = "Blank check stock";
const blankStockDescription = "Use this check stock if you have blank check stock and need us to populate your company and bank information. The physical check will always be on the bottom of the check PDF.";
const startingCheckNumberLabel = "Check number starts with";
const startingCheckNumberDescription = "This will be the first check number, all other checks will follow sequentially.";
const cancelCta = "Cancel";
const submitCta = "View checks";
const submitCtaLoading = "Generating...";
const validations = { "startingCheckNumber": "Enter a valid check number" };
const Payroll_PrintChecksForm = {
  modalTitle,
  customStockLabel,
  customStockDescription,
  blankStockLabel,
  blankStockDescription,
  startingCheckNumberLabel,
  startingCheckNumberDescription,
  cancelCta,
  submitCta,
  submitCtaLoading,
  validations
};
export {
  blankStockDescription,
  blankStockLabel,
  cancelCta,
  customStockDescription,
  customStockLabel,
  Payroll_PrintChecksForm as default,
  modalTitle,
  startingCheckNumberDescription,
  startingCheckNumberLabel,
  submitCta,
  submitCtaLoading,
  validations
};
