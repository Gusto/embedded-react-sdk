const locationsListTitle = "Company addresses";
const locationsListDescription = "To automate your payroll filings, we need to have your company's accurate addresses. Please enter your mailing and filing addresses and all addresses where you have employees physically working in the United States.";
const locationListLabel = "List of company addresses";
const locationListCol1 = "Addresses";
const locationListCol2 = "Address status";
const filingAddress = "Filing Address";
const mailingAddress = "Mailing Address";
const hamburgerTitle = "Location actions";
const editCta = "Edit";
const emptyTableTitle = "No addresses";
const emptyTableDescription = "Once you’ve added addresses they will appear here";
const addLocationCta = "+ Add another address";
const addFirstLocationCta = "+ Add an address";
const locationFormTitle = "Add company address";
const locationFormDescription = "We will need to collect and add any employee’s physical working address in the US including remote employees and employees who work from home";
const street1Label = "Street 1";
const street2Label = "Street 2";
const cityLabel = "City";
const stateLabel = "State";
const statePlaceholder = "Select state...";
const zipLabel = "Zip";
const phoneNumberLabel = "Phone number";
const addressTypeLabel = "Address types";
const mailingAddressLabel = "Mailing address";
const mailingAddressDescription = "This is where you'd like to receive mail. It's usually the same as your filing address.";
const mailingAddressDescriptionLocked = "This is your company's mailing address. To change it, designate a different location as the mailing address.";
const filingAddressLabel = "Filing address";
const filingAddressDescription = "This is your primary physical place of business. It can't be a P.O. Box. The filing address should match the address you have on file with the IRS, which you can find on your federal EIN assignment form (Form CP575). We'll use it for all local, state, and federal filings.";
const filingAddressDescriptionLocked = "This is your company's filing address. To change it, designate a different location as the filing address.";
const saveCta = "Save";
const cancelCta = "Cancel";
const continueCta = "Continue";
const validations = { "street1": "Street address is required", "city": "Please provide valid city name", "state": "Please select a state", "zip": "Please provide valid zip code", "phone": "Please provide valid phone number" };
const Company_Locations = {
  locationsListTitle,
  locationsListDescription,
  locationListLabel,
  locationListCol1,
  locationListCol2,
  filingAddress,
  mailingAddress,
  hamburgerTitle,
  editCta,
  emptyTableTitle,
  emptyTableDescription,
  addLocationCta,
  addFirstLocationCta,
  locationFormTitle,
  locationFormDescription,
  street1Label,
  street2Label,
  cityLabel,
  stateLabel,
  statePlaceholder,
  zipLabel,
  phoneNumberLabel,
  addressTypeLabel,
  mailingAddressLabel,
  mailingAddressDescription,
  mailingAddressDescriptionLocked,
  filingAddressLabel,
  filingAddressDescription,
  filingAddressDescriptionLocked,
  saveCta,
  cancelCta,
  continueCta,
  validations
};
export {
  addFirstLocationCta,
  addLocationCta,
  addressTypeLabel,
  cancelCta,
  cityLabel,
  continueCta,
  Company_Locations as default,
  editCta,
  emptyTableDescription,
  emptyTableTitle,
  filingAddress,
  filingAddressDescription,
  filingAddressDescriptionLocked,
  filingAddressLabel,
  hamburgerTitle,
  locationFormDescription,
  locationFormTitle,
  locationListCol1,
  locationListCol2,
  locationListLabel,
  locationsListDescription,
  locationsListTitle,
  mailingAddress,
  mailingAddressDescription,
  mailingAddressDescriptionLocked,
  mailingAddressLabel,
  phoneNumberLabel,
  saveCta,
  stateLabel,
  statePlaceholder,
  street1Label,
  street2Label,
  validations,
  zipLabel
};
