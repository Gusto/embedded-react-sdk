const title = "Contractor profile";
const subtitle = "This information will be used for payments and on tax documents, so double-check that it's accurate.";
const w9EditWarning = { "label": "Changes will require an updated Form W-9", "body": "This contractor has already signed a form W-9. If you are making corrections, you’re also required to update and retain a new signed version of Form W-9 reflecting the corrected information." };
const selfOnboarding = { "title": "Complete your profile", "individualDescription": "Please verify your name and provide your Social Security Number.", "businessDescription": "Please verify your business name and provide your EIN.", "continue": "Continue", "submitting": "Saving…" };
const fields = { "selfOnboarding": { "label": "Invite this contractor to enter some of their own details online", "description": "Your contractor will be invited to enter their information on their own time." }, "email": { "label": "Contractor's email address" }, "contractorType": { "label": "Type" }, "firstName": { "label": "First Name" }, "lastName": { "label": "Last Name" }, "middleInitial": { "label": "Middle Initial" }, "ssn": { "label": "Social Security Number" }, "businessName": { "label": "Business Name" }, "startDate": { "label": "Start Date", "description": "Your contractor's first day of work at your company" }, "wageType": { "label": "Wage Type" }, "hourlyRate": { "label": "Hourly Rate" }, "ein": { "label": "EIN" } };
const validations = { "email": "Email is required when inviting contractor", "emailFormat": "Email must be a valid email address", "firstName": "First name is required for individual contractors", "firstNameFormat": "First name is not valid", "lastName": "Last name is required for individual contractors", "lastNameFormat": "Last name is not valid", "ssn": "SSN is required for individual contractors", "ssnFormat": "SSN must be valid format", "businessName": "Business name is required for business contractors", "ein": "EIN is required for business contractors", "einFormat": "EIN must be valid format (XX-XXXXXXX)", "hourlyRate": "Hourly rate is required for hourly contractors", "hourlyRateMax": "Hourly rate can't exceed $1,000,000,000,000.00", "startDate": "Start date is required" };
const buttons = { "cancel": "Cancel", "create": "Create Contractor", "update": "Continue", "creating": "Creating…", "updating": "Saving…" };
const Contractor_Profile = {
  title,
  subtitle,
  w9EditWarning,
  selfOnboarding,
  fields,
  validations,
  buttons
};
export {
  buttons,
  Contractor_Profile as default,
  fields,
  selfOnboarding,
  subtitle,
  title,
  validations,
  w9EditWarning
};
