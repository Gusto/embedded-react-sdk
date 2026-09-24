const addAnotherJobCta = "+ Add another job";
const addAnotherJobTitle = "Add another job";
const adjustForMinimumWage = "Adjust for minimum wage";
const adjustForMinimumWageDescription = "Determines whether the compensation should be adjusted for minimum wage. Only applies to Nonexempt employees.";
const minimumWageLabel = "Minimum wage";
const minimumWageDescription = "What minimum wage requirement should compensation be adjusted to";
const allCompensations = { "amountColumn": "Amount", "deleteCta": "Delete", "editCta": "Edit", "jobColumn": "Job title", "perColumn": "Per", "tableLabel": "List of all jobs for the employee", "typeColumn": "Pay type" };
const backCta = "Back";
const cancelCta = "Cancel";
const cancelNewJobCta = "Cancel";
const classificationLink = '<ClassificationLink href="https://support.gusto.com/team-management/team-payments/pay-rates/1001671771/Employee-classification-options.htm" target="_blank">Learn more about employee classifications.</ClassificationLink>';
const commissionAlerts = { "federalMinimumPay": { "label": "Commission-only employees must earn the federal minimum pay", "body": "Federal laws say that employees not eligible for overtime should be paid at least $684 per week ($35,568 per year). You’ve classified this employee as not eligible for overtime—make sure they meet the Department of Labor’s definition of an exempt employee." }, "minimumWage": { "label": "Commission-only employees must earn at least the minimum wage", "body": "To stay compliant, <minimumWageLink>check your local regulations</minimumWageLink>." }, "ownerSalary": { "label": "The IRS requires owners of S corps to pay themselves a reasonable salary similar to others in the same role, before taking any distributions." } };
const employeeClassification = "Employee type";
const flsaStatusPlaceholder = "Select classification...";
const paymentUnitPlaceholder = "Select wage frequency...";
const minimumWagePlaceholder = "Select minimum wage...";
const flsaStatusLabels = { "Commission Only Exempt": "Commission Only/No Overtime", "Commission Only Nonexempt": "Commission Only/Eligible for overtime", "Exempt": "Salary/No overtime", "Nonexempt": "Paid by the hour", "Owner": "Owner's draw", "Salaried Nonexempt": "Salary/Eligible for overtime" };
const hamburgerTitle = "Job actions";
const jobTitle = "Job Title";
const paymentUnitDescription = "The period over which the compensation amount is tracked (e.g., hourly, daily, weekly, monthly, annually).";
const wageLabel = "Wage";
const wageFrequencyLabel = "Wage frequency";
const paymentUnitOptions = { "Hour": "Hour", "Month": "Month", "Paycheck": "Paycheck", "Week": "Week", "Year": "Year" };
const effectiveDate = "Effective date";
const effectiveDateDescription = "Changes will take effect on this date.";
const hireDate = "Start date";
const saveNewJobCta = "Save job";
const submitCta = "Continue";
const title = "Compensation";
const editTitle = "Edit job";
const addTitle = "Add job";
const effectiveDateLabel = "Effective date";
const validations = { "effectiveDate": "Effective date is a required field", "effectiveDateBeforeHire": "Effective date cannot be before the employee's hire date.", "hireDate": "Start date is required", "classificationChangeNotification": "Changing this employee's classification will immediately delete their additional jobs.", "classificationChangeRemovesSecondaryJobs": "Only employees that are paid by the hour can have multiple jobs.", "exemptThreshold": "Most employees who make under {{limit}}/year should be eligible for overtime.", "paymentUnit": "Payment unit must be one of Hour, Week, Month, or Year", "rate": "Amount is a required field", "nonZeroRate": "Amount must be at least $1.00", "rateExemptThreshold": "FLSA Exempt employees must meet salary threshold of {{limit}}/year", "title": "Title is a required field", "minimumWage": "Please select minimum wage for adjustment", "stateWcClassCode": "Please select a risk class code", "effectiveDateBeforeMin": "Effective date must be in the future", "jobTitleSentence": "Job title is a required field" };
const stateWcCoveredLabel = "Workers' compensation coverage";
const stateWcCoveredDescription = "Washington administers <wcLink>workers’ compensation insurance</wcLink> to protect workers and employers from the financial impact of a work-related injury. Indicate here if this employee is exempt from the workers’ comp tax.";
const stateWcCoveredOptions = { "yes": "Yes, this employee is covered", "no": "No, this employee is not covered" };
const stateWcClassCodeLabel = "Risk class code";
const stateWcClassCodeDescription = "The risk class code associated with this employee’s job function. We need this to pay and file your taxes correctly.";
const twoPercentStakeholderLabel = "Select if employee is a 2% shareholder";
const Employee_Compensation = {
  addAnotherJobCta,
  addAnotherJobTitle,
  adjustForMinimumWage,
  adjustForMinimumWageDescription,
  minimumWageLabel,
  minimumWageDescription,
  allCompensations,
  backCta,
  cancelCta,
  cancelNewJobCta,
  classificationLink,
  commissionAlerts,
  employeeClassification,
  flsaStatusPlaceholder,
  paymentUnitPlaceholder,
  minimumWagePlaceholder,
  flsaStatusLabels,
  hamburgerTitle,
  jobTitle,
  paymentUnitDescription,
  wageLabel,
  wageFrequencyLabel,
  paymentUnitOptions,
  effectiveDate,
  effectiveDateDescription,
  hireDate,
  saveNewJobCta,
  submitCta,
  title,
  editTitle,
  addTitle,
  effectiveDateLabel,
  validations,
  stateWcCoveredLabel,
  stateWcCoveredDescription,
  stateWcCoveredOptions,
  stateWcClassCodeLabel,
  stateWcClassCodeDescription,
  twoPercentStakeholderLabel
};
export {
  addAnotherJobCta,
  addAnotherJobTitle,
  addTitle,
  adjustForMinimumWage,
  adjustForMinimumWageDescription,
  allCompensations,
  backCta,
  cancelCta,
  cancelNewJobCta,
  classificationLink,
  commissionAlerts,
  Employee_Compensation as default,
  editTitle,
  effectiveDate,
  effectiveDateDescription,
  effectiveDateLabel,
  employeeClassification,
  flsaStatusLabels,
  flsaStatusPlaceholder,
  hamburgerTitle,
  hireDate,
  jobTitle,
  minimumWageDescription,
  minimumWageLabel,
  minimumWagePlaceholder,
  paymentUnitDescription,
  paymentUnitOptions,
  paymentUnitPlaceholder,
  saveNewJobCta,
  stateWcClassCodeDescription,
  stateWcClassCodeLabel,
  stateWcCoveredDescription,
  stateWcCoveredLabel,
  stateWcCoveredOptions,
  submitCta,
  title,
  twoPercentStakeholderLabel,
  validations,
  wageFrequencyLabel,
  wageLabel
};
