const subTitle = "Missing Requirements";
const description = "Please complete the following steps in order to continue.";
const onboardedAdminSubtitle = "That's it! {{name}} is ready to get paid!";
const onboardedAdminDescription = "We'll begin withholding and reporting their taxes.";
const handedOffAdminSubtitle = "{{name}}'s invite is on its way";
const handedOffAdminDescription = "They'll complete the remaining setup steps on their own.";
const onboardedSelfSubtitle = "You've completed setup!";
const onboardedSelfDescription = "Your account will now be reviewed by your company admin.";
const doneCta = "Done";
const newHireReportCta = "New Hire report";
const missingRequirementsSubtitle = "Missing requirements";
const missingRequirementsDescription = "Please complete the following steps in order to continue.";
const steps = { "personal_details": "Personal details", "compensation_details": "Job and compensation", "add_work_address": "Work address", "add_home_address": "Home address", "federal_tax_setup": "Federal tax details", "state_tax_setup": "State tax details", "direct_deposit_setup": "Payment method", "employee_form_signing": "Employee form signing", "file_new_hire_report": "File new hire report", "admin_review": "Admin review" };
const stepsDescriptions = { "personal_details": "Basic employee information and their home address.", "compensation_details": " What the employee’s role(s) will be and their compensation.", "add_work_address": "Work address", "add_home_address": "Home address", "federal_tax_setup": "Federal tax withholdings.", "state_tax_setup": "State tax withholdings", "direct_deposit_setup": "How the employee will be paid.", "employee_form_signing": "Documents requiring employee signature", "file_new_hire_report": "Indicate if new hire report needs to be filed", "admin_review": "Admin review" };
const Employee_OnboardingSummary = {
  subTitle,
  description,
  onboardedAdminSubtitle,
  onboardedAdminDescription,
  handedOffAdminSubtitle,
  handedOffAdminDescription,
  onboardedSelfSubtitle,
  onboardedSelfDescription,
  doneCta,
  newHireReportCta,
  missingRequirementsSubtitle,
  missingRequirementsDescription,
  steps,
  stepsDescriptions
};
export {
  Employee_OnboardingSummary as default,
  description,
  doneCta,
  handedOffAdminDescription,
  handedOffAdminSubtitle,
  missingRequirementsDescription,
  missingRequirementsSubtitle,
  newHireReportCta,
  onboardedAdminDescription,
  onboardedAdminSubtitle,
  onboardedSelfDescription,
  onboardedSelfSubtitle,
  steps,
  stepsDescriptions,
  subTitle
};
