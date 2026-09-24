const title = "Compensation";
const editCta = "Edit";
const typeLabel = "Type";
const wageLabel = "Wage";
const fixedLabel = "Fixed";
const hourlyLabel = "Hourly";
const hourlyRateValue = "${{rate}}/hr";
const emptyPlaceholder = "–";
const alerts = { "compensationUpdated": "Compensation updated" };
const form = { "title": "Edit compensation", "description": "Update the contractor's compensation type and rate.", "wageTypeLabel": "Compensation type", "fixedDescription": "Pay a fixed amount each pay period.", "hourlyDescription": "Pay based on hours worked.", "hourlyRateLabel": "Hourly rate", "cancelCta": "Cancel", "saveCta": "Save", "successAlert": "Compensation updated", "validations": { "hourlyRate": "Enter a valid hourly rate", "hourlyRateMax": "Hourly rate can't exceed $1,000,000,000,000.00" } };
const Contractor_Management_Compensation = {
  title,
  editCta,
  typeLabel,
  wageLabel,
  fixedLabel,
  hourlyLabel,
  hourlyRateValue,
  emptyPlaceholder,
  alerts,
  form
};
export {
  alerts,
  Contractor_Management_Compensation as default,
  editCta,
  emptyPlaceholder,
  fixedLabel,
  form,
  hourlyLabel,
  hourlyRateValue,
  title,
  typeLabel,
  wageLabel
};
