const card = { "title": "State taxes", "editCta": "Edit", "noStateTaxes": "No state taxes on file", "noWithholdingForState": "No state income tax withholding required.", "listEmptyPlaceholder": "No value", "yes": "Yes", "no": "No" };
const stateTaxesTitle = "{{state}} Tax Requirements";
const noWithholding = "No state income tax withholding is required for this employee's work state.";
const saveCta = "Save";
const cancelCta = "Cancel";
const alerts = { "stateTaxesUpdated": "Successfully updated state tax settings." };
const validations = { "required": "This field is a required field. Please enter a value." };
const Employee_Management_StateTaxes = {
  card,
  stateTaxesTitle,
  noWithholding,
  saveCta,
  cancelCta,
  alerts,
  validations
};
export {
  alerts,
  cancelCta,
  card,
  Employee_Management_StateTaxes as default,
  noWithholding,
  saveCta,
  stateTaxesTitle,
  validations
};
