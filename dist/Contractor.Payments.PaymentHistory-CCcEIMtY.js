const title = "Contractor payment history";
const subtitle = "Payments debited on <strong>{{date}}</strong>";
const paymentsSection = "Payments";
const breadcrumbLabel = "Payment history";
const noPaymentsFound = "No payments found";
const noPaymentsDescription = "There are no payments for this date.";
const perHour = "/hr";
const na = "N/A";
const tableHeaders = { "contractor": "Contractor", "wageType": "Wage", "paymentMethod": "Payment method", "hours": "Hours", "wage": "Fixed amount", "bonus": "Bonus", "reimbursements": "Reimbursements", "total": "Total", "action": "Action" };
const actions = { "view": "View", "cancel": "Cancel payment" };
const errors = { "paymentGroupNotFound": "Contractor payment group not found" };
const Contractor_Payments_PaymentHistory = {
  title,
  subtitle,
  paymentsSection,
  breadcrumbLabel,
  noPaymentsFound,
  noPaymentsDescription,
  perHour,
  na,
  tableHeaders,
  actions,
  errors
};
export {
  actions,
  breadcrumbLabel,
  Contractor_Payments_PaymentHistory as default,
  errors,
  na,
  noPaymentsDescription,
  noPaymentsFound,
  paymentsSection,
  perHour,
  subtitle,
  tableHeaders,
  title
};
