const title = "Basic details";
const editCta = "Edit";
const legalName = "Legal name";
const startDate = "Start date";
const socialSecurityNumber = "Social security number";
const dateOfBirth = "Date of birth";
const personalEmail = "Personal email";
const listEmptyPlaceholder = "No value";
const alerts = { "profileUpdated": "Profile updated" };
const form = { "title": "Basics", "firstName": "Legal first name", "middleInitial": "Middle initial", "lastName": "Legal last name", "email": "Personal email", "emailDescription": "Use an email that's not associated with your company.", "ssnLabel": "Social Security Number (9 digit)", "dobLabel": "Date of birth", "cancelCta": "Cancel", "saveCta": "Save", "successAlert": "Successfully updated profile", "validations": { "email": "Valid email is required", "firstName": "Please enter valid first name", "lastName": "Please enter valid last name" } };
const Employee_Management_Profile = {
  title,
  editCta,
  legalName,
  startDate,
  socialSecurityNumber,
  dateOfBirth,
  personalEmail,
  listEmptyPlaceholder,
  alerts,
  form
};
export {
  alerts,
  dateOfBirth,
  Employee_Management_Profile as default,
  editCta,
  form,
  legalName,
  listEmptyPlaceholder,
  personalEmail,
  socialSecurityNumber,
  startDate,
  title
};
