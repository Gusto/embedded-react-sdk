const cardTitle = "Work address";
const cardManageCta = "Manage";
const cardNoAddress = "No work address on file";
const title = "Work address";
const description = "An employee's work address is the primary location where they perform their job. Keep it accurate for payroll and tax purposes.";
const rowMenuAriaLabel = "Open work address row actions";
const rowEdit = "Edit";
const rowDelete = "Delete";
const currentSectionTitle = "Current work address";
const currentSince = "Since {{date}}";
const currentEmpty = "No work address on file.";
const editCta = "Edit";
const changeCta = "Change address";
const changePendingTitle = "Change pending";
const changePendingPossessiveFallback = "This employee's";
const changePendingDescription = "{{possessiveLabel}} work address will change to {{newAddress}} on {{effectiveDate}}.";
const historySectionTitle = "Work address history";
const historyEmptyTitle = "No address history yet";
const historyEmptyDescription = "When this employee has more than one work address on record, previous locations will appear here.";
const columns = { "location": "Location", "startDate": "Start date", "endDate": "End date" };
const editModalDescription = "Review or update the work location on file. This information is used for payroll, benefits, and HR, so keep it accurate.";
const changeModalDescription = "This information is used for payroll, benefits, and HR, so please make sure it's accurate.";
const editPastAddressAlertTitle = "Editing a work address can have implications on your tax calculations & withholdings.";
const editModalTitle = "Edit work address";
const changeModalTitle = "Change work address";
const form = { "editLocationLabel": "Work address", "editInactiveLocationLabel": "Corrected work address", "editLocationDescription": "If you don't see the address in the dropdown, you need to add a new company location first.", "newWorkAddressLabel": "New work address", "newWorkAddressDescription": "If you don't see the address in the dropdown, you need to add a new company location first.", "selectPlaceholder": "Select a work address...", "locationRequired": "Select a work location", "startDateLabel": "Start date", "startDateDescription": "When did the employee start working at this address", "editInactiveStartDateDescription": "The date this work address took effect for this employee.", "startDateRequired": "Start date is required" };
const submitCta = "Submit";
const cancelCta = "Cancel";
const backCta = "Back";
const deleteModalTitle = "Delete address?";
const deleteModalDescription = "Deleting an address can't be undone. <strong>{{address}}</strong> will be removed from history.";
const deleteModalConfirmCta = "Delete address";
const Employee_Management_WorkAddress = {
  cardTitle,
  cardManageCta,
  cardNoAddress,
  title,
  description,
  rowMenuAriaLabel,
  rowEdit,
  rowDelete,
  currentSectionTitle,
  currentSince,
  currentEmpty,
  editCta,
  changeCta,
  changePendingTitle,
  changePendingPossessiveFallback,
  changePendingDescription,
  historySectionTitle,
  historyEmptyTitle,
  historyEmptyDescription,
  columns,
  editModalDescription,
  changeModalDescription,
  editPastAddressAlertTitle,
  editModalTitle,
  changeModalTitle,
  form,
  submitCta,
  cancelCta,
  backCta,
  deleteModalTitle,
  deleteModalDescription,
  deleteModalConfirmCta
};
export {
  backCta,
  cancelCta,
  cardManageCta,
  cardNoAddress,
  cardTitle,
  changeCta,
  changeModalDescription,
  changeModalTitle,
  changePendingDescription,
  changePendingPossessiveFallback,
  changePendingTitle,
  columns,
  currentEmpty,
  currentSectionTitle,
  currentSince,
  Employee_Management_WorkAddress as default,
  deleteModalConfirmCta,
  deleteModalDescription,
  deleteModalTitle,
  description,
  editCta,
  editModalDescription,
  editModalTitle,
  editPastAddressAlertTitle,
  form,
  historyEmptyDescription,
  historyEmptyTitle,
  historySectionTitle,
  rowDelete,
  rowEdit,
  rowMenuAriaLabel,
  submitCta,
  title
};
