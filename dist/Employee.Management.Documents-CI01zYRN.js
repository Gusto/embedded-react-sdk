const title = "Forms";
const listLabel = "List of employee forms";
const viewCta = "View";
const columns = { "title": "Form", "year": "Year", "status": "Status", "requiresSigning": "Signing status", "actions": "Actions" };
const signingStatus = { "signed": "Signed", "notSigned": "Not signed" };
const status = { "draft": "Draft", "final": "Final" };
const emptyState = { "title": "No forms", "description": "Employee forms will appear here once available" };
const Employee_Management_Documents = {
  title,
  listLabel,
  viewCta,
  columns,
  signingStatus,
  status,
  emptyState
};
export {
  columns,
  Employee_Management_Documents as default,
  emptyState,
  listLabel,
  signingStatus,
  status,
  title,
  viewCta
};
