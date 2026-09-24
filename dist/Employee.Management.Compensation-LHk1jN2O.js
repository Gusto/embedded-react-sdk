const editCompensationTitle = "Edit compensation";
const jobTitleLabel = "Job title";
const hireDateLabel = "Hire date";
const twoPercentShareholderLabel = "This employee is a 2% shareholder";
const saveCta = "Save";
const cancelCta = "Cancel";
const addJobTitle = "Add a job";
const addAnotherJobTitle = "Add another job";
const saveNewJobCta = "Save job";
const cancelNewJobCta = "Cancel";
const card = { "title": "Compensation", "editCta": "Edit", "jobTitle": "Job title", "type": "Type", "types": { "hourly": "Hourly/Overtime eligible", "salary": "Salary/No overtime" }, "wage": "Wage", "effectiveDate": "Effective date", "addJobCta": "Add job", "addAnotherJobCta": "Add another job", "tableLabel": "List of jobs", "hamburgerTitle": "Job actions", "editJobCta": "Edit", "deleteJobCta": "Delete", "listEmptyPlaceholder": "No value", "columns": { "jobTitle": "Job title", "payType": "Pay type", "effectiveDate": "Effective date", "status": "Status" }, "pendingStatus": "Pending", "deleteJobDialog": { "title": "Delete job?", "description": "{{jobTitle}} will be permanently removed.", "confirmCta": "Delete", "cancelCta": "Cancel" }, "emptyState": { "title": "No compensation", "description": "Compensation will appear here once added" }, "pendingChange": { "alertLabel": "Compensation will change on {{date}}.", "alertLabelWithJob": "Compensation for {{jobTitle}} will change on {{date}}.", "summaryLabel": "There are multiple pending changes to {{name}}'s compensation.", "reviewCta": "Review", "cancelCta": "Cancel change", "modal": { "title": "Review pending changes", "description": "These compensation changes are scheduled to take effect on the dates below. Cancel any change to remove it.", "closeCta": "Close" }, "details": { "titleChange": "Job title will change to {{title}}", "payChange": "Pay will change to {{formattedRate}}", "flsaChange": "Employee type will change to {{flsaLabel}}", "newJob": "{{name}} will start an additional job as {{title}} at {{formattedRate}}", "newJobNoTitle": "{{name}} will start an additional job at {{formattedRate}}", "newJobNoRate": "{{name}} will start an additional job as {{title}}", "newJobMinimal": "{{name}} will start an additional job", "minWageEnabled": "Minimum wage adjustment will be enabled at {{formattedWage}}", "minWageEnabledNoRate": "Minimum wage adjustment will be enabled", "minWageDisabled": "Minimum wage adjustment will be removed", "minWageChanged": "Minimum wage adjustment rate will change to {{formattedWage}}", "minWageChangedNoRate": "Minimum wage adjustment will change" } } };
const alerts = { "jobAdded": "Job successfully added." };
const jobTitle = "Job Title";
const hireDate = "Start date";
const effectiveDate = "Effective date";
const twoPercentStakeholderLabel = "Select if employee is a 2% shareholder";
const employeeClassification = "Employee type";
const flsaStatusPlaceholder = "Select classification...";
const paymentUnitPlaceholder = "Select wage frequency...";
const minimumWagePlaceholder = "Select minimum wage...";
const classificationLink = '<ClassificationLink href="https://support.gusto.com/team-management/team-payments/pay-rates/1001671771/Employee-classification-options.htm" target="_blank">Learn more about employee classifications.</ClassificationLink>';
const wageLabel = "Wage";
const wageFrequencyLabel = "Wage frequency";
const paymentUnitDescription = "The period over which the compensation amount is tracked (e.g., hourly, daily, weekly, monthly, annually).";
const effectiveDateLabel = "Effective date";
const adjustForMinimumWage = "Adjust for minimum wage";
const adjustForMinimumWageDescription = "Determines whether the compensation should be adjusted for minimum wage. Only applies to Nonexempt employees.";
const minimumWageLabel = "Minimum wage";
const minimumWageDescription = "What minimum wage requirement should compensation be adjusted to";
const stateWcCoveredLabel = "Workers' compensation coverage";
const stateWcCoveredDescription = "Washington administers <wcLink>workers’ compensation insurance</wcLink> to protect workers and employers from the financial impact of a work-related injury. Indicate here if this employee is exempt from the workers’ comp tax.";
const stateWcCoveredOptions = { "yes": "Yes, this employee is covered", "no": "No, this employee is not covered" };
const stateWcClassCodeLabel = "Risk class code";
const stateWcClassCodeDescription = "The risk class code associated with this employee’s job function. We need this to pay and file your taxes correctly.";
const flsaStatusLabels = { "Commission Only Exempt": "Commission Only/No Overtime", "Commission Only Nonexempt": "Commission Only/Eligible for overtime", "Exempt": "Salary/No overtime", "Nonexempt": "Paid by the hour", "Owner": "Owner's draw", "Salaried Nonexempt": "Salary/Eligible for overtime" };
const paymentUnitOptions = { "Hour": "Hour", "Month": "Month", "Paycheck": "Paycheck", "Week": "Week", "Year": "Year" };
const commissionAlerts = { "federalMinimumPay": { "label": "Commission-only employees must earn the federal minimum pay", "body": "Federal laws say that employees not eligible for overtime should be paid at least $684 per week ($35,568 per year). You’ve classified this employee as not eligible for overtime—make sure they meet the Department of Labor’s definition of an exempt employee." }, "minimumWage": { "label": "Commission-only employees must earn at least the minimum wage", "body": "To stay compliant, <minimumWageLink>check your local regulations</minimumWageLink>." }, "ownerSalary": { "label": "The IRS requires owners of S corps to pay themselves a reasonable salary similar to others in the same role, before taking any distributions." } };
const validations = { "jobTitleSentence": "Job title is a required field", "title": "Title is a required field", "hireDate": "Start date is required", "exemptThreshold": "Most employees who make under {{limit}}/year should be eligible for overtime.", "classificationChangeNotification": "Changing this employee's classification will immediately delete their additional jobs.", "classificationChangeRemovesSecondaryJobs": "Only employees that are paid by the hour can have multiple jobs.", "rate": "Amount is a required field", "nonZeroRate": "Amount must be at least $1.00", "rateExemptThreshold": "FLSA Exempt employees must meet salary threshold of {{limit}}/year", "paymentUnit": "Payment unit must be one of Hour, Week, Month, or Year", "minimumWage": "Please select minimum wage for adjustment", "stateWcClassCode": "Please select a risk class code", "effectiveDate": "Effective date is a required field", "effectiveDateBeforeHire": "Effective date cannot be before the employee's hire date.", "effectiveDateBeforeMin": "Effective date must be in the future" };
const Employee_Management_Compensation = {
  editCompensationTitle,
  jobTitleLabel,
  hireDateLabel,
  twoPercentShareholderLabel,
  saveCta,
  cancelCta,
  addJobTitle,
  addAnotherJobTitle,
  saveNewJobCta,
  cancelNewJobCta,
  card,
  alerts,
  jobTitle,
  hireDate,
  effectiveDate,
  twoPercentStakeholderLabel,
  employeeClassification,
  flsaStatusPlaceholder,
  paymentUnitPlaceholder,
  minimumWagePlaceholder,
  classificationLink,
  wageLabel,
  wageFrequencyLabel,
  paymentUnitDescription,
  effectiveDateLabel,
  adjustForMinimumWage,
  adjustForMinimumWageDescription,
  minimumWageLabel,
  minimumWageDescription,
  stateWcCoveredLabel,
  stateWcCoveredDescription,
  stateWcCoveredOptions,
  stateWcClassCodeLabel,
  stateWcClassCodeDescription,
  flsaStatusLabels,
  paymentUnitOptions,
  commissionAlerts,
  validations
};
export {
  addAnotherJobTitle,
  addJobTitle,
  adjustForMinimumWage,
  adjustForMinimumWageDescription,
  alerts,
  cancelCta,
  cancelNewJobCta,
  card,
  classificationLink,
  commissionAlerts,
  Employee_Management_Compensation as default,
  editCompensationTitle,
  effectiveDate,
  effectiveDateLabel,
  employeeClassification,
  flsaStatusLabels,
  flsaStatusPlaceholder,
  hireDate,
  hireDateLabel,
  jobTitle,
  jobTitleLabel,
  minimumWageDescription,
  minimumWageLabel,
  minimumWagePlaceholder,
  paymentUnitDescription,
  paymentUnitOptions,
  paymentUnitPlaceholder,
  saveCta,
  saveNewJobCta,
  stateWcClassCodeDescription,
  stateWcClassCodeLabel,
  stateWcCoveredDescription,
  stateWcCoveredLabel,
  stateWcCoveredOptions,
  twoPercentShareholderLabel,
  twoPercentStakeholderLabel,
  validations,
  wageFrequencyLabel,
  wageLabel
};
