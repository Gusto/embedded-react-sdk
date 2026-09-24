const title = "Employees";
const addEmployeeCta = "Add employee";
const backToListCta = "Back to employees";
const tabsLabel = "Employee status tabs";
const tabs = { "active": "Active", "onboarding": "Onboarding", "dismissed": "Dismissed" };
const nameLabel = "Employee name";
const jobTitleLabel = "Job title";
const startDateLabel = "Start date";
const statusLabel = "Status";
const lastDayLabel = "Last day";
const pendingDismissalLabel = "Pending dismissal";
const pendingDismissalBadge = "Last day {{date}}";
const editCta = "Edit employee";
const dismissCta = "Dismiss employee";
const cancelCta = "Cancel onboarding";
const hamburgerTitle = "Employee actions menu";
const employeeListLabel = "List of employees";
const emptyState = { "active": { "title": "There are no active employees", "description": "Employees who have completed onboarding will appear here" }, "onboarding": { "title": "There are no employees onboarding", "description": "Employees currently being onboarded will appear here" }, "dismissed": { "title": "There are no dismissed employees", "description": "Terminated employees will appear here" } };
const deleteDialog = { "title": "Cancel employee onboarding?", "description": "This will permanently delete this employee from your account. This action cannot be undone.", "confirmCta": "Delete employee", "cancelCta": "Cancel" };
const Employee_ManagementEmployeeList = {
  title,
  addEmployeeCta,
  backToListCta,
  tabsLabel,
  tabs,
  nameLabel,
  jobTitleLabel,
  startDateLabel,
  statusLabel,
  lastDayLabel,
  pendingDismissalLabel,
  pendingDismissalBadge,
  editCta,
  dismissCta,
  cancelCta,
  hamburgerTitle,
  employeeListLabel,
  emptyState,
  deleteDialog
};
export {
  addEmployeeCta,
  backToListCta,
  cancelCta,
  Employee_ManagementEmployeeList as default,
  deleteDialog,
  dismissCta,
  editCta,
  employeeListLabel,
  emptyState,
  hamburgerTitle,
  jobTitleLabel,
  lastDayLabel,
  nameLabel,
  pendingDismissalBadge,
  pendingDismissalLabel,
  startDateLabel,
  statusLabel,
  tabs,
  tabsLabel,
  title
};
