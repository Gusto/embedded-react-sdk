const documentListTitle = "Documents";
const documentListLabel = "Documents";
const formColumnLabel = "Form";
const actionColumnLabel = "Action";
const continueCta = "Continue";
const signDocumentCta = "Sign document";
const signDocumentComplete = "Complete";
const notSigned = "Not signed";
const documentListError = "Could not load your documents, try again later.";
const emptyTableTitle = "No documents found";
const signatureFormTitle = "Signature required for {{formTitle}}";
const downloadPrompt = "{{description}} You may also <downloadLink>download this document</downloadLink>.";
const signatureFieldLabel = "Signature";
const signatureFieldDescription = "Type your full, legal name.";
const signatureFieldError = "Signature is required";
const confirmSignatureCheckboxLabel = "I am the employee and I agree to sign electronically";
const confirmSignatureError = "You must agree to sign electronically";
const backCta = "Back";
const signFormCta = "Sign form";
const viewDocumentCta = "View document";
const downloadAndReviewInstructions = "Please review the document. When you're finished, sign below.";
const forms = { "employee_direct_deposit": { "description": "" }, "US_I-9": { "description": "" }, "US_W-4": { "description": "" }, "or_w4": { "description": "" }, "Or_Portland_Multnomah": { "description": "" } };
const Employee_DocumentSigner = {
  documentListTitle,
  documentListLabel,
  formColumnLabel,
  actionColumnLabel,
  continueCta,
  signDocumentCta,
  signDocumentComplete,
  notSigned,
  documentListError,
  emptyTableTitle,
  signatureFormTitle,
  downloadPrompt,
  signatureFieldLabel,
  signatureFieldDescription,
  signatureFieldError,
  confirmSignatureCheckboxLabel,
  confirmSignatureError,
  backCta,
  signFormCta,
  viewDocumentCta,
  downloadAndReviewInstructions,
  forms
};
export {
  actionColumnLabel,
  backCta,
  confirmSignatureCheckboxLabel,
  confirmSignatureError,
  continueCta,
  Employee_DocumentSigner as default,
  documentListError,
  documentListLabel,
  documentListTitle,
  downloadAndReviewInstructions,
  downloadPrompt,
  emptyTableTitle,
  formColumnLabel,
  forms,
  notSigned,
  signDocumentComplete,
  signDocumentCta,
  signFormCta,
  signatureFieldDescription,
  signatureFieldError,
  signatureFieldLabel,
  signatureFormTitle,
  viewDocumentCta
};
