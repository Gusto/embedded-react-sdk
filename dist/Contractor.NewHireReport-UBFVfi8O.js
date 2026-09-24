const title = "File new hire report?";
const description = "Most states require that employers file a new hire report for contractors within 20 days of their start date. Even if the report is overdue, it is generally better to file a late report than to risk penalties for being out of compliance.";
const doFileLegend = "Select whether or not you'd like us to file new hire report";
const yesOption = "Yes, file the report for me";
const noOption = "No, I have already filed or will file the report myself";
const stateSelectionLabel = "Work state";
const statePlaceholder = "Select state...";
const submitCta = "Continue";
const validations = { "state": "Please select work state" };
const Contractor_NewHireReport = {
  title,
  description,
  doFileLegend,
  yesOption,
  noOption,
  stateSelectionLabel,
  statePlaceholder,
  submitCta,
  validations
};
export {
  Contractor_NewHireReport as default,
  description,
  doFileLegend,
  noOption,
  statePlaceholder,
  stateSelectionLabel,
  submitCta,
  title,
  validations,
  yesOption
};
