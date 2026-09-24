const cancelSuccess = "Termination has been cancelled successfully";
const breadcrumbs = { "form": "Terminate employee", "summary": "Summary", "dismissal": "Run payroll" };
const offCycleCreation = { "loading": "Creating off-cycle payroll…", "error": "Failed to create off-cycle payroll. Please try again.", "noPeriodsError": "No unprocessed termination pay periods found for this employee.", "retry": "Retry" };
const Employee_Terminations_TerminationFlow = {
  cancelSuccess,
  breadcrumbs,
  offCycleCreation
};
export {
  breadcrumbs,
  cancelSuccess,
  Employee_Terminations_TerminationFlow as default,
  offCycleCreation
};
