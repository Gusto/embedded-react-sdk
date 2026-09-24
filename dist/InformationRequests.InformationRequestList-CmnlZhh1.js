const title = "Information requests";
const description = "We need you to share some more information about your business. This info will be used to keep your business secure and ensure that our data about your company is correct. Please make sure to do this soon since it may otherwise impact your ability to run payroll.";
const emptyTableTitle = "No information requests";
const emptyTableDescription = "There are no information requests that need your response at this time.";
const columns = { "type": "Type", "status": "Status" };
const types = { "companyOnboarding": "Company Onboarding", "accountProtection": "Account Protection", "paymentRequest": "Payment Request", "paymentError": "Payment Error", "unknown": "Information Request" };
const status = { "incomplete": "Incomplete", "underReview": "Under review", "payrollBlocking": "Payroll blocking" };
const cta = { "respond": "Respond" };
const InformationRequests_InformationRequestList = {
  title,
  description,
  emptyTableTitle,
  emptyTableDescription,
  columns,
  types,
  status,
  cta
};
export {
  columns,
  cta,
  InformationRequests_InformationRequestList as default,
  description,
  emptyTableDescription,
  emptyTableTitle,
  status,
  title,
  types
};
