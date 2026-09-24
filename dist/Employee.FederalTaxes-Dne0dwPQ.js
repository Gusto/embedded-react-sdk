const additionalWithholding = "Additional withholding";
const deductions = "Step 4b: Deductions";
const dependentsTotalIfApplicable = "Step 3: Dependents (if applicable)";
const extraWithholding = "Step 4c: Extra withholding";
const federalFilingStatus1c = "Step 1c: Federal filing status (1c)";
const federalFilingStatusPlaceholder = "Select filing status...";
const federalTaxesTitle = "Federal tax withholdings (Form W-4)";
const federalWithholdingAllowance = "Federal withholding allowance";
const fieldIsRequired = "This field is a required field. Please enter a value.";
const filingStatus = "Filing status";
const filingStatusExemptFromWithholding = "Exempt from withholding";
const filingStatusHeadOfHousehold = "Head of household";
const filingStatusMarried = "Married";
const filingStatusMarriedWithholdAsSingle = "Married, but withhold as Single";
const filingStatusSingle = "Single";
const includesSpouseExplanation = 'Includes spouse, if applicable. Answering 2c will result in a higher withholding, but to preserve privacy, this can be left unchecked. <IrsLink href="https://www.irs.gov/newsroom/faqs-on-the-2020-form-w-4" target="_blank">Learn more on the IRS website</IrsLink>.';
const irsCalculator = `We'll use this information to withhold the appropriate federal taxes from each paycheck. If you're unsure what to enter here, refer to <IrsCalculatorLink href="https://www.irs.gov/pub/irs-pdf/fw4.pdf" target="_blank">Form W-4</IrsCalculatorLink> to calculate the values, visit our <HelpCenterLink href="https://support.gusto.com" target="_blank">Help Center</HelpCenterLink>, or consult your tax advisor.`;
const multipleJobs2c = "Step 2c: Multiple jobs (2c)";
const otherIncome = "Step 4a: Other income";
const selectWithholdingDescription = "If you select Exempt from withholding, we won't withhold federal income taxes, but we'll still report taxable wages on a W-2. Keep in mind that anyone who claims exemption from withholding needs to submit a new W-4 each year.";
const submitCta = "Continue";
const saveCta = "Save";
const cancelCta = "Cancel";
const successAlert = "Successfully updated federal tax settings.";
const twoJobNoLabel = "No";
const twoJobYesLabel = "Yes";
const validations = { "federalFilingStatus": "Please select filing status", "federalTwoJobs": "Please select an option" };
const Employee_FederalTaxes = {
  additionalWithholding,
  deductions,
  dependentsTotalIfApplicable,
  extraWithholding,
  federalFilingStatus1c,
  federalFilingStatusPlaceholder,
  federalTaxesTitle,
  federalWithholdingAllowance,
  fieldIsRequired,
  filingStatus,
  filingStatusExemptFromWithholding,
  filingStatusHeadOfHousehold,
  filingStatusMarried,
  filingStatusMarriedWithholdAsSingle,
  filingStatusSingle,
  includesSpouseExplanation,
  irsCalculator,
  multipleJobs2c,
  otherIncome,
  selectWithholdingDescription,
  submitCta,
  saveCta,
  cancelCta,
  successAlert,
  twoJobNoLabel,
  twoJobYesLabel,
  validations
};
export {
  additionalWithholding,
  cancelCta,
  deductions,
  Employee_FederalTaxes as default,
  dependentsTotalIfApplicable,
  extraWithholding,
  federalFilingStatus1c,
  federalFilingStatusPlaceholder,
  federalTaxesTitle,
  federalWithholdingAllowance,
  fieldIsRequired,
  filingStatus,
  filingStatusExemptFromWithholding,
  filingStatusHeadOfHousehold,
  filingStatusMarried,
  filingStatusMarriedWithholdAsSingle,
  filingStatusSingle,
  includesSpouseExplanation,
  irsCalculator,
  multipleJobs2c,
  otherIncome,
  saveCta,
  selectWithholdingDescription,
  submitCta,
  successAlert,
  twoJobNoLabel,
  twoJobYesLabel,
  validations
};
