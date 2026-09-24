const title = "Contractors";
const addContractorCta = "Add contractor";
const backToListCta = "Back to contractors";
const tabsLabel = "Contractor status tabs";
const tabs = { "active": "Active", "onboarding": "Onboarding", "dismissed": "Dismissed" };
const nameLabel = "Contractor name";
const rateLabel = "Rate";
const onboardingStatusLabel = "Onboarding status";
const statusColumnLabel = "Status";
const dismissalDateLabel = "Dismissal date";
const rateHourly = "Hourly — {{rate}}/hr";
const startsBadge = "Starts {{date}}";
const lastDayBadge = "Last day {{date}}";
const editCta = "Edit";
const reviewCta = "Review";
const continueCta = "Continue";
const viewDetailsCta = "View details";
const removeCta = "Remove";
const dismissCta = "Dismiss contractor";
const rehireCta = "Rehire contractor";
const cancelSelfOnboardingCta = "Cancel self-onboarding";
const cancelDismissalCta = "Cancel dismissal";
const cancelRehireCta = "Cancel rehire";
const hamburgerTitle = "Actions for {{name}}";
const contractorListLabel = "List of contractors";
const emptyState = { "active": { "title": "There are no active contractors", "description": "Contractors who have completed onboarding will appear here" }, "onboarding": { "title": "There are no contractors onboarding", "description": "Contractors currently being onboarded will appear here" }, "dismissed": { "title": "There are no dismissed contractors", "description": "Dismissed contractors will appear here" } };
const removeDialog = { "title": "Remove contractor?", "description": "This will permanently delete this contractor from your account. This action cannot be undone.", "confirmCta": "Remove contractor", "cancelCta": "Cancel" };
const cancelDismissalDialog = { "title": "Cancel dismissal?", "description": "This contractor's scheduled dismissal will be removed and they will remain active.", "confirmCta": "Yes, cancel dismissal", "cancelCta": "No, go back" };
const cancelRehireDialog = { "title": "Cancel rehire?", "description": "This contractor's scheduled rehire will be removed.", "confirmCta": "Yes, cancel rehire", "cancelCta": "No, go back" };
const Contractor_ManagementContractorList = {
  title,
  addContractorCta,
  backToListCta,
  tabsLabel,
  tabs,
  nameLabel,
  rateLabel,
  onboardingStatusLabel,
  statusColumnLabel,
  dismissalDateLabel,
  rateHourly,
  startsBadge,
  lastDayBadge,
  editCta,
  reviewCta,
  continueCta,
  viewDetailsCta,
  removeCta,
  dismissCta,
  rehireCta,
  cancelSelfOnboardingCta,
  cancelDismissalCta,
  cancelRehireCta,
  hamburgerTitle,
  contractorListLabel,
  emptyState,
  removeDialog,
  cancelDismissalDialog,
  cancelRehireDialog
};
export {
  addContractorCta,
  backToListCta,
  cancelDismissalCta,
  cancelDismissalDialog,
  cancelRehireCta,
  cancelRehireDialog,
  cancelSelfOnboardingCta,
  continueCta,
  contractorListLabel,
  Contractor_ManagementContractorList as default,
  dismissCta,
  dismissalDateLabel,
  editCta,
  emptyState,
  hamburgerTitle,
  lastDayBadge,
  nameLabel,
  onboardingStatusLabel,
  rateHourly,
  rateLabel,
  rehireCta,
  removeCta,
  removeDialog,
  reviewCta,
  startsBadge,
  statusColumnLabel,
  tabs,
  tabsLabel,
  title,
  viewDetailsCta
};
