const card = { "title": "Home address", "manageCta": "Manage", "noAddress": "No home address on file" };
const title = "Manage home address";
const description = "An employee's home address is used to calculate their taxes and determine eligibility for certain benefits. Make sure to keep it up-to-date.";
const rowMenuAriaLabel = "Open address row actions";
const rowEdit = "Edit";
const rowDelete = "Delete";
const currentSectionTitle = "Current home address";
const currentSince = "Since {{date}}";
const editCta = "Edit";
const changeCta = "Change address";
const changePendingTitle = "Change pending";
const changePendingPossessiveFallback = "This employee's";
const changePendingDescription = "{{possessiveLabel}} home address will change to {{newAddress}} on {{effectiveDate}}.";
const historySectionTitle = "Home address history";
const historyEmptyTitle = "No address history yet";
const historyEmptyDescription = "Once this employee has had more than one home address, their previous addresses will appear in this list.";
const columns = { "address": "Address", "startDate": "Start date", "endDate": "End date" };
const editModalTitle = "Edit home address";
const editModalDescription = "Update this employee's current home address. This information is used for payroll, benefits, and HR, so please make sure it's accurate.";
const createModalTitle = "Add a new home address";
const createModalDescription = "Enter the new address and when it takes effect. This information is used for payroll, benefits, and HR, so please make sure it's accurate.";
const startDateHelper = "The date the employee started living at this address.";
const submitCta = "Save";
const cancelCta = "Cancel";
const backCta = "Back";
const submitErrorAlertTitle = "We couldn't save this address";
const submitErrorAlertFallback = "The address couldn't be verified.";
const submitErrorAlertHelp = "Double-check the street, city, state, and ZIP. If they look right, the address may not be recognized by USPS — try a nearby valid address or contact your administrator.";
const deleteModalTitle = "Delete address?";
const deleteModalDescription = "Deleting an address can't be undone. <strong>{{address}}</strong> will be deleted. This can have implications on your tax calculations & withholdings.";
const deleteModalConfirmCta = "Delete address";
const form = { "street1": "Street 1", "street2": "Street 2", "city": "City", "state": "State", "statePlaceholder": "Select state...", "zip": "Zip", "noCurrentAddress": "Home address", "courtesyWithholdingLabel": "Include courtesy withholding", "courtesyWithholdingDescription": "Withhold and pay local income taxes for employees who live and work in different states. ", "learnMoreCta": '<LearnMoreLink href="https://support.gusto.com/article/101365481100000/Reciprocal-agreements-and-courtesy-withholding" target="_blank">Learn more about courtesy withholdings.</LearnMoreLink>', "withholdingTitle": "Courtesy withholding", "withholdingNote": "<p>Withholding on an employee's behalf will require your company to register with any corresponding agencies.</p><p>Also, if this employee's home address will change your company's state tax requirements, you may need to complete your company's state tax setup again.</p>", "startDateRequired": "Start date is required", "validations": { "street1": "Street address is required", "city": "Please provide valid city name", "state": "Please select a state", "zip": "Please provide valid zip code" } };
const Employee_Management_HomeAddress = {
  card,
  title,
  description,
  rowMenuAriaLabel,
  rowEdit,
  rowDelete,
  currentSectionTitle,
  currentSince,
  editCta,
  changeCta,
  changePendingTitle,
  changePendingPossessiveFallback,
  changePendingDescription,
  historySectionTitle,
  historyEmptyTitle,
  historyEmptyDescription,
  columns,
  editModalTitle,
  editModalDescription,
  createModalTitle,
  createModalDescription,
  startDateHelper,
  submitCta,
  cancelCta,
  backCta,
  submitErrorAlertTitle,
  submitErrorAlertFallback,
  submitErrorAlertHelp,
  deleteModalTitle,
  deleteModalDescription,
  deleteModalConfirmCta,
  form
};
export {
  backCta,
  cancelCta,
  card,
  changeCta,
  changePendingDescription,
  changePendingPossessiveFallback,
  changePendingTitle,
  columns,
  createModalDescription,
  createModalTitle,
  currentSectionTitle,
  currentSince,
  Employee_Management_HomeAddress as default,
  deleteModalConfirmCta,
  deleteModalDescription,
  deleteModalTitle,
  description,
  editCta,
  editModalDescription,
  editModalTitle,
  form,
  historyEmptyDescription,
  historyEmptyTitle,
  historySectionTitle,
  rowDelete,
  rowEdit,
  rowMenuAriaLabel,
  startDateHelper,
  submitCta,
  submitErrorAlertFallback,
  submitErrorAlertHelp,
  submitErrorAlertTitle,
  title
};
