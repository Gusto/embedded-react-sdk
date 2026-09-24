const pageTitle = "Federal Tax Information";
const entityTypeAndLegalNameIntro = "Enter your entity type and the legal name of your company. You can find this info on your <einLink>FEIN assignment form (Form CP575)</einLink>. We need this to file and pay your taxes correctly.";
const federalEinLabel = "Federal EIN";
const federalEinDescription = "Your company's Federal Employer Identification Number (EIN). If you don't have one, please <applyLink>apply online.</applyLink>";
const taxpayerTypeLabel = "Taxpayer type";
const taxpayerTypeDescription = "Some common types are Sole Prop, LLC, and S-Corp.";
const taxpayerTypePlaceholder = "Select taxpayer type...";
const federalFilingFormLabel = "Federal filing form";
const federalFilingFormDescription = "To learn more about the different Federal Tax Form filings for payroll, please review the <irsLink>IRS website.</irsLink>";
const federalFilingFormPlaceholder = "Select filing form...";
const legalEntityNameLabel = "Legal entity name";
const legalEntityNameDescription = "Make sure this is the legal name of the company, not your DBA.";
const legalEntityNameError = "Legal entity name is required";
const taxPayerType = { "C-Corporation": "C-Corporation", "S-Corporation": "S-Corporation", "Sole proprietor": "Sole proprietor", "LLC": "LLC", "LLP": "LLP", "Limited partnership": "Limited partnership", "Co-ownership": "Co-ownership", "Association": "Association", "Trusteeship": "Trusteeship", "General partnership": "General partnership", "Joint venture": "Joint venture", "Non-Profit": "Non-Profit" };
const filingForm = { "941": "941 - Employer's Quarterly Federal Tax Return", "944": "944 - Employer's Annual Federal Tax Return" };
const continueCta = "Continue";
const Company_FederalTaxes = {
  pageTitle,
  entityTypeAndLegalNameIntro,
  federalEinLabel,
  federalEinDescription,
  taxpayerTypeLabel,
  taxpayerTypeDescription,
  taxpayerTypePlaceholder,
  federalFilingFormLabel,
  federalFilingFormDescription,
  federalFilingFormPlaceholder,
  legalEntityNameLabel,
  legalEntityNameDescription,
  legalEntityNameError,
  taxPayerType,
  filingForm,
  continueCta
};
export {
  continueCta,
  Company_FederalTaxes as default,
  entityTypeAndLegalNameIntro,
  federalEinDescription,
  federalEinLabel,
  federalFilingFormDescription,
  federalFilingFormLabel,
  federalFilingFormPlaceholder,
  filingForm,
  legalEntityNameDescription,
  legalEntityNameError,
  legalEntityNameLabel,
  pageTitle,
  taxPayerType,
  taxpayerTypeDescription,
  taxpayerTypeLabel,
  taxpayerTypePlaceholder
};
