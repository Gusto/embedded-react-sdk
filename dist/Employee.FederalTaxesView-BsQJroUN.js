const federalTaxesTitle = "Federal tax withholdings (Form W-4)";
const irsCalculator = `We'll use this information to withhold the appropriate federal taxes from each paycheck. If you're unsure what to enter here, refer to <IrsCalculatorLink href="https://www.irs.gov/pub/irs-pdf/fw4.pdf" target="_blank">Form W-4</IrsCalculatorLink> to calculate the values, visit our <HelpCenterLink href="https://support.gusto.com" target="_blank">Help Center</HelpCenterLink>, or consult your tax advisor.`;
const federalFilingStatus1c = "Step 1c: Federal filing status (1c)";
const federalFilingStatusPlaceholder = "Select filing status...";
const selectWithholdingDescription = "If you select Exempt from withholding, we won't withhold federal income taxes, but we'll still report taxable wages on a W-2. Keep in mind that anyone who claims exemption from withholding needs to submit a new W-4 each year.";
const filingStatusSingle = "Single";
const filingStatusMarried = "Married";
const filingStatusHeadOfHousehold = "Head of household";
const filingStatusExemptFromWithholding = "Exempt from withholding";
const multipleJobs2c = "Step 2c: Multiple jobs (2c)";
const includesSpouseExplanation = 'Includes spouse, if applicable. Answering 2c will result in a higher withholding, but to preserve privacy, this can be left unchecked. <IrsLink href="https://www.irs.gov/newsroom/faqs-on-the-2020-form-w-4" target="_blank">Learn more on the IRS website</IrsLink>.';
const twoJobYesLabel = "Yes";
const twoJobNoLabel = "No";
const dependentsTotalIfApplicable = "Step 3: Dependents (if applicable)";
const otherIncome = "Step 4a: Other income";
const deductions = "Step 4b: Deductions";
const extraWithholding = "Step 4c: Extra withholding";
const fieldIsRequired = "This field is a required field. Please enter a value.";
const validations = { "federalFilingStatus": "Please select filing status", "federalTwoJobs": "Please select an option" };
const Employee_FederalTaxesView = {
  federalTaxesTitle,
  irsCalculator,
  federalFilingStatus1c,
  federalFilingStatusPlaceholder,
  selectWithholdingDescription,
  filingStatusSingle,
  filingStatusMarried,
  filingStatusHeadOfHousehold,
  filingStatusExemptFromWithholding,
  multipleJobs2c,
  includesSpouseExplanation,
  twoJobYesLabel,
  twoJobNoLabel,
  dependentsTotalIfApplicable,
  otherIncome,
  deductions,
  extraWithholding,
  fieldIsRequired,
  validations
};
export {
  deductions,
  Employee_FederalTaxesView as default,
  dependentsTotalIfApplicable,
  extraWithholding,
  federalFilingStatus1c,
  federalFilingStatusPlaceholder,
  federalTaxesTitle,
  fieldIsRequired,
  filingStatusExemptFromWithholding,
  filingStatusHeadOfHousehold,
  filingStatusMarried,
  filingStatusSingle,
  includesSpouseExplanation,
  irsCalculator,
  multipleJobs2c,
  otherIncome,
  selectWithholdingDescription,
  twoJobNoLabel,
  twoJobYesLabel,
  validations
};
