const formTitle = "Home address";
const desc = "Employee’s home mailing address, within the United States.";
const street1 = "Street 1";
const street2 = "Street 2";
const city = "City";
const state = "State";
const statePlaceholder = "Select state...";
const zip = "Zip";
const effectiveDate = "Effective date";
const courtesyWithholdingLabel = "Include courtesy withholding";
const courtesyWithholdingDescription = "Withhold and pay local income taxes for employees who live and work in different states. ";
const learnMoreCta = '<LearnMoreLink href="https://support.gusto.com/article/101365481100000/Reciprocal-agreements-and-courtesy-withholding" target="_blank">Learn more about courtesy withholdings.</LearnMoreLink>';
const withholdingTitle = "Courtesy withholding";
const withholdingNote = "<p>Withholding on an employee's behalf will require your company to register with any corresponding agencies.</p><p>Also, if this employee's home address will change your company's state tax requirements, you may need to complete your company's state tax setup again.</p>";
const editAddress = "Edit Address";
const cancel = "Cancel";
const submit = "Submit";
const validations = { "street1": "Street address is required", "city": "Please provide valid city name", "state": "Please select a state", "zip": "Please provide valid zip code" };
const Employee_HomeAddress = {
  formTitle,
  desc,
  street1,
  street2,
  city,
  state,
  statePlaceholder,
  zip,
  effectiveDate,
  courtesyWithholdingLabel,
  courtesyWithholdingDescription,
  learnMoreCta,
  withholdingTitle,
  withholdingNote,
  editAddress,
  cancel,
  submit,
  validations
};
export {
  cancel,
  city,
  courtesyWithholdingDescription,
  courtesyWithholdingLabel,
  Employee_HomeAddress as default,
  desc,
  editAddress,
  effectiveDate,
  formTitle,
  learnMoreCta,
  state,
  statePlaceholder,
  street1,
  street2,
  submit,
  validations,
  withholdingNote,
  withholdingTitle,
  zip
};
