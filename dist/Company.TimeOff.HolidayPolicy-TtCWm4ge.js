const title = "Choose your company holidays";
const description = "Choose which holidays your company observes and we'll automatically add those hours when you run payroll.";
const backCta = "Back";
const continueCta = "Continue";
const tableHeaders = { "holidayName": "Holiday", "observedDate": "Observed date", "nextObservation": "Next observation" };
const tableLabel = "Company holidays";
const editEmployees = { "title": "Add employees to your policy" };
const show = { "title": "Holiday pay policy", "addEmployeesCta": "Add employees", "editPolicyCta": "Edit policy" };
const tabs = { "holidays": "Holidays" };
const holidayScheduleTable = { "title": "Holiday schedule", "editCta": "Edit" };
const holidays = { "newYearsDay": { "name": "New Year's Day", "observedDate": "January 1" }, "mlkDay": { "name": "Martin Luther King, Jr. Day", "observedDate": "Third Monday in January" }, "presidentsDay": { "name": "Presidents' Day", "observedDate": "Third Monday in February" }, "memorialDay": { "name": "Memorial Day", "observedDate": "Last Monday in May" }, "juneteenth": { "name": "Juneteenth", "observedDate": "June 19" }, "independenceDay": { "name": "Independence Day", "observedDate": "July 4" }, "laborDay": { "name": "Labor Day", "observedDate": "First Monday in September" }, "columbusDay": { "name": "Columbus Day (Indigenous Peoples' Day)", "observedDate": "Second Monday in October" }, "veteransDay": { "name": "Veterans Day", "observedDate": "November 11" }, "thanksgiving": { "name": "Thanksgiving", "observedDate": "Fourth Thursday in November" }, "christmasDay": { "name": "Christmas Day", "observedDate": "December 25" } };
const flash = { "deleted": "Holiday pay policy deleted successfully", "employeesAdded_one": "{{count}} employee has been added to this policy.", "employeesAdded_other": "{{count}} employees have been added to this policy.", "employeeRemoved": "{{name}} has been removed from the policy.", "employeesRemoved_one": "{{count}} employee has been removed from the policy.", "employeesRemoved_other": "{{count}} employees have been removed from the policy." };
const Company_TimeOff_HolidayPolicy = {
  title,
  description,
  backCta,
  continueCta,
  tableHeaders,
  tableLabel,
  editEmployees,
  show,
  tabs,
  holidayScheduleTable,
  holidays,
  flash
};
export {
  backCta,
  continueCta,
  Company_TimeOff_HolidayPolicy as default,
  description,
  editEmployees,
  flash,
  holidayScheduleTable,
  holidays,
  show,
  tableHeaders,
  tableLabel,
  tabs,
  title
};
