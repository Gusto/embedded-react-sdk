const title = "Address";
const editCta = "Edit";
const emptyPlaceholder = "–";
const alerts = { "addressUpdated": "Address updated" };
const form = { "title": "Edit address", "businessDescription": "Update {{name}}’s business address.", "homeDescription": "Update {{name}}’s home address.", "street1": "Street 1", "street2": "Street 2", "city": "City", "state": "State", "statePlaceholder": "Select state...", "zip": "Zip", "cancelCta": "Cancel", "saveCta": "Save", "successAlert": "Address updated", "validations": { "street1": "Street address is required", "city": "Please provide valid city name", "state": "Please select a state", "zip": "Please provide valid zip code", "zipInvalid": "Please enter a valid ZIP code" } };
const Contractor_Management_Address = {
  title,
  editCta,
  emptyPlaceholder,
  alerts,
  form
};
export {
  alerts,
  Contractor_Management_Address as default,
  editCta,
  emptyPlaceholder,
  form,
  title
};
