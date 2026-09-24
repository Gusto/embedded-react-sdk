const cancelCta = "Cancel";
const description = "This information will be used for payroll and taxes, so double-check that it's accurate.";
const dobLabel = "Date of birth";
const email = "Personal email";
const emailDescription = "Use an email that's not associated with your company.";
const firstName = "Legal first name";
const formTitle = "Employee Form";
const lastName = "Legal last name";
const middleInitial = "Middle initial";
const preferredFirstName = "Preferred first name";
const selfOnboardingLabel = "Invite this employee to enter their own details online.";
const selfOnboardingDescription = "Your employee will be invited to enter their information on their own time.";
const ssnLabel = "Social Security Number (9 digit)";
const ssnMask = "***-**-****";
const startDateDescription = "Your employee’s first day of work at your company.";
const startDateLabel = "Start date";
const saveCta = "Save";
const submitCta = "Continue";
const successAlert = "Successfully updated profile";
const title = "Basics";
const validations = { "email": "Valid email is required", "firstName": "Please enter valid first name", "lastName": "Please enter valid last name", "startDate": "Please select valid start date", "startDateOutOfRange": "An employee must have a start date that is within six months from today." };
const workAddress = "Work address";
const workAddressDescription = "The primary location where the employee will be working.";
const workAddressPlaceholder = "Select work address...";
const workAddressSectionTitle = "Work Address";
const workAddressSectionDescription = "This is where you primarily work. We need this information to make sure your pay is accurate. Please reach out to your employer if this looks incorrect.";
const Employee_Profile = {
  cancelCta,
  description,
  dobLabel,
  email,
  emailDescription,
  firstName,
  formTitle,
  lastName,
  middleInitial,
  preferredFirstName,
  selfOnboardingLabel,
  selfOnboardingDescription,
  ssnLabel,
  ssnMask,
  startDateDescription,
  startDateLabel,
  saveCta,
  submitCta,
  successAlert,
  title,
  validations,
  workAddress,
  workAddressDescription,
  workAddressPlaceholder,
  workAddressSectionTitle,
  workAddressSectionDescription
};
export {
  cancelCta,
  Employee_Profile as default,
  description,
  dobLabel,
  email,
  emailDescription,
  firstName,
  formTitle,
  lastName,
  middleInitial,
  preferredFirstName,
  saveCta,
  selfOnboardingDescription,
  selfOnboardingLabel,
  ssnLabel,
  ssnMask,
  startDateDescription,
  startDateLabel,
  submitCta,
  successAlert,
  title,
  validations,
  workAddress,
  workAddressDescription,
  workAddressPlaceholder,
  workAddressSectionDescription,
  workAddressSectionTitle
};
