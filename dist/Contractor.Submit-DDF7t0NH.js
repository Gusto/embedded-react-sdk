const heading = "Submit contractor";
const doneTitle = "Contractor Onboarded";
const doneDescription = "This contractor has been successfully onboarded.";
const doneCta = "Done";
const submitCta = "Submit and complete onboarding";
const title = "Please note that after submitting";
const documentRequirements = { "title": "Documents", "description": "You will need to collect signed copies of the following documents from {{contractorName}}.", "downloadCta": "Download document", "documents": { "taxpayer_identification_form_w_9": { "title": "Taxpayer Identification (Form W-9)", "description": "Verifies your contractor's identity for tax purposes such as generating their Form 1099." } }, "alertLabel": "The government requires you to have Form W-9 completed and signed." };
const warningItems = ["The contractor type cannot be changed.", "The new hire report cannot be modified."];
const inviteContractor = { "title": "Review before sending invitation", "description": "You are inviting a contractor to complete the onboarding flow. Please double-check that you've entered this contractor's details correctly.", "startDateLabel": "Start date", "inviteCta": "Send invitation", "successMessage": "Contractor has been saved & invited to self-onboard!" };
const submitDone = { "successMessage": "Contractor has been onboarded!" };
const Contractor_Submit = {
  heading,
  doneTitle,
  doneDescription,
  doneCta,
  submitCta,
  title,
  documentRequirements,
  warningItems,
  inviteContractor,
  submitDone
};
export {
  Contractor_Submit as default,
  documentRequirements,
  doneCta,
  doneDescription,
  doneTitle,
  heading,
  inviteContractor,
  submitCta,
  submitDone,
  title,
  warningItems
};
