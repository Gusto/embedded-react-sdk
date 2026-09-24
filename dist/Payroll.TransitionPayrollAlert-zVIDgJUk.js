const alertTitle = "Transition payroll - {{dateRange}}";
const alertDescription = "Because you changed your pay schedule, you'll need to run some transition payrolls. Transition payrolls let you pay employees for any workdays during gaps between pay schedules. You may choose to skip them, but it is your responsibility to ensure employees are paid properly. Regular payroll functionality is blocked until you either run or skip transition payrolls.";
const runPayroll = "Run Transition Payroll";
const skipPayroll = "Skip this payroll";
const skipSuccessAlert = "Transition payroll skipped";
const skipDialog = { "title": "Skip {{dateRange}} transition payroll?", "body": "Skipping this payroll means employees will not be paid for the transition period. It is your responsibility to ensure employees are paid properly.", "confirmCta": "Skip payroll", "cancelCta": "Cancel" };
const Payroll_TransitionPayrollAlert = {
  alertTitle,
  alertDescription,
  runPayroll,
  skipPayroll,
  skipSuccessAlert,
  skipDialog
};
export {
  alertDescription,
  alertTitle,
  Payroll_TransitionPayrollAlert as default,
  runPayroll,
  skipDialog,
  skipPayroll,
  skipSuccessAlert
};
