const pageTitle = "New Off-Cycle Payroll";
const pageDescription = "Configure your off-cycle payroll details below.";
const payPeriodSectionTitle = "Pay period and payment date";
const payPeriodSectionDescription = "Enter a work period to show on your employees' pay stubs.";
const continueCta = "Continue";
const includeAllEmployeesLabel = "Include all employees in this payroll";
const taxWithholdingDisclaimer = "Note: Off-cycle payrolls are meant to supplement the standard payroll schedule, not replace it. Since payroll taxes depend on wages, hours worked, <bold>and pay frequency,</bold> exclusively using off-cycle payrolls to pay your team can lead to taxes being omitted.";
const errors = { "missingPayrollId": "Off-cycle payroll was created but no payroll ID was returned", "noEmployeesSelected": "At least one employee must be selected" };
const Payroll_OffCycleCreation = {
  pageTitle,
  pageDescription,
  payPeriodSectionTitle,
  payPeriodSectionDescription,
  continueCta,
  includeAllEmployeesLabel,
  taxWithholdingDisclaimer,
  errors
};
export {
  continueCta,
  Payroll_OffCycleCreation as default,
  errors,
  includeAllEmployeesLabel,
  pageDescription,
  pageTitle,
  payPeriodSectionDescription,
  payPeriodSectionTitle,
  taxWithholdingDisclaimer
};
