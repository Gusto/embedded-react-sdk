const title = "Request for information";
const blockingAlert = { "title": "This is a payroll blocking request", "description": "You will not be able to run payroll until we receive the information requested below." };
const questionTypes = { "document": "Document required", "answer": "Answer required" };
const fields = { "textAnswer": { "label": "Answer the above question", "placeholder": "Your answer" }, "fileUpload": { "label": "Upload document" } };
const validation = { "required": "This field is required", "fileRequired": "Please upload a file" };
const cta = { "cancel": "Cancel", "submit": "Submit response", "close": "Close" };
const unsupported = { "persona": { "title": "Verify identity", "description": "In order to ensure the security of your account, we need some additional information to help verify your signatory's identity." }, "generic": { "title": "Additional information required", "description": "We need some more information that we are unable to collect here." }, "contactSupport": "Please contact support" };
const InformationRequests_InformationRequestForm = {
  title,
  blockingAlert,
  questionTypes,
  fields,
  validation,
  cta,
  unsupported
};
export {
  blockingAlert,
  cta,
  InformationRequests_InformationRequestForm as default,
  fields,
  questionTypes,
  title,
  unsupported,
  validation
};
