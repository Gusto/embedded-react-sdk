const businessAddressTitle = "Business address";
const businessAddressDescription = "Contractor's business address, within the United States.";
const homeAddressTitle = "Home address";
const homeAddressDescription = "Contractor's home mailing address, within the United States.";
const w9EditWarning = { "label": "Changes will require an updated Form W-9", "body": "This contractor has already signed a form W-9. If you are making corrections, you’re also required to update and retain a new signed version of Form W-9 reflecting the corrected information." };
const street1 = "Street 1";
const street2 = "Street 2";
const city = "City";
const state = "State";
const statePlaceholder = "Select state...";
const zip = "Zip";
const submit = "Continue";
const submitting = "Saving…";
const validations = { "street1": "Street address is required", "city": "Please provide valid city name", "state": "Please select a state", "zip": "Please provide valid zip code", "zipInvalid": "Please enter a valid ZIP code" };
const Contractor_Address = {
  businessAddressTitle,
  businessAddressDescription,
  homeAddressTitle,
  homeAddressDescription,
  w9EditWarning,
  street1,
  street2,
  city,
  state,
  statePlaceholder,
  zip,
  submit,
  submitting,
  validations
};
export {
  businessAddressDescription,
  businessAddressTitle,
  city,
  Contractor_Address as default,
  homeAddressDescription,
  homeAddressTitle,
  state,
  statePlaceholder,
  street1,
  street2,
  submit,
  submitting,
  validations,
  w9EditWarning,
  zip
};
