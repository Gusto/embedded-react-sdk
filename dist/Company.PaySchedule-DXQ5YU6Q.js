const listDescription = `Pick what frequency you'd like to run payroll. If you need help, you can read more about <ScheduleLink href="https://gusto.com/resources/articles/payroll/best-payroll-schedule-small-business" target="_blank">how to choose a pay schedule.</ScheduleLink>`;
const listDescription2 = 'Why do we need to ask for this? We need to know when to pay your employees. Some states have <PaymentLawLink href="https://www.dol.gov/agencies/whd/state/payday" target="_blank">laws around when you must pay your employees.</PaymentLawLink> Please choose pay schedules that are legal for your employees.';
const addAnotherPayScheduleCta = "+ Add another pay schedule";
const saveAndContinueCta = "Save & continue";
const continueCta = "Continue";
const pleaseVerify = "Please make sure to verify this information is accurate. If this information isn't correct, it can delay when your team will be paid.";
const payScheduleList = { "name": "Name", "actions": "Actions", "active": "Active", "inactive": "Inactive", "edit": "Edit" };
const payScheduleListLabel = "Pay schedules";
const headings = { "addPaySchedule": "Add pay schedule", "editPaySchedule": "Edit pay schedule", "pageTitle": "Set up pay schedule" };
const labels = { "name": "Name", "payfrequency": "Pay frequency", "frequency": "Frequency", "frequencyPlaceholder": "Select frequency...", "deadline": "Deadline to run payroll", "frequencyOptions": "Frequency Options", "firstPayDate": "First pay date", "firstPayPeriodEndDate": "First pay period end date", "firstPayDayOfTheMonth": "First pay day of the month", "lastPayDayOfTheMonth": "Last pay day of the month", "preview": "Preview", "legend": "Legend", "workweekStartDay": "Workweek start day", "workweekStartDayPlaceholder": "Select day..." };
const loading = "Loading...";
const descriptions = { "frequencyOptionsDescription": "Select the pay days for the month.", "anchorPayDateDescription_one": "Please account for the {{count}} day it will take to process payroll.", "anchorPayDateDescription_other": "Please account for the {{count}} days it will take to process payroll.", "anchorEndOfPayPeriodDescription": "The last date of the first pay period to help calculate future pay periods. This can be the same date as the first pay date.", "workweekStartDayDescription": "The day of the week this pay schedule's workweeks start on. Used for regular rate of pay overtime calculations." };
const payPreview = { "payPeriod": "Pay period", "payday": "Payday", "payrollDeadline": "Run payroll by 4:00PM (PDT) on " };
const actions = { "cancel": "Cancel", "save": "Save" };
const frequencies = { "everyWeek": "Every week", "everyOtherWeek": "Every other week", "twicePerMonth": "Twice per month", "monthly": "Monthly" };
const frequencyOptions = { "15thAndLast": "15th and Last day of the month", "custom": "Custom" };
const workweekStartDayOptions = { "sunday": "Sunday", "monday": "Monday", "tuesday": "Tuesday", "wednesday": "Wednesday", "thursday": "Thursday", "friday": "Friday", "saturday": "Saturday" };
const validations = { "name": "Pay schedule name is required", "frequency": "Pay frequency is required", "frequencyOptions": "Please select the pay days for the month", "firstPayDate": "First pay date is required", "firstPayPeriodEndDate": "First pay period end date is required", "firstPayDayOfTheMonth": "First pay day of the month is required", "lastPayDayOfTheMonth": "Last pay day of the month is required", "dayRange": "Must be between 1 and 31" };
const previewAlert = { "title": "Pay Schedule Preview", "description": "Complete all the required fields to see a preview of your pay schedule." };
const Company_PaySchedule = {
  listDescription,
  listDescription2,
  addAnotherPayScheduleCta,
  saveAndContinueCta,
  continueCta,
  pleaseVerify,
  payScheduleList,
  payScheduleListLabel,
  headings,
  labels,
  loading,
  descriptions,
  payPreview,
  actions,
  frequencies,
  frequencyOptions,
  workweekStartDayOptions,
  validations,
  previewAlert
};
export {
  actions,
  addAnotherPayScheduleCta,
  continueCta,
  Company_PaySchedule as default,
  descriptions,
  frequencies,
  frequencyOptions,
  headings,
  labels,
  listDescription,
  listDescription2,
  loading,
  payPreview,
  payScheduleList,
  payScheduleListLabel,
  pleaseVerify,
  previewAlert,
  saveAndContinueCta,
  validations,
  workweekStartDayOptions
};
