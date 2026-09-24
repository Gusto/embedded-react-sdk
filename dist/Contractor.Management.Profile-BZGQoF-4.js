const title = "Basic details";
const editCta = "Edit";
const legalName = "Legal name";
const startDate = "Start date";
const socialSecurityNumber = "Social security number";
const employerIdentificationNumber = "Employer Identification Number (EIN)";
const email = "Email";
const listEmptyPlaceholder = "No value on file";
const alerts = { "profileUpdated": "Profile updated" };
const form = { "title": "Basic details", "firstName": "First name", "middleInitial": "Middle initial", "lastName": "Last name", "businessName": "Business name", "startDate": "Start date", "ssnLabel": "Social security number", "ssnMask": "•••-••-••••", "einLabel": "Employer Identification Number (EIN)", "einMask": "••-•••••••", "onFileHint": "Already on file.", "changeCta": "Change", "email": "Email address", "emailDescription": "Used to send onboarding and payment notifications.", "cancelCta": "Cancel", "saveCta": "Save", "successAlert": "Profile updated", "validations": { "firstName": "Enter a valid first name", "lastName": "Enter a valid last name", "businessName": "Business name is required", "startDate": "Start date is required", "email": "Enter a valid email address", "ssn": "The SSN must be exactly 9 digits long, cannot contain all zeros in any group, and the first three digits cannot be '666' or in the range 900–999.", "ein": "The EIN must be exactly 9 digits long." } };
const Contractor_Management_Profile = {
  title,
  editCta,
  legalName,
  startDate,
  socialSecurityNumber,
  employerIdentificationNumber,
  email,
  listEmptyPlaceholder,
  alerts,
  form
};
export {
  alerts,
  Contractor_Management_Profile as default,
  editCta,
  email,
  employerIdentificationNumber,
  form,
  legalName,
  listEmptyPlaceholder,
  socialSecurityNumber,
  startDate,
  title
};
