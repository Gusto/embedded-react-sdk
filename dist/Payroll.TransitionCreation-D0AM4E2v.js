const breadcrumbLabel = "Transition Payroll";
const pageTitle = "Transition Payroll";
const pageDescription = "A transition payroll covers the gap between your old and new pay schedules.";
const transitionExplanation = "When a pay schedule changes, there may be workdays that fall between the end of the old schedule and the start of the new one. This transition payroll ensures employees are paid for those days.";
const detailsHeading = "Transition Details";
const payPeriodLabel = "Pay period";
const payScheduleLabel = "Pay schedule";
const checkDateLabel = "Check date";
const continueCta = "Continue";
const errors = { "missingPayrollId": "Transition payroll was created but no payroll ID was returned", "checkDateRequired": "Check date is required", "checkDateAchLeadTime_one": "Check date must be at least {{count}} business day from today", "checkDateAchLeadTime_other": "Check date must be at least {{count}} business days from today" };
const Payroll_TransitionCreation = {
  breadcrumbLabel,
  pageTitle,
  pageDescription,
  transitionExplanation,
  detailsHeading,
  payPeriodLabel,
  payScheduleLabel,
  checkDateLabel,
  continueCta,
  errors
};
export {
  breadcrumbLabel,
  checkDateLabel,
  continueCta,
  Payroll_TransitionCreation as default,
  detailsHeading,
  errors,
  pageDescription,
  pageTitle,
  payPeriodLabel,
  payScheduleLabel,
  transitionExplanation
};
